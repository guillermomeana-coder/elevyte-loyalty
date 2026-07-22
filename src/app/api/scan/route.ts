import { NextRequest, NextResponse } from "next/server";
import { eq, and, gt, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  cardEnrollments,
  loyaltyCards,
  scans,
  cardLevels,
  customers,
  businesses,
} from "../../../../drizzle/schema";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { enrollmentId, scanType, stampsAdded, spendAmount } = body;

    if (!enrollmentId || !scanType) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    // Get enrollment with card
    const [enrollment] = await db
      .select()
      .from(cardEnrollments)
      .where(eq(cardEnrollments.id, enrollmentId))
      .limit(1);

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment no encontrado" }, { status: 404 });
    }

    const [card] = await db
      .select()
      .from(loyaltyCards)
      .where(eq(loyaltyCards.id, enrollment.cardId))
      .limit(1);

    if (!card) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    // Check scan limits
    if (card.scanLimitEnabled && card.scanLimitCount && card.scanLimitPeriod) {
      const periodMs: Record<string, number> = {
        minute: 60 * 1000,
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      };
      const ms = periodMs[card.scanLimitPeriod] || periodMs.day;
      const since = new Date(Date.now() - ms);

      const [scanCount] = await db
        .select({ count: count() })
        .from(scans)
        .where(
          and(
            eq(scans.enrollmentId, enrollmentId),
            gt(scans.createdAt, since)
          )
        );

      if ((scanCount?.count || 0) >= card.scanLimitCount) {
        return NextResponse.json(
          { error: "Límite de escaneos alcanzado" },
          { status: 429 }
        );
      }
    }

    // Insert scan
    await db.insert(scans).values({
      enrollmentId,
      scannedBy: user.id,
      scanType,
      stampsAdded: scanType === "stamp" ? (stampsAdded || 1) : null,
      spendAmount: scanType === "spend" ? spendAmount : null,
    });

    // Update enrollment
    const updates: Record<string, unknown> = {
      lastVisitAt: new Date(),
      totalVisits: (enrollment.totalVisits || 0) + 1,
      updatedAt: new Date(),
    };

    if (scanType === "stamp") {
      const added = stampsAdded || 1;
      let newStamps = (enrollment.currentStamps || 0) + added;
      updates.totalStamps = (enrollment.totalStamps || 0) + added;

      // Check completion
      if (card.totalStamps && newStamps >= card.totalStamps) {
        if (card.completionBehavior === "reset") {
          newStamps = 0;
          updates.completions = (enrollment.completions || 0) + 1;
        } else if (card.completionBehavior === "limit") {
          newStamps = card.totalStamps;
        }
        // "unlimited" just keeps counting
      }
      updates.currentStamps = newStamps;
    }

    if (scanType === "spend" && spendAmount) {
      const newTotal = Number(enrollment.totalSpend || 0) + Number(spendAmount);
      updates.totalSpend = String(newTotal);

      // Recalculate level
      const levels = await db
        .select()
        .from(cardLevels)
        .where(eq(cardLevels.cardId, card.id))
        .orderBy(cardLevels.sortOrder);

      let currentLevel = levels[0];
      for (const level of levels) {
        if (newTotal >= Number(level.minSpend)) {
          currentLevel = level;
        }
      }
      if (currentLevel) {
        updates.currentLevelId = currentLevel.id;
      }
    }

    await db
      .update(cardEnrollments)
      .set(updates)
      .where(eq(cardEnrollments.id, enrollmentId));

    // Get customer name for response
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, enrollment.customerId))
      .limit(1);

    // Check review request trigger
    let reviewRequest = null;
    const newVisits = (updates.totalVisits as number) || (enrollment.totalVisits || 0) + 1;
    const [biz] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, card.businessId))
      .limit(1);

    if (
      biz?.reviewRequestEnabled &&
      biz?.googleReviewUrl &&
      biz?.reviewRequestAfterVisits &&
      newVisits === biz.reviewRequestAfterVisits
    ) {
      reviewRequest = {
        message: biz.reviewRequestMessage || "Nos encantaria que nos dejes una resena!",
        url: biz.googleReviewUrl,
      };
    }

    return NextResponse.json({
      success: true,
      reviewRequest,
      customer: {
        name: `${customer?.firstName || ""} ${customer?.lastName || ""}`.trim(),
      },
      enrollment: {
        currentStamps: updates.currentStamps ?? enrollment.currentStamps,
        totalStamps: card.totalStamps,
        totalSpend: updates.totalSpend ?? enrollment.totalSpend,
        totalVisits: updates.totalVisits,
      },
    });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Error al escanear" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  registrationLinks,
  customers,
  cardEnrollments,
  loyaltyCards,
  cardLevels,
} from "../../../../drizzle/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, firstName, lastName, email, phone } = body;

    if (!slug || !firstName || !email) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    // Find registration link
    const [link] = await db
      .select()
      .from(registrationLinks)
      .where(eq(registrationLinks.slug, slug))
      .limit(1);

    if (!link || !link.isActive) {
      return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });
    }

    // Get card
    const [card] = await db
      .select()
      .from(loyaltyCards)
      .where(eq(loyaltyCards.id, link.cardId))
      .limit(1);

    if (!card || card.status !== "active") {
      return NextResponse.json({ error: "Programa no disponible" }, { status: 404 });
    }

    // Upsert customer
    let customer;
    const [existing] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing && existing.businessId === card.businessId) {
      customer = existing;
    } else {
      const [created] = await db
        .insert(customers)
        .values({
          businessId: card.businessId,
          firstName,
          lastName: lastName || null,
          email: email.toLowerCase().trim(),
          phone: phone || null,
        })
        .returning();
      customer = created;
    }

    // Check if already enrolled
    const [existingEnrollment] = await db
      .select()
      .from(cardEnrollments)
      .where(eq(cardEnrollments.customerId, customer.id))
      .limit(1);

    if (existingEnrollment && existingEnrollment.cardId === card.id) {
      return NextResponse.json({
        success: true,
        message: "Ya estás registrado en este programa",
        enrollmentId: existingEnrollment.id,
      });
    }

    // Get initial level for level cards
    let initialLevelId = null;
    if (card.type === "levels") {
      const [initialLevel] = await db
        .select()
        .from(cardLevels)
        .where(eq(cardLevels.cardId, card.id))
        .orderBy(cardLevels.sortOrder)
        .limit(1);
      initialLevelId = initialLevel?.id || null;
    }

    // Create enrollment
    const passSerial = `${card.id}-${customer.id}-${Date.now()}`;
    const [enrollment] = await db
      .insert(cardEnrollments)
      .values({
        customerId: customer.id,
        cardId: card.id,
        currentStamps: 0,
        totalStamps: 0,
        completions: 0,
        currentLevelId: initialLevelId,
        totalSpend: "0",
        registrationLinkId: link.id,
        passSerial,
        totalVisits: 0,
      })
      .returning();

    // Update link stats
    await db
      .update(registrationLinks)
      .set({
        registrations: (link.registrations || 0) + 1,
      })
      .where(eq(registrationLinks.id, link.id));

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      cardName: card.name,
      cardType: card.type,
      welcomeMessage: card.welcomeMessage,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 });
  }
}

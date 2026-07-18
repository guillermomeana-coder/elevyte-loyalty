import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cardEnrollments,
  loyaltyCards,
  customers,
  passDesigns,
  businesses,
} from "../../../../../../../drizzle/schema";
import { generateApplePass, isAppleWalletConfigured } from "@/lib/apple-wallet";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  const { enrollmentId } = await params;
  const id = Number(enrollmentId);

  if (!isAppleWalletConfigured()) {
    return NextResponse.json(
      { error: "Apple Wallet no configurado. Necesita certificados de Apple Developer." },
      { status: 503 }
    );
  }

  const [enrollment] = await db
    .select()
    .from(cardEnrollments)
    .where(eq(cardEnrollments.id, id))
    .limit(1);

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment no encontrado" }, { status: 404 });
  }

  const [card] = await db.select().from(loyaltyCards).where(eq(loyaltyCards.id, enrollment.cardId)).limit(1);
  const [customer] = await db.select().from(customers).where(eq(customers.id, enrollment.customerId)).limit(1);
  const [design] = await db.select().from(passDesigns).where(eq(passDesigns.cardId, enrollment.cardId)).limit(1);
  const [business] = card ? await db.select().from(businesses).where(eq(businesses.id, card.businessId)).limit(1) : [null];

  if (!card || !customer || !business) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 404 });
  }

  const passBuffer = await generateApplePass({
    serialNumber: enrollment.passSerial || `pass-${id}`,
    cardName: card.name,
    cardType: card.type as "stamps" | "levels",
    customerName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
    businessName: business.name,
    currentStamps: enrollment.currentStamps || 0,
    totalStamps: card.totalStamps || 10,
    completions: enrollment.completions || 0,
    currentLevel: undefined, // TODO: resolve level name
    totalSpend: enrollment.totalSpend || "0",
    currency: card.currency || "ARS",
    backgroundColor: design?.backgroundColor || "#4a7c59",
    foregroundColor: design?.foregroundColor || "#ffffff",
    labelColor: design?.labelColor || "#e0e0e0",
    logoUrl: design?.logoImage || undefined,
    stripUrl: design?.stripImage || undefined,
    geopushEnabled: card.geopushEnabled || false,
    geopushMessage: card.geopushMessage || undefined,
    latitude: card.geopushLatitude ? Number(card.geopushLatitude) : undefined,
    longitude: card.geopushLongitude ? Number(card.geopushLongitude) : undefined,
  });

  if (!passBuffer) {
    return NextResponse.json({ error: "Error generando pass" }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(passBuffer), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${card.name}.pkpass"`,
    },
  });
}

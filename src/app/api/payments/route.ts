import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, subscriptionPlans } from "../../../../drizzle/schema";
import { getCurrentUser } from "@/lib/auth";
import { createPayment } from "@/lib/crypto-payments";

// POST: Create a new payment
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.agencyId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { planId } = await request.json();

    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan no disponible" }, { status: 404 });
    }

    const payment = await createPayment(
      user.agencyId,
      plan.id,
      plan.priceUsdt,
      user.id
    );

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        address: payment.paymentAddress,
        amount: payment.amountUsdt,
        expiresAt: payment.expiresAt,
      },
      plan: {
        name: plan.name,
        maxLocations: plan.maxLocations,
        maxCards: plan.maxCards,
      },
    });
  } catch (err) {
    console.error("[PAYMENT] Error:", err);
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 });
  }
}

// GET: Check payment status
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const paymentId = request.nextUrl.searchParams.get("id");
  if (!paymentId) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, Number(paymentId)))
    .limit(1);

  if (!payment) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json({
    status: payment.status,
    confirmedAt: payment.confirmedAt,
    txHash: payment.txHash,
  });
}

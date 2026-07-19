import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "../../../../drizzle/schema";
import { verifyPayment } from "@/lib/crypto-payments";

// Cron job — runs every 1 minute via Vercel Cron
// Checks all pending payments for USDT balance
export async function GET(request: NextRequest) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pendingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.status, "pending"));

    let confirmed = 0;
    let expired = 0;
    let checked = 0;

    for (const payment of pendingPayments) {
      checked++;
      const result = await verifyPayment(payment.id);
      if (result) {
        confirmed++;
      } else {
        // Check if expired
        if (payment.expiresAt && new Date() > new Date(payment.expiresAt)) {
          expired++;
        }
      }
    }

    console.log(`[CRON] Checked ${checked} payments: ${confirmed} confirmed, ${expired} expired`);

    return NextResponse.json({
      ok: true,
      checked,
      confirmed,
      expired,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[CRON] Error:", err);
    return NextResponse.json({ error: "Cron error" }, { status: 500 });
  }
}

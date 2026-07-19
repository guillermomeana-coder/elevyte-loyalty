import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments, subscriptionPlans } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CheckoutUI } from "./checkout-ui";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  await requireAuth();
  const { paymentId } = await params;
  const id = Number(paymentId);

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id))
    .limit(1);

  if (!payment) notFound();

  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, payment.planId))
    .limit(1);

  return (
    <CheckoutUI
      paymentId={payment.id}
      address={payment.paymentAddress}
      amount={payment.amountUsdt}
      planName={plan?.name || "Plan"}
      status={payment.status || "pending"}
      expiresAt={payment.expiresAt?.toISOString() || ""}
    />
  );
}

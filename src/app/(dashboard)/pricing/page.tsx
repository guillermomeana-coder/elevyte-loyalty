import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptionPlans } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PricingCards } from "./pricing-cards";

export default async function PricingPage() {
  const user = await requireAuth();

  const plans = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.sortOrder);

  const currentPlan = user.agency?.plan || "starter";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Planes y Precios</h1>
        <p className="text-muted-foreground mt-1">
          Elegí el plan que mejor se adapte a tu negocio. Pagá con USDT (BSC).
        </p>
      </div>
      <PricingCards plans={plans} currentPlan={currentPlan} />
    </div>
  );
}

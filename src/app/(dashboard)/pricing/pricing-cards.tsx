"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Plan {
  id: number;
  name: string;
  slug: string;
  priceUsdt: string;
  maxLocations: number;
  maxCards: number;
  features: unknown;
}

export function PricingCards({
  plans,
  currentPlan,
}: {
  plans: Plan[];
  currentPlan: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function handleSelect(planId: number) {
    setLoading(planId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error");
        return;
      }
      router.push(`/checkout/${data.payment.id}`);
    } catch {
      toast.error("Error al crear pago");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const isCurrent = plan.slug === currentPlan;
        const isPro = plan.slug === "pro";
        return (
          <Card
            key={plan.id}
            className={`relative ${isPro ? "border-orange-500 border-2 shadow-lg" : ""}`}
          >
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${Number(plan.priceUsdt).toFixed(0)}
                </span>
                <span className="text-muted-foreground ml-1">USDT/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {plan.maxLocations} ubicación{plan.maxLocations > 1 ? "es" : ""}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {plan.maxCards} tarjetas de lealtad
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  QR Scanner
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Push notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Apple & Google Wallet
                </li>
                {plan.maxLocations >= 5 && (
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Menú digital
                  </li>
                )}
                {plan.maxLocations >= 20 && (
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Soporte prioritario
                  </li>
                )}
              </ul>

              {isCurrent ? (
                <Button disabled className="w-full" variant="outline">
                  Plan actual
                </Button>
              ) : (
                <Button
                  className={`w-full ${isPro ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                  onClick={() => handleSelect(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? "Procesando..." : "Seleccionar"}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LoyaltyCard {
  id: number;
  name: string;
  type: string;
  status: string | null;
  totalStamps: number | null;
  currency: string | null;
  customerCount: number;
}

export function CardsGrid({ cards }: { cards: LoyaltyCard[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = cards.filter((c) => {
    if (filter === "all") return true;
    return c.type === filter;
  });

  return (
    <Tabs value={filter} onValueChange={setFilter}>
      <TabsList>
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="stamps">Estampillas</TabsTrigger>
        <TabsTrigger value="levels">Niveles</TabsTrigger>
      </TabsList>

      <TabsContent value={filter} className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((card) => (
            <Link key={card.id} href={`/fidelidad/${card.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          card.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="font-semibold">{card.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.type === "stamps" ? "Estampillas" : "Niveles"}
                    </Badge>
                  </div>

                  <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-lg p-4 text-white mb-4">
                    <p className="text-xs opacity-80">CLUB</p>
                    <p className="font-bold text-lg">{card.name}</p>
                    {card.type === "stamps" && (
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: Math.min(card.totalStamps || 10, 10) }).map(
                          (_, i) => (
                            <span
                              key={i}
                              className="h-5 w-5 rounded-full border border-white/50 flex items-center justify-center text-[10px]"
                            >
                              ☕
                            </span>
                          )
                        )}
                      </div>
                    )}
                    {card.type === "levels" && (
                      <p className="text-sm mt-2 opacity-80">
                        {card.currency || "ARS"}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{card.customerCount} clientes</span>
                    <span>
                      {card.status === "active" ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No hay tarjetas{filter !== "all" ? ` de tipo ${filter === "stamps" ? "estampillas" : "niveles"}` : ""}. Crea una para empezar.
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

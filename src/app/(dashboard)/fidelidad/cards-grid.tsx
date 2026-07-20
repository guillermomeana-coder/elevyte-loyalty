"use client";

import { useState } from "react";
import Link from "next/link";
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

      <TabsContent value={filter} className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((card) => (
            <Link key={card.id} href={`/fidelidad/${card.id}`}>
              <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                {/* Card body */}
                <div
                  className="p-5 pb-6"
                  style={{
                    background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-transparent ${
                          card.status === "active"
                            ? "bg-emerald-400 ring-emerald-400/30"
                            : "bg-gray-500 ring-gray-500/30"
                        }`}
                      />
                      <span className="text-white/90 font-semibold text-sm">{card.name}</span>
                    </div>
                    <Badge
                      className={`text-[10px] font-medium border-0 ${
                        card.type === "stamps"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {card.type === "stamps" ? "Sellos" : "Niveles"}
                    </Badge>
                  </div>

                  {/* Visual */}
                  <div className="bg-white/[0.06] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
                    {card.type === "stamps" ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {Array.from({ length: Math.min(card.totalStamps || 10, 10) }).map(
                            (_, i) => (
                              <div
                                key={i}
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] transition-all ${
                                  i < 3
                                    ? "bg-amber-400/30 border-2 border-amber-400 text-amber-300"
                                    : "bg-white/5 border-2 border-white/10 text-white/20"
                                }`}
                              >
                                {i < 3 ? "✓" : ""}
                              </div>
                            )
                          )}
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/30 uppercase tracking-wider">Sellos: 3/{card.totalStamps || 10}</span>
                          <span className="text-amber-400/60 uppercase tracking-wider">Activa</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-1.5 justify-center">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                n <= 2
                                  ? "bg-purple-500/40 border-2 border-purple-400 text-purple-200"
                                  : "bg-white/5 border-2 border-white/10 text-white/20"
                              }`}
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/30 uppercase tracking-wider">Nivel 2 de 5</span>
                          <span className="text-purple-400/60 uppercase tracking-wider">{card.currency || "ARS"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 text-[8px] text-white/40 flex items-center justify-center"
                          >
                            {["J", "M", "S"][i]}
                          </div>
                        ))}
                      </div>
                      <span className="text-white/40 text-xs ml-1">{card.customerCount} clientes</span>
                    </div>
                    <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors">
                      Ver detalles →
                    </span>
                  </div>
                </div>

                {/* Subtle glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: card.type === "stamps"
                      ? "inset 0 0 60px rgba(245, 158, 11, 0.05)"
                      : "inset 0 0 60px rgba(168, 85, 247, 0.05)"
                  }}
                />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                  {filter === "stamps" ? "☕" : filter === "levels" ? "⭐" : "🃏"}
                </div>
                <p className="text-muted-foreground">
                  No hay tarjetas{filter !== "all" ? ` de tipo ${filter === "stamps" ? "estampillas" : "niveles"}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">Crea una para empezar</p>
              </div>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

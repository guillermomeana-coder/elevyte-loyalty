import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { passDesigns, loyaltyCards } from "../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Builder } from "./builder";

export default async function PassBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const cardId = Number(id);

  const [card] = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.id, cardId))
    .limit(1);

  if (!card) notFound();

  const [design] = await db
    .select()
    .from(passDesigns)
    .where(eq(passDesigns.cardId, cardId))
    .limit(1);

  if (!design) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <a href={`/fidelidad/${cardId}`} className="text-orange-500 hover:underline">
          ← Volver a {card.name}
        </a>
      </div>
      <h1 className="text-2xl font-bold">Editor de Diseño — {card.name}</h1>
      <Builder
        cardId={cardId}
        cardType={card.type}
        cardName={card.name}
        totalStamps={card.totalStamps || 10}
        design={{
          backgroundColor: design.backgroundColor || "#4a7c59",
          foregroundColor: design.foregroundColor || "#ffffff",
          labelColor: design.labelColor || "#e0e0e0",
          backgroundImage: design.backgroundImage,
          logoImage: design.logoImage,
          stripImage: design.stripImage,
        }}
      />
    </div>
  );
}

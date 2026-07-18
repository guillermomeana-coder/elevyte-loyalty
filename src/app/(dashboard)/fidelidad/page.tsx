import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { loyaltyCards, cardEnrollments } from "../../../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { CardsGrid } from "./cards-grid";
import { CreateCardDialog } from "./create-card-dialog";

export default async function FidelidadPage() {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;

  let cards: {
    id: number;
    name: string;
    type: string;
    status: string | null;
    totalStamps: number | null;
    currency: string | null;
    createdAt: Date | null;
    customerCount: number;
  }[] = [];

  if (businessId) {
    const cardsList = await db
      .select()
      .from(loyaltyCards)
      .where(eq(loyaltyCards.businessId, businessId));

    cards = await Promise.all(
      cardsList.map(async (card) => {
        const [result] = await db
          .select({ count: count() })
          .from(cardEnrollments)
          .where(eq(cardEnrollments.cardId, card.id));
        return {
          id: card.id,
          name: card.name,
          type: card.type,
          status: card.status,
          totalStamps: card.totalStamps,
          currency: card.currency,
          createdAt: card.createdAt,
          customerCount: result?.count || 0,
        };
      })
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tarjetas de Lealtad</h1>
          <p className="text-muted-foreground">
            Acá gestiona tus tarjetas, recompensas, etc
          </p>
        </div>
        <CreateCardDialog />
      </div>
      <CardsGrid cards={cards} />
    </div>
  );
}

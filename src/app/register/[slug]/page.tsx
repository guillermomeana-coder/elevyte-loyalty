import { db } from "@/lib/db";
import { registrationLinks, loyaltyCards, businesses } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { RegistrationForm } from "./registration-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [link] = await db
    .select()
    .from(registrationLinks)
    .where(eq(registrationLinks.slug, slug))
    .limit(1);

  if (!link || !link.isActive) notFound();

  // Increment clicks
  await db
    .update(registrationLinks)
    .set({ clicks: (link.clicks || 0) + 1 })
    .where(eq(registrationLinks.id, link.id));

  const [card] = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.id, link.cardId))
    .limit(1);

  if (!card || card.status !== "active") notFound();

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, card.businessId))
    .limit(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          {business?.logoUrl && (
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-16 w-16 rounded-xl mx-auto mb-3 object-cover"
            />
          )}
          <h1 className="text-2xl font-bold">{card.name}</h1>
          <p className="text-muted-foreground mt-1">
            Únete a nuestro programa de fidelidad
          </p>
        </div>

        <RegistrationForm
          slug={slug}
          cardName={card.name}
          cardType={card.type}
          businessName={business?.name || ""}
        />
      </div>
    </div>
  );
}

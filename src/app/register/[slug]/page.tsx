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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background subtle grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 rounded-3xl blur-2xl" />

        <div className="relative">
          <div className="text-center mb-8">
            {business?.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-16 w-16 rounded-2xl mx-auto mb-4 object-cover shadow-lg shadow-orange-500/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                {(business?.name || card.name).slice(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-2xl font-bold text-white tracking-tight">{card.name}</h1>
            <p className="text-white/40 mt-1 text-sm">
              Unite al programa de fidelidad de {business?.name || ""}
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
    </div>
  );
}

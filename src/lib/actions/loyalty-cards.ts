"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  loyaltyCards,
  passDesigns,
  cardLevels,
  registrationLinks,
} from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function createLoyaltyCard(formData: FormData) {
  const user = await requireAuth();
  const businessId =
    user.business?.id || user.allBusinesses[0]?.id;
  if (!businessId) throw new Error("No business");

  const name = formData.get("name") as string;
  const type = formData.get("type") as "stamps" | "levels";

  const [card] = await db
    .insert(loyaltyCards)
    .values({
      businessId,
      type,
      name,
      language: "es",
      status: "active",
      totalStamps: type === "stamps" ? 10 : null,
      completionBehavior: type === "stamps" ? "reset" : null,
      stampIcon: type === "stamps" ? "coffee" : null,
      currency: type === "levels" ? "ARS" : null,
      termsAndConditions:
        "El cliente acepta que los premios pueden cambiar en el futuro\nLos premios están sujetos a disponibilidad\nLa participación en el programa es voluntaria",
      welcomeMessage: `¡Bienvenido a ${name}! Gracias por unirte a nuestro programa de fidelidad`,
    })
    .returning();

  // Create default pass design
  await db.insert(passDesigns).values({
    cardId: card.id,
    backgroundColor: "#4a7c59",
    foregroundColor: "#ffffff",
    labelColor: "#e0e0e0",
  });

  // Create default registration link
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${card.id}`;
  await db.insert(registrationLinks).values({
    cardId: card.id,
    slug,
    name: "Enlace principal",
  });

  // For level cards, create initial level
  if (type === "levels") {
    await db.insert(cardLevels).values({
      cardId: card.id,
      name: "Nivel Inicial",
      sortOrder: 0,
      minSpend: "0",
      isInitial: true,
    });
  }

  revalidatePath("/fidelidad");
  return card;
}

export async function updateLoyaltyCard(cardId: number, data: Record<string, unknown>) {
  await requireAuth();
  await db
    .update(loyaltyCards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(loyaltyCards.id, cardId));
  revalidatePath(`/fidelidad/${cardId}`);
  revalidatePath("/fidelidad");
}

export async function deleteLoyaltyCard(cardId: number) {
  await requireAuth();
  await db.delete(loyaltyCards).where(eq(loyaltyCards.id, cardId));
  revalidatePath("/fidelidad");
  redirect("/fidelidad");
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { cardLevels } from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function createLevel(formData: FormData) {
  await requireAuth();
  const cardId = Number(formData.get("cardId"));

  const existing = await db
    .select()
    .from(cardLevels)
    .where(eq(cardLevels.cardId, cardId));

  await db.insert(cardLevels).values({
    cardId,
    name: formData.get("name") as string,
    sortOrder: existing.length,
    minSpend: formData.get("minSpend") as string || "0",
    isInitial: false,
  });

  revalidatePath(`/fidelidad/${cardId}`);
}

export async function deleteLevel(levelId: number, cardId: number) {
  await requireAuth();
  await db.delete(cardLevels).where(eq(cardLevels.id, levelId));
  revalidatePath(`/fidelidad/${cardId}`);
}

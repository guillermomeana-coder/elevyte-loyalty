"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { rewards } from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function createReward(formData: FormData) {
  await requireAuth();
  const cardId = Number(formData.get("cardId"));

  await db.insert(rewards).values({
    cardId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    stampsRequired: formData.get("stampsRequired")
      ? Number(formData.get("stampsRequired"))
      : null,
    levelId: formData.get("levelId") ? Number(formData.get("levelId")) : null,
    expiryDays: formData.get("expiryDays")
      ? Number(formData.get("expiryDays"))
      : null,
  });

  revalidatePath(`/fidelidad/${cardId}`);
}

export async function deleteReward(rewardId: number, cardId: number) {
  await requireAuth();
  await db.delete(rewards).where(eq(rewards.id, rewardId));
  revalidatePath(`/fidelidad/${cardId}`);
}

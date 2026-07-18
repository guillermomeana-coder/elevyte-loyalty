"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { passDesigns } from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function updatePassDesign(cardId: number, data: Record<string, unknown>) {
  await requireAuth();
  await db
    .update(passDesigns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(passDesigns.cardId, cardId));
  revalidatePath(`/pass-builder/${cardId}`);
  revalidatePath(`/fidelidad/${cardId}`);
}

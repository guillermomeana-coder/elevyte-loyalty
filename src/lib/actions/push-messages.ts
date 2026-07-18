"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pushMessages, pushDeliveries, cardEnrollments } from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function createPushMessage(formData: FormData) {
  await requireAuth();
  const cardId = Number(formData.get("cardId"));

  const [msg] = await db
    .insert(pushMessages)
    .values({
      cardId,
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      status: "draft",
    })
    .returning();

  revalidatePath(`/fidelidad/${cardId}`);
  return msg;
}

export async function sendPushMessage(messageId: number, cardId: number) {
  await requireAuth();

  // Get all enrollments for this card
  const enrollments = await db
    .select()
    .from(cardEnrollments)
    .where(eq(cardEnrollments.cardId, cardId));

  let delivered = 0;

  for (const enrollment of enrollments) {
    // Create delivery record
    await db.insert(pushDeliveries).values({
      messageId,
      enrollmentId: enrollment.id,
      delivered: true,
      deliveredAt: new Date(),
    });
    delivered++;

    // TODO: When Apple certs are configured, call APNs here
    // TODO: When Google Wallet is configured, update loyalty object
  }

  // Update message status
  await db
    .update(pushMessages)
    .set({
      status: "sent",
      sentAt: new Date(),
      deliveredCount: delivered,
    })
    .where(eq(pushMessages.id, messageId));

  revalidatePath(`/fidelidad/${cardId}`);
  return { delivered };
}

export async function deletePushMessage(messageId: number, cardId: number) {
  await requireAuth();
  await db.delete(pushMessages).where(eq(pushMessages.id, messageId));
  revalidatePath(`/fidelidad/${cardId}`);
}

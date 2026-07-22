"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { businesses } from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function updateReviewSettings(formData: FormData) {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;
  if (!businessId) throw new Error("No business");

  const googlePlaceId = formData.get("googlePlaceId") as string || null;
  const reviewRequestEnabled = formData.get("reviewRequestEnabled") === "true";
  const reviewRequestAfterVisits = Number(formData.get("reviewRequestAfterVisits")) || 3;
  const reviewRequestMessage = formData.get("reviewRequestMessage") as string || null;

  // Auto-generate Google review URL from Place ID
  const googleReviewUrl = googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${googlePlaceId}`
    : null;

  await db
    .update(businesses)
    .set({
      googlePlaceId,
      googleReviewUrl,
      reviewRequestEnabled,
      reviewRequestAfterVisits,
      reviewRequestMessage,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId));

  revalidatePath("/reviews");
}

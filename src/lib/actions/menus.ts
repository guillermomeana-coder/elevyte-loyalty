"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  menusPdf,
  menuCategories,
  menuItems,
  clubInvitations,
} from "../../../drizzle/schema";
import { requireAuth } from "@/lib/auth";

export async function uploadMenuPdf(formData: FormData) {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;
  if (!businessId) throw new Error("No business");

  const fileUrl = formData.get("fileUrl") as string;
  const fileName = formData.get("fileName") as string;

  await db.insert(menusPdf).values({ businessId, fileUrl, fileName });
  revalidatePath("/menu-definitivo");
}

export async function deleteMenuPdf(pdfId: number) {
  await requireAuth();
  await db.delete(menusPdf).where(eq(menusPdf.id, pdfId));
  revalidatePath("/menu-definitivo");
}

export async function createCategory(formData: FormData) {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;
  if (!businessId) throw new Error("No business");

  await db.insert(menuCategories).values({
    businessId,
    name: formData.get("name") as string,
  });
  revalidatePath("/menu-definitivo");
}

export async function deleteCategory(categoryId: number) {
  await requireAuth();
  await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));
  revalidatePath("/menu-definitivo");
}

export async function createMenuItem(formData: FormData) {
  await requireAuth();
  const categoryId = Number(formData.get("categoryId"));

  await db.insert(menuItems).values({
    categoryId,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") ? (formData.get("price") as string) : undefined,
    imageUrl: (formData.get("imageUrl") as string) || undefined,
  });
  revalidatePath("/menu-definitivo");
}

export async function deleteMenuItem(itemId: number) {
  await requireAuth();
  await db.delete(menuItems).where(eq(menuItems.id, itemId));
  revalidatePath("/menu-definitivo");
}

export async function updateClubInvitation(formData: FormData) {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;
  if (!businessId) throw new Error("No business");

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    buttonText: formData.get("buttonText") as string,
    isEnabled: formData.get("isEnabled") === "true",
    updatedAt: new Date(),
  };

  const [existing] = await db
    .select()
    .from(clubInvitations)
    .where(eq(clubInvitations.businessId, businessId))
    .limit(1);

  if (existing) {
    await db
      .update(clubInvitations)
      .set(data)
      .where(eq(clubInvitations.id, existing.id));
  } else {
    await db.insert(clubInvitations).values({ ...data, businessId });
  }

  revalidatePath("/menu-definitivo");
}

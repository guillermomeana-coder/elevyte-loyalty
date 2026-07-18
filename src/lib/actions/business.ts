"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { businesses, locations, users } from "../../../drizzle/schema";
import { requireRole } from "@/lib/auth";

export async function createBusiness(formData: FormData) {
  const user = await requireRole(["agency_admin"]);
  if (!user.agencyId) throw new Error("No agency");

  const name = formData.get("name") as string;
  const locationName = formData.get("locationName") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const [business] = await db
    .insert(businesses)
    .values({ agencyId: user.agencyId, name, slug })
    .returning();

  if (locationName) {
    await db.insert(locations).values({
      businessId: business.id,
      name: locationName,
    });
  }

  revalidatePath("/whitelabel-clients");
  return business;
}

export async function updateBusiness(businessId: number, formData: FormData) {
  const user = await requireRole(["agency_admin"]);

  const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!biz || biz.agencyId !== user.agencyId) throw new Error("No autorizado");

  const name = formData.get("name") as string;
  const logoUrl = formData.get("logoUrl") as string | null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (logoUrl !== null) updates.logoUrl = logoUrl;

  await db.update(businesses).set(updates).where(eq(businesses.id, businessId));
  revalidatePath("/whitelabel-clients");
  revalidatePath(`/manage-whitelabel-client/${businessId}`);
}

export async function deleteBusiness(businessId: number) {
  const user = await requireRole(["agency_admin"]);

  const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!biz || biz.agencyId !== user.agencyId) throw new Error("No autorizado");

  await db.delete(businesses).where(eq(businesses.id, businessId));
  revalidatePath("/whitelabel-clients");
}

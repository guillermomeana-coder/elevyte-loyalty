"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { locations, businesses } from "../../../drizzle/schema";
import { requireRole } from "@/lib/auth";

export async function createLocation(formData: FormData) {
  const user = await requireRole(["agency_admin"]);
  const businessId = Number(formData.get("businessId"));

  const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1);
  if (!biz || biz.agencyId !== user.agencyId) throw new Error("No autorizado");

  await db.insert(locations).values({
    businessId,
    name: formData.get("name") as string,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    region: formData.get("region") as string || undefined,
    country: formData.get("country") as string || "ar",
  });

  revalidatePath(`/manage-whitelabel-client/${businessId}`);
}

export async function deleteLocation(locationId: number, businessId: number) {
  await requireRole(["agency_admin"]);
  await db.delete(locations).where(eq(locations.id, locationId));
  revalidatePath(`/manage-whitelabel-client/${businessId}`);
}

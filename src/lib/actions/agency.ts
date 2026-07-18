"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { agencies } from "../../../drizzle/schema";
import { requireRole } from "@/lib/auth";

export async function updateAgency(formData: FormData) {
  const user = await requireRole(["agency_admin"]);
  if (!user.agencyId) throw new Error("No agency");

  const name = formData.get("name") as string;
  const appName = formData.get("appName") as string;
  const logoUrl = formData.get("logoUrl") as string | null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (name) updates.name = name;
  if (appName) updates.appName = appName;
  if (logoUrl) updates.logoUrl = logoUrl;

  await db.update(agencies).set(updates).where(eq(agencies.id, user.agencyId));
  revalidatePath("/my-whitelabel");
}

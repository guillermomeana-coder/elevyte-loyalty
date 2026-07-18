import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "../../../../../drizzle/schema";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "agency_admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, firstName, lastName, password, role, businessId, agencyId } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName,
        lastName,
        role,
        businessId: businessId || null,
        agencyId: agencyId || currentUser.agencyId,
      })
      .returning({ id: users.id, email: users.email });

    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message.includes("unique")) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "Archivo muy grande (máx 2MB)" }, { status: 400 });
  }

  const validTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no soportado" }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}

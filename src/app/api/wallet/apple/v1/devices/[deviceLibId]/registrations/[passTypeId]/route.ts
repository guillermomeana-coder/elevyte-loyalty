import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "../../../../../../../../../../drizzle/schema";

// POST: Register device for push notifications
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceLibId: string; passTypeId: string }> }
) {
  const { deviceLibId } = await params;

  try {
    const body = await request.json();
    const pushToken = body.pushToken;

    // Extract serial from Authorization header
    const authHeader = request.headers.get("Authorization");
    const serial = authHeader?.replace("ApplePass ", "") || "";

    // Store push token - find customer by pass serial
    // In production, we'd have a device_registrations table
    console.log(`[APPLE] Device ${deviceLibId} registered for serial ${serial}, token: ${pushToken}`);

    return new NextResponse(null, { status: 201 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

// DELETE: Unregister device
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceLibId: string; passTypeId: string }> }
) {
  const { deviceLibId } = await params;
  console.log(`[APPLE] Device ${deviceLibId} unregistered`);
  return new NextResponse(null, { status: 200 });
}

// GET: Get serial numbers for device
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ deviceLibId: string; passTypeId: string }> }
) {
  // Return serial numbers associated with this device
  // In production, query device_registrations table
  return NextResponse.json({
    serialNumbers: [],
    lastUpdated: new Date().toISOString(),
  });
}

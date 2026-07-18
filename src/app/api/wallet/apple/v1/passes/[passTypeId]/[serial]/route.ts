import { NextRequest, NextResponse } from "next/server";

// GET: Return latest pass for serial
// Called by Apple Wallet when it receives a push notification
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ passTypeId: string; serial: string }> }
) {
  const { serial } = await params;

  // In production: find enrollment by serial, generate fresh .pkpass, return it
  // For now, redirect to the download endpoint
  console.log(`[APPLE] Pass update requested for serial: ${serial}`);

  return NextResponse.json(
    { error: "Pass update not yet implemented" },
    { status: 501 }
  );
}

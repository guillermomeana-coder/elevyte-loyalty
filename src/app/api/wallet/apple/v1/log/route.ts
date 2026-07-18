import { NextRequest, NextResponse } from "next/server";

// POST: Receive error logs from Apple Wallet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[APPLE WALLET LOG]", JSON.stringify(body.logs || body));
  } catch {
    // Ignore parse errors
  }
  return new NextResponse(null, { status: 200 });
}

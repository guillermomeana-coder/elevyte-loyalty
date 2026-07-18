import { NextRequest, NextResponse } from "next/server";

// POST: Google Wallet callback for status updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[GOOGLE WALLET CALLBACK]", JSON.stringify(body));
  } catch {
    // Ignore
  }
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { businesses } from "../../../../../../drizzle/schema";
import { getCurrentUser } from "@/lib/auth";

// GET: Handle Google OAuth callback
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/reviews?error=google_denied", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.access_token) {
      console.error("[GOOGLE] Token exchange failed:", tokens);
      return NextResponse.redirect(new URL("/reviews?error=token_failed", request.url));
    }

    // Get user's Google Business accounts
    const accountsRes = await fetch(
      "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    let accounts = [];
    if (accountsRes.ok) {
      const data = await accountsRes.json();
      accounts = data.accounts || [];
    }

    // Try to get locations from first account
    let locations: { name: string; placeId: string; title: string }[] = [];
    if (accounts.length > 0) {
      const accountName = accounts[0].name;
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,metadata`,
        {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        }
      );

      if (locRes.ok) {
        const locData = await locRes.json();
        locations = (locData.locations || []).map((loc: Record<string, unknown>) => ({
          name: loc.name as string,
          title: (loc.title as string) || "",
          placeId: ((loc.metadata as Record<string, string>)?.placeId) || "",
        }));
      }
    }

    // Save tokens and first location's placeId to current business
    const businessId = user.business?.id || user.allBusinesses[0]?.id;
    if (businessId) {
      const firstPlaceId = locations.find((l) => l.placeId)?.placeId || "";
      const reviewUrl = firstPlaceId
        ? `https://search.google.com/local/writereview?placeid=${firstPlaceId}`
        : "";

      await db
        .update(businesses)
        .set({
          googlePlaceId: firstPlaceId,
          googleReviewUrl: reviewUrl,
          config: {
            googleTokens: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
            },
            googleAccounts: accounts.map((a: Record<string, string>) => ({ name: a.name, accountName: a.accountName })),
            googleLocations: locations,
          },
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, businessId));
    }

    const locationCount = locations.length;
    return NextResponse.redirect(
      new URL(`/reviews?connected=true&locations=${locationCount}`, request.url)
    );
  } catch (err) {
    console.error("[GOOGLE] OAuth error:", err);
    return NextResponse.redirect(new URL("/reviews?error=server_error", request.url));
  }
}

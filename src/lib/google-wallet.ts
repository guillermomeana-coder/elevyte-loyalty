/**
 * Google Wallet Integration
 *
 * Requires:
 * - GOOGLE_WALLET_ISSUER_ID
 * - GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_WALLET_PRIVATE_KEY (base64)
 *
 * When configured, creates real Google Wallet loyalty passes.
 * Without config, returns null (graceful degradation).
 */

import jwt from "jsonwebtoken";

interface LoyaltyClassData {
  cardId: number;
  cardName: string;
  businessName: string;
  backgroundColor?: string;
  logoUrl?: string;
}

interface LoyaltyObjectData {
  enrollmentId: number;
  cardId: number;
  customerName: string;
  cardType: "stamps" | "levels";
  currentStamps?: number;
  totalStamps?: number;
  currentLevel?: string;
  totalSpend?: string;
  currency?: string;
}

export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_PRIVATE_KEY
  );
}

function getIssuerId(): string {
  return process.env.GOOGLE_WALLET_ISSUER_ID!;
}

export function generateSaveLink(data: LoyaltyObjectData): string | null {
  if (!isGoogleWalletConfigured()) {
    console.log("[GOOGLE WALLET] Not configured, skipping");
    return null;
  }

  try {
    const privateKey = Buffer.from(
      process.env.GOOGLE_WALLET_PRIVATE_KEY!,
      "base64"
    ).toString("utf-8");

    const issuerId = getIssuerId();
    const classId = `${issuerId}.loyalty_card_${data.cardId}`;
    const objectId = `${issuerId}.enrollment_${data.enrollmentId}`;

    const loyaltyObject: Record<string, unknown> = {
      id: objectId,
      classId,
      state: "ACTIVE",
      loyaltyPoints: data.cardType === "stamps"
        ? {
            label: "Sellos",
            balance: {
              int: data.currentStamps || 0,
            },
          }
        : {
            label: "Gasto Total",
            balance: {
              money: {
                currencyCode: data.currency || "ARS",
                micros: String(Number(data.totalSpend || 0) * 1000000),
              },
            },
          },
      accountName: data.customerName,
      accountId: String(data.enrollmentId),
    };

    const claims = {
      iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!,
      aud: "google",
      origins: [],
      typ: "savetowallet",
      payload: {
        loyaltyObjects: [loyaltyObject],
      },
    };

    const token = jwt.sign(claims, privateKey, { algorithm: "RS256" });
    return `https://pay.google.com/gp/v/save/${token}`;
  } catch (err) {
    console.error("[GOOGLE WALLET] Error generating save link:", err);
    return null;
  }
}

export async function createLoyaltyClass(data: LoyaltyClassData): Promise<boolean> {
  if (!isGoogleWalletConfigured()) return false;

  try {
    const { google } = await import("googleapis");
    const privateKey = Buffer.from(
      process.env.GOOGLE_WALLET_PRIVATE_KEY!,
      "base64"
    ).toString("utf-8");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });

    const client = await auth.getClient();
    const issuerId = getIssuerId();
    const classId = `${issuerId}.loyalty_card_${data.cardId}`;

    const loyaltyClass = {
      id: classId,
      issuerName: data.businessName,
      programName: data.cardName,
      programLogo: data.logoUrl
        ? {
            sourceUri: { uri: data.logoUrl },
            contentDescription: { defaultValue: { language: "es", value: data.cardName } },
          }
        : undefined,
      reviewStatus: "UNDER_REVIEW",
      hexBackgroundColor: data.backgroundColor || "#4a7c59",
    };

    // Try to create, if exists update
    try {
      await client.request({
        url: `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/${classId}`,
        method: "PUT",
        data: loyaltyClass,
      });
    } catch {
      await client.request({
        url: "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass",
        method: "POST",
        data: loyaltyClass,
      });
    }

    return true;
  } catch (err) {
    console.error("[GOOGLE WALLET] Error creating class:", err);
    return false;
  }
}

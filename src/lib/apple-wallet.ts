/**
 * Apple Wallet Pass Generation
 *
 * Requires:
 * - APPLE_PASS_TYPE_ID (e.g., pass.com.elevyte.loyalty)
 * - APPLE_TEAM_ID
 * - APPLE_PASS_CERTIFICATE (base64 of .p12)
 * - APPLE_PASS_CERTIFICATE_PASSWORD
 *
 * When certificates are configured, this generates real .pkpass files.
 * Without certificates, it returns null (graceful degradation).
 */

interface PassData {
  serialNumber: string;
  cardName: string;
  cardType: "stamps" | "levels";
  customerName: string;
  businessName: string;
  // Stamps
  currentStamps?: number;
  totalStamps?: number;
  completions?: number;
  // Levels
  currentLevel?: string;
  totalSpend?: string;
  currency?: string;
  // Design
  backgroundColor?: string;
  foregroundColor?: string;
  labelColor?: string;
  logoUrl?: string;
  stripUrl?: string;
  // Geopush
  geopushEnabled?: boolean;
  geopushMessage?: string;
  latitude?: number;
  longitude?: number;
}

export function isAppleWalletConfigured(): boolean {
  return !!(
    process.env.APPLE_PASS_TYPE_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_PASS_CERTIFICATE
  );
}

export async function generateApplePass(data: PassData): Promise<Buffer | null> {
  if (!isAppleWalletConfigured()) {
    console.log("[APPLE WALLET] Not configured, skipping pass generation");
    return null;
  }

  try {
    // Dynamic import to avoid errors when not configured
    const { PKPass } = await import("passkit-generator");

    const certBuffer = Buffer.from(process.env.APPLE_PASS_CERTIFICATE!, "base64");

    const pass = new PKPass(
      {},
      {
        wwdr: Buffer.from(""), // WWDR cert - needs to be provided
        signerCert: certBuffer,
        signerKey: certBuffer,
        signerKeyPassphrase: process.env.APPLE_PASS_CERTIFICATE_PASSWORD,
      },
      {
        serialNumber: data.serialNumber,
        passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID!,
        teamIdentifier: process.env.APPLE_TEAM_ID!,
        organizationName: data.businessName,
        description: data.cardName,
        foregroundColor: data.foregroundColor || "rgb(255, 255, 255)",
        backgroundColor: data.backgroundColor || "rgb(74, 124, 89)",
        labelColor: data.labelColor || "rgb(224, 224, 224)",
      }
    );

    // Set barcode
    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: data.serialNumber,
      messageEncoding: "iso-8859-1",
    });

    // Add fields based on card type
    if (data.cardType === "stamps") {
      pass.headerFields.push({
        key: "stamps",
        label: "SELLOS",
        value: `${data.currentStamps || 0}/${data.totalStamps || 10}`,
      });
      pass.secondaryFields.push({
        key: "completions",
        label: "COMPLETADAS",
        value: String(data.completions || 0),
      });
    } else {
      pass.headerFields.push({
        key: "level",
        label: "NIVEL",
        value: data.currentLevel || "Inicial",
      });
      pass.secondaryFields.push({
        key: "spend",
        label: "GASTO TOTAL",
        value: `${data.currency || "ARS"} $${data.totalSpend || "0"}`,
      });
    }

    pass.primaryFields.push({
      key: "name",
      label: "MIEMBRO",
      value: data.customerName,
    });

    // Add location for geopush
    if (data.geopushEnabled && data.latitude && data.longitude) {
      pass.setLocations({
        latitude: data.latitude,
        longitude: data.longitude,
        relevantText: data.geopushMessage || "¡Estás cerca!",
      });
    }

    const buffer = pass.getAsBuffer();
    return buffer;
  } catch (err) {
    console.error("[APPLE WALLET] Pass generation error:", err);
    return null;
  }
}

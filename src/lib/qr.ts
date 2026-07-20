import QRCode from "qrcode";

export async function generateQRDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 256,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

export function getRegistrationUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000";
  return `${baseUrl}/register/${slug}`;
}

export function getScanUrl(enrollmentId: number): string {
  return `enrollment/${enrollmentId}`;
}

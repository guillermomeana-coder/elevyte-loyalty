import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "Elevyte Loyalty <onboarding@resend.dev>";

export async function sendWelcomeEmail(
  to: string,
  customerName: string,
  cardName: string,
  businessName: string
) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured, skipping welcome email to", to);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `¡Bienvenido a ${cardName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f97316;">¡Hola ${customerName}!</h1>
        <p>Gracias por unirte a <strong>${cardName}</strong> de ${businessName}.</p>
        <p>Ya podés empezar a acumular beneficios con cada visita.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Enviado por Elevyte Loyalty</p>
      </div>
    `,
  });
}

export async function sendInvitationEmail(
  to: string,
  inviterName: string,
  businessName: string,
  tempPassword: string
) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured, skipping invitation to", to);
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Te invitaron a administrar ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f97316;">Invitación</h1>
        <p>${inviterName} te invitó a administrar <strong>${businessName}</strong> en Elevyte Loyalty.</p>
        <p>Tus credenciales temporales:</p>
        <p><strong>Email:</strong> ${to}<br/><strong>Contraseña:</strong> ${tempPassword}</p>
        <p style="color: #999; font-size: 12px;">Cambiá tu contraseña después de iniciar sesión.</p>
      </div>
    `,
  });
}

export async function verifyDomain(domain: string) {
  if (!resend) {
    console.log("[EMAIL] Resend not configured, skipping domain verification");
    return null;
  }

  try {
    const result = await resend.domains.create({ name: domain });
    return result;
  } catch (err) {
    console.error("[EMAIL] Domain verification error:", err);
    return null;
  }
}

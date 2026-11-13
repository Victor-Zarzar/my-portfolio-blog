import { sendEmail } from "@/lib/email/server";

const COPY = {
  pt: {
    subject: "Confirme sua inscrição",
    title: "Confirme sua inscrição",
    body: "Clique no botão abaixo para confirmar e receber um e-mail a cada novo post do blog.",
    button: "Confirmar inscrição",
    footer:
      "Este link expira em 48 horas. Se você não se inscreveu, ignore este e-mail.",
  },
  en: {
    subject: "Confirm your subscription",
    title: "Confirm your subscription",
    body: "Click the button below to confirm and get an email for every new blog post.",
    button: "Confirm subscription",
    footer:
      "This link expires in 48 hours. If you did not subscribe, you can safely ignore this email.",
  },
  es: {
    subject: "Confirma tu suscripción",
    title: "Confirma tu suscripción",
    body: "Haz clic en el botón de abajo para confirmar y recibir un correo con cada nuevo post del blog.",
    button: "Confirmar suscripción",
    footer:
      "Este enlace caduca en 48 horas. Si no te suscribiste, puedes ignorar este correo.",
  },
} as const;

export async function sendNewsletterConfirmationEmail({
  email,
  locale,
  url,
}: {
  email: string;
  locale: string;
  url: string;
}) {
  const c = COPY[locale as keyof typeof COPY] ?? COPY.pt;

  await sendEmail({
    to: email,
    subject: c.subject,
    text: [c.title, "", c.body, "", url, "", c.footer].join("\n"),
    html: `
      <!doctype html>
      <html lang="${locale}">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${c.title}</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;">
                  <tr>
                    <td style="padding:40px;">
                      <h1 style="margin:0 0 24px;font-size:24px;color:#171717;">${c.title}</h1>
                      <p style="margin:0 0 32px;font-size:16px;line-height:24px;color:#525252;">${c.body}</p>
                      <a href="${url}" style="display:inline-block;padding:12px 20px;background-color:#171717;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${c.button}</a>
                      <p style="margin:32px 0 0;font-size:13px;line-height:20px;color:#737373;">${c.footer}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}

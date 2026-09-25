import type { SendVerificationEmailOptions } from "@/app/shared/types/email/email";
import { sendEmail } from "@/lib/email/client";

export async function sendVerificationEmail({
  email,
  name,
  url,
}: SendVerificationEmailOptions) {
  await sendEmail({
    to: email,
    subject: "Verify your email address",

    text: [
      `Hello ${name},`,
      "",
      "Please verify your email address to activate your account.",
      "",
      url,
      "",
      "If you did not create this account, you can safely ignore this email.",
    ].join("\n"),

    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify your email address</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
          >
            <tr>
              <td align="center" style="padding: 40px 16px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    max-width: 520px;
                    background-color: #ffffff;
                    border-radius: 12px;
                  "
                >
                  <tr>
                    <td style="padding: 40px;">
                      <h1
                        style="
                          margin: 0 0 24px;
                          font-size: 24px;
                          color: #171717;
                        "
                      >
                        Verify your email address
                      </h1>

                      <p
                        style="
                          margin: 0 0 16px;
                          font-size: 16px;
                          line-height: 24px;
                          color: #525252;
                        "
                      >
                        Hello ${name},
                      </p>

                      <p
                        style="
                          margin: 0 0 32px;
                          font-size: 16px;
                          line-height: 24px;
                          color: #525252;
                        "
                      >
                        Please verify your email address to activate your
                        Portfolio Blog account.
                      </p>

                      <a
                        href="${url}"
                        style="
                          display: inline-block;
                          padding: 12px 20px;
                          background-color: #171717;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 8px;
                          font-size: 14px;
                          font-weight: 600;
                        "
                      >
                        Verify email
                      </a>

                      <p
                        style="
                          margin: 32px 0 0;
                          font-size: 13px;
                          line-height: 20px;
                          color: #737373;
                        "
                      >
                        If you did not create this account, you can safely
                        ignore this email.
                      </p>
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

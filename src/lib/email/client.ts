import nodemailer from "nodemailer";
import type { SendEmailOptions } from "@/app/shared/types/email/email";
import env from "@/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_EMAIL,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: SendEmailOptions) {
  return transporter.sendMail({
    from: env.SMTP_EMAIL,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { formatDateTimeBR } from "@/app/shared/helpers/format-date";
import type { SlackContactPayload } from "@/app/shared/types/form/form";
import env from "@/env";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  subject: z.string().min(1).max(100),
  message: z.string().min(1).max(1000),
  company: z.string().optional(),
});

const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60,
});

async function sendSlackMessage(payload: SlackContactPayload) {
  if (!env.SLACK_WEBHOOK_URL) {
    return;
  }

  const text = `My portfolio contact from ${payload.name} <${payload.email}>`;

  const res = await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "My Portfolio contact",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Name:*\n${payload.name}`,
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n<mailto:${payload.email}|${payload.email}>`,
            },
            {
              type: "mrkdwn",
              text: `*Subject:*\n${payload.subject}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n>${payload.message.replace(/\n/g, "\n>")}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `My Portfolio contact form • ${formatDateTimeBR(new Date())}`,
            },
          ],
        },
        {
          type: "divider",
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook failed: ${res.status} ${res.statusText}`);
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    await rateLimiter.consume(ip);
    const captchaToken = request.headers.get("x-captcha-response");

    if (!captchaToken) {
      return NextResponse.json(
        { error: "reCAPTCHA verification is required" },
        { status: 400 },
      );
    }

    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
      },
    );

    const recaptchaResult = await recaptchaResponse.json();

    if (!recaptchaResult.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }

    const body = await request.json();

    if (body.company) {
      return NextResponse.json({ message: "Bot detected" }, { status: 400 });
    }

    const { name, email, subject, message } = contactSchema.parse(body);

    const sanitizedName = sanitizeHtml(name);
    const sanitizedEmail = sanitizeHtml(email);
    const sanitizedSubject = sanitizeHtml(subject);
    const sanitizedMessage = sanitizeHtml(message);

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: true,
      auth: {
        user: env.SMTP_EMAIL,
        pass: env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Portfolio Contact" <${env.SMTP_EMAIL}>`,
      to: env.SMTP_EMAIL,
      replyTo: sanitizedEmail,
      subject: `My portfolio contact — ${sanitizedSubject}`,
      text: [
        "My portfolio contact",
        "",
        `Name: ${sanitizedName}`,
        `Email: ${sanitizedEmail}`,
        `Subject: ${sanitizedSubject}`,
        "",
        "Message:",
        sanitizedMessage,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 24px;">
          <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background: #111827; color: #ffffff; padding: 20px 24px;">
              <h1 style="margin: 0; font-size: 20px;">New portfolio contact</h1>
              <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">
                A new message was submitted through your contact form.
              </p>
            </div>

            <div style="padding: 24px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: 700; width: 100px;">Name</td>
                  <td style="padding: 8px 0;">${sanitizedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 700;">Email</td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${sanitizedEmail}" style="color: #2563eb; text-decoration: none;">
                      ${sanitizedEmail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: 700;">Subject</td>
                  <td style="padding: 8px 0;">${sanitizedSubject}</td>
                </tr>
              </table>

              <div style="margin-top: 24px;">
                <h2 style="margin: 0 0 12px; font-size: 16px; color: #111827;">Message</h2>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; white-space: pre-wrap;">
                  ${sanitizedMessage}
                </div>
              </div>
            </div>

            <div style="padding: 16px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              My Portfolio contact form
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    try {
      await sendSlackMessage({
        name: sanitizedName,
        email: sanitizedEmail,
        subject: sanitizedSubject,
        message: sanitizedMessage,
      });
    } catch (error) {
      console.error("Error sending Slack message:", error);
      Sentry.captureException(error);
    }

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "msBeforeNext" in error) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    console.error("Error sending email:", error);
    Sentry.captureException(error);

    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 },
    );
  }
}

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { POST } from "@/app/api/contact/route";

const mockSendMail = mock(() => Promise.resolve({ messageId: "123" }));

mock.module("nodemailer", () => ({
  default: {
    createTransport: mock(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

mock.module("@/env", () => ({
  default: {
    SMTP_EMAIL: "test@example.com",
    SMTP_PASSWORD: "password123",
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: 587,
    GOOGLE_RECAPTCHA_SECRET_KEY: "test-secret",
    SLACK_WEBHOOK_URL: "test-url-slack",
  },
}));

describe("POST /api/contact", () => {
  beforeEach(() => {
    mockSendMail.mockClear();

    global.fetch = mock((url: string | URL | Request) => {
      const requestUrl = typeof url === "string" ? url : url.toString();

      if (requestUrl.includes("google.com/recaptcha/api/siteverify")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
          }),
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    }) as unknown as typeof fetch;
  });

  it("should send email successfully", async () => {
    const request = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.1",
        "x-captcha-response": "valid-captcha-token",
      },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Email sent successfully!");
    expect(mockSendMail).toHaveBeenCalled();
  });

  it("should block bot when company field is present", async () => {
    const request = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.2",
        "x-captcha-response": "valid-captcha-token",
      },
      body: JSON.stringify({
        name: "Bot",
        email: "bot@example.com",
        subject: "Spam",
        message: "Spam message",
        company: "Spam Corp",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Bot detected");
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should return error for invalid data", async () => {
    const request = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.168.1.3",
        "x-captcha-response": "valid-captcha-token",
      },
      body: JSON.stringify({
        name: "",
        email: "invalid-email",
        subject: "",
        message: "",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe("Invalid data");
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("should return 429 error when rate limit is exceeded", async () => {
    const testIP = "192.168.1.100";

    const createRequest = () =>
      new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIP,
          "x-captcha-response": "valid-captcha-token",
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          subject: "Test",
          message: "Test message",
        }),
      });

    await POST(createRequest());
    await POST(createRequest());
    await POST(createRequest());

    const response = await POST(createRequest());
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.message).toBe("Too many requests. Please try again later.");
    expect(mockSendMail).toHaveBeenCalledTimes(3);
  });
});

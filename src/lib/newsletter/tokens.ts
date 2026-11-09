import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/env/server";

// Confirmação: token aleatório, só o hash vai para o banco
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

// Cancelamento (fase 2): HMAC do id do assinante
export function signUnsubscribe(subscriberId: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`newsletter:unsubscribe:${subscriberId}`)
    .digest("base64url");
}

export function verifyUnsubscribe(subscriberId: string, signature: string) {
  const expected = Buffer.from(signUnsubscribe(subscriberId));
  const received = Buffer.from(signature);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

/**
 * Email-авторизация сайта: код подтверждения + сессия в HttpOnly куке.
 * Коды живут в KV 10 минут, сессия — HS256 JWT (aud "site-user") 30 дней.
 */

import { issueToken, verifyToken } from "./guest-token";

const CODE_TTL_SECONDS = 600;
const CODE_MAX_ATTEMPTS = 5;
const SESSION_DAYS = 30;
const SESSION_COOKIE = "iskra_session";
const AUDIENCE = "site-user";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Не больше одного кода на email в минуту. */
const REQUEST_COOLDOWN_SECONDS = 60;
/** Не больше пяти запросов кода с одного IP за 10 минут. */
const IP_LIMIT = 5;
const IP_LIMIT_TTL_SECONDS = 600;

type CodeEntry = { h: string; attempts: number; exp: number };

export async function authRequest(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: unknown }>(request);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) return detailError(422, "Нужен корректный email");

  const allowed = await bumpLimit(
    env,
    `auth:ip:${await sha256Hex(ipOf(request))}`,
    IP_LIMIT,
    IP_LIMIT_TTL_SECONDS,
  );
  if (!allowed) return detailError(429, "Слишком много запросов кода, попробуйте позже");

  const emailKey = await sha256Hex(email);
  const cooldownKey = `auth:cool:${emailKey}`;
  if ((await env.AUTH_KV.get(cooldownKey)) !== null) {
    return detailError(429, "Код уже отправлен, подождите минуту");
  }

  const code = sixDigitCode();
  const now = Math.floor(Date.now() / 1000);
  const stored: CodeEntry = { h: await sha256Hex(code), attempts: 0, exp: now + CODE_TTL_SECONDS };
  await env.AUTH_KV.put(`auth:code:${emailKey}`, JSON.stringify(stored), {
    expirationTtl: CODE_TTL_SECONDS,
  });
  await env.AUTH_KV.put(cooldownKey, "1", { expirationTtl: REQUEST_COOLDOWN_SECONDS });

  const sent = await sendEmailSafe(env, email, code);
  if (!sent.ok) {
    // Письмо не ушло — снимаем барьеры, чтобы повторный запрос не бился о «уже отправлен».
    await env.AUTH_KV.delete(`auth:code:${emailKey}`);
    await env.AUTH_KV.delete(cooldownKey);
    console.error(JSON.stringify({ message: "resend failed", status: sent.status, body: sent.body }));
    return detailError(502, "Не удалось отправить письмо, попробуйте позже");
  }

  console.log(JSON.stringify({ message: "auth code sent", emailDomain: email.split("@")[1] }));
  return json({ ok: true, ttl: CODE_TTL_SECONDS });
}

export async function authVerify(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: unknown; code?: unknown }>(request);
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!EMAIL_PATTERN.test(email) || !/^\d{6}$/.test(code)) {
    return detailError(422, "Нужны email и шестизначный код");
  }

  const key = `auth:code:${await sha256Hex(email)}`;
  const raw = await env.AUTH_KV.get(key);
  if (raw === null) return detailError(400, "Код не запрашивался или истёк");

  const stored = JSON.parse(raw) as CodeEntry;
  if (Math.floor(Date.now() / 1000) > stored.exp) {
    await env.AUTH_KV.delete(key);
    return detailError(400, "Код истёк, запросите новый");
  }
  if (stored.attempts >= CODE_MAX_ATTEMPTS) {
    await env.AUTH_KV.delete(key);
    return detailError(429, "Слишком много попыток, запросите новый код");
  }
  if (stored.h !== (await sha256Hex(code))) {
    stored.attempts += 1;
    // TTL не продлеваем: код обязан умереть в исходный срок (минимум KV — 60 c).
    const remaining = Math.max(60, stored.exp - Math.floor(Date.now() / 1000));
    await env.AUTH_KV.put(key, JSON.stringify(stored), { expirationTtl: remaining });
    return detailError(400, "Неверный код");
  }

  await env.AUTH_KV.delete(key);
  const token = await issueToken(email, env.GUEST_JWT_SECRET, AUDIENCE, SESSION_DAYS);
  return json({ email }, 200, { "Set-Cookie": sessionSetCookie(token, request) });
}

export async function authSession(request: Request, env: Env): Promise<Response> {
  const email = await sessionEmail(request, env);
  if (email === null) return detailError(401, "Нет активной сессии");
  return json({ email });
}

export async function authLogout(request: Request): Promise<Response> {
  const secure = new URL(request.url).protocol === "https:";
  return json(
    { ok: true },
    200,
    {
      "Set-Cookie": `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${
        secure ? "; Secure" : ""
      }`,
    },
  );
}

/** Email владельца куки или null. */
export async function sessionEmail(request: Request, env: Env): Promise<string | null> {
  const cookie = request.headers.get("Cookie") ?? "";
  for (const part of cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1 || part.slice(0, eq).trim() !== SESSION_COOKIE) continue;
    try {
      const token = decodeURIComponent(part.slice(eq + 1));
      return await verifyToken(token, env.GUEST_JWT_SECRET, AUDIENCE);
    } catch {
      return null;
    }
  }
  return null;
}

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers });
}

function detailError(status: number, detail: string): Response {
  return json({ detail }, status);
}

type SendResult = { ok: boolean; status: number; body: string };

/** Исключение fetch (сеть/DNS) тоже считаем неудачей — клиент должен уметь ретраить. */
async function sendEmailSafe(env: Env, email: string, code: string): Promise<SendResult> {
  try {
    return await sendEmail(env, email, code);
  } catch (error) {
    return { ok: false, status: 0, body: error instanceof Error ? error.message : "network error" };
  }
}

async function sendEmail(
  env: Env,
  email: string,
  code: string,
): Promise<SendResult> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.AUTH_MAIL_FROM,
      to: [email],
      subject: "Код входа в neon chat",
      text: `Код входа в neon chat: ${code}\n\nДействует 10 минут. Если вы не запрашивали вход — просто игнорируйте письмо.`,
      html: `<p style="font-size:16px">Ваш код входа в <b>neon chat</b>:</p><p style="font-size:32px;letter-spacing:6px;font-weight:700">${code}</p><p style="color:#667">Действует 10 минут. Если вы не запрашивали вход — просто игнорируйте письмо.</p>`,
    }),
  });
  return { ok: response.ok, status: response.status, body: (await response.text()).slice(0, 500) };
}

function sessionSetCookie(token: string, request: Request): string {
  const url = new URL(request.url);
  const secure = url.protocol === "https:";
  let crossSite = false;
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      crossSite = new URL(origin).origin !== url.origin;
    } catch {
      crossSite = false;
    }
  }
  const sameSite = secure && crossSite ? "None" : "Lax";
  const secureAttr = secure || sameSite === "None" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${
    SESSION_DAYS * 24 * 60 * 60
  }; SameSite=${sameSite}${secureAttr}; HttpOnly`;
}

function sixDigitCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const value = (bytes[0] << 12) | (bytes[1] << 4) | (bytes[2] & 0x0f);
  return String(value % 1_000_000).padStart(6, "0");
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function ipOf(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For") ?? "unknown"
  );
}

/**
 * KV не умеет инкремент атомарно: счётчик просто перезаписывается с новым TTL.
 * На этих объёмах такое приемлемо.
 */
async function bumpLimit(env: Env, key: string, limit: number, ttl: number): Promise<boolean> {
  const current = Number((await env.AUTH_KV.get(key)) ?? 0);
  if (!Number.isSafeInteger(current) || current < 0 || current >= limit) return false;
  await env.AUTH_KV.put(key, String(current + 1), { expirationTtl: ttl });
  return true;
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
}

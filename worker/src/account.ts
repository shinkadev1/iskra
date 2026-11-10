/** Личный кабинет: подписка и платежи пользователя сайта через pay-сервис. */

import { sessionEmail } from "./auth";

const DEFAULT_PAY_URL = "https://pay.chatwithyou.site";
const TIMEOUT_MS = 10_000;
const UNAVAILABLE = "Сервис подписок временно недоступен";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function detailError(status: number, detail: string): Response {
  return json({ detail }, status);
}

function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  if (origin === new URL(request.url).origin) return true;
  return env.ALLOWED_ORIGINS.split(",")
    .map((item) => item.trim())
    .includes(origin);
}

async function callPay(env: Env, endpoint: string, email: string): Promise<Response> {
  const base =
    (env as Env & { PREMIUM_API_URL?: string }).PREMIUM_API_URL || DEFAULT_PAY_URL;
  let upstream: Response;
  try {
    upstream = await fetch(new URL(endpoint, base), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CHAT_API_APP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return detailError(502, UNAVAILABLE);
  }
  if (upstream.status === 200) {
    try {
      const body = (await upstream.json()) as Record<string, unknown> | null;
      // Для email без записей pay отдаёт email: null — это email самого пользователя.
      if (body && typeof body === "object" && body.email == null) body.email = email;
      return json(body);
    } catch {
      return detailError(502, UNAVAILABLE);
    }
  }
  if (upstream.status === 409) {
    let detail = "Подписка не найдена";
    try {
      const body = (await upstream.json()) as { detail?: unknown };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // оставляем текст по умолчанию
    }
    return detailError(409, detail);
  }
  console.error(JSON.stringify({ message: "pay account error", status: upstream.status }));
  return detailError(502, UNAVAILABLE);
}

/** Маршруты /me/subscription*; null — путь не наш. */
export async function accountRoute(
  request: Request,
  env: Env,
  path: string,
): Promise<Response | null> {
  const isGet = request.method === "GET" && path === "/me/subscription";
  const isCancel = request.method === "POST" && path === "/me/subscription/cancel";
  if (!isGet && !isCancel) return null;

  if (isCancel && !originAllowed(request, env)) return detailError(403, "Запрещено");
  const email = await sessionEmail(request, env);
  if (email === null) return detailError(401, "Войдите по email");
  return callPay(env, isCancel ? "/internal/web/account/cancel" : "/internal/web/account", email);
}

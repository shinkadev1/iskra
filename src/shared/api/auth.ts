/** Клиент email-авторизации: код на почту → сессия в HttpOnly куке. */

import { chatApiBaseUrl } from "./chat";

const AUTH_BASE = "/api/v1/auth";

async function parse<T>(
  response: Response,
): Promise<{ ok: true; data: T } | { ok: false; detail: string }> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const detail =
      typeof body === "object" &&
      body !== null &&
      typeof (body as { detail?: unknown }).detail === "string"
        ? (body as { detail: string }).detail
        : `Ошибка ${response.status}`;
    return { ok: false, detail };
  }
  return { ok: true, data: body as T };
}

export async function requestCode(
  email: string,
): Promise<{ ok: true; ttl: number } | { ok: false; detail: string }> {
  let response: Response;
  try {
    response = await fetch(`${chatApiBaseUrl()}${AUTH_BASE}/request`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    return { ok: false, detail: "Нет связи с сервером, проверьте интернет" };
  }
  const result = await parse<{ ok: boolean; ttl: number }>(response);
  if (!result.ok) return result;
  if (typeof result.data?.ttl !== "number") return { ok: false, detail: "Неожиданный ответ сервера" };
  return { ok: true, ttl: result.data.ttl };
}

export async function verifyCode(
  email: string,
  code: string,
): Promise<{ ok: true; email: string } | { ok: false; detail: string }> {
  let response: Response;
  try {
    response = await fetch(`${chatApiBaseUrl()}${AUTH_BASE}/verify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
  } catch {
    return { ok: false, detail: "Нет связи с сервером, проверьте интернет" };
  }
  const result = await parse<{ email: string }>(response);
  if (!result.ok) return result;
  if (typeof result.data?.email !== "string") {
    return { ok: false, detail: "Неожиданный ответ сервера" };
  }
  return { ok: true, email: result.data.email };
}

export async function fetchSession(): Promise<{ email: string } | null> {
  const url = `${chatApiBaseUrl()}${AUTH_BASE}/session`;
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) return null;
    const body = (await response.json()) as { email?: unknown };
    return typeof body.email === "string" ? { email: body.email } : null;
  } catch {
    return null;
  }
}

export async function logout(): Promise<boolean> {
  const url = `${chatApiBaseUrl()}${AUTH_BASE}/logout`;
  try {
    const response = await fetch(url, { method: "POST", credentials: "include" });
    return response.ok;
  } catch {
    return false;
  }
}

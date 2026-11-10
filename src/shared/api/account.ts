/** Клиент личного кабинета: подписка и история платежей (Worker → pay-сервис). */

import { chatApiBaseUrl } from "./chat";

const ACCOUNT_BASE = "/api/v1/me/subscription";

export type NextCharge = { at: string; amount_rub: number; plan_name: string };

export type Subscription = {
  plan_id: string;
  plan_name: string;
  price_rub: number;
  days: number;
  auto_renew: boolean;
  card_attached: boolean;
  card_last4: string | null;
  card_brand: string | null;
  period_end: string | null;
  started_at: string | null;
  next_charge: NextCharge | null;
};

export type Payment = {
  created_at: string;
  plan_id: string;
  plan_name: string;
  amount_rub: number;
  status: "paid" | "failed";
};

export type Account = {
  email: string;
  premium_until: string | null;
  premium_active: boolean;
  subscription: Subscription | null;
  payments: Payment[];
};

export type AccountResult =
  | { ok: true; account: Account }
  | { ok: false; kind: "unauthorized" }
  | { ok: false; kind: "error"; detail: string };

async function parse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function detailOf(body: unknown, status: number): string {
  return typeof body === "object" &&
    body !== null &&
    typeof (body as { detail?: unknown }).detail === "string"
    ? (body as { detail: string }).detail
    : `Ошибка ${status}`;
}

async function send(path: string, method: "GET" | "POST"): Promise<
  | { ok: true; body: unknown }
  | { ok: false; kind: "unauthorized" }
  | { ok: false; kind: "error"; detail: string }
> {
  let response: Response;
  try {
    response = await fetch(`${chatApiBaseUrl()}${ACCOUNT_BASE}${path}`, {
      method,
      credentials: "include",
    });
  } catch {
    return { ok: false, kind: "error", detail: "Нет связи с сервером, проверьте интернет" };
  }
  const body = await parse(response);
  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (!response.ok) return { ok: false, kind: "error", detail: detailOf(body, response.status) };
  return { ok: true, body };
}

export async function fetchSubscription(): Promise<AccountResult> {
  const result = await send("", "GET");
  if (!result.ok) return result;
  const account = result.body as Account | null;
  if (!account || typeof account.email !== "string" || !Array.isArray(account.payments)) {
    return { ok: false, kind: "error", detail: "Неожиданный ответ сервера" };
  }
  return { ok: true, account };
}

/** После успеха данные нужно перечитать через fetchSubscription(). */
export async function cancelSubscription(): Promise<
  { ok: true } | { ok: false; kind: "unauthorized" } | { ok: false; kind: "error"; detail: string }
> {
  const result = await send("/cancel", "POST");
  return result.ok ? { ok: true } : result;
}

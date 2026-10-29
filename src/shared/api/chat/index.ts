/** Клиент публичного web-gateway (dating-bot). APP token на сервере gateway. */

import {
  COOKIE_CONSENT_HEADER,
  COOKIE_CONSENT_SAVE,
  readCookieConsent,
} from "@/shared/lib/cookie-consent";
import { ensureVisitorId, writeVisitorId } from "@/shared/lib/visitor";

export type Phase = "idle" | "searching" | "chatting";

export type ChatEvent =
  | { type: "partner_found" }
  | { type: "message"; text: string }
  | { type: "partner_left"; reason?: string }
  | { type: "media"; media_id: string; kind?: string; content_type?: string }
  | { type: "notice"; text?: string; media_id?: string; kind?: string; content_type?: string };

export type PartnerMedia = {
  url: string;
  kind: string;
};

export type GuestSession = {
  token: string;
  guestId: number;
};

export type PresenceStats = {
  online: number;
  searching: number;
  chatting: number;
};

export type ChatStats = PresenceStats & {
  humans: PresenceStats;
  bots: PresenceStats;
};

/** В счётчике всегда есть два бота владельца, даже если API их сейчас не видит. */
const OWN_BOTS = 2;

export function activePeople(stats: ChatStats): number {
  return stats.humans.online + Math.max(stats.bots.online, OWN_BOTS);
}

const TOKEN_KEY = "iskra_guest_token";
const GUEST_KEY = "iskra_guest_id";
const DEFAULT_CHAT_API_URL = "https://chatwithyou.site";

export function chatApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim() || DEFAULT_CHAT_API_URL;
  return raw.replace(/\/$/, "");
}

export function chatApiConfigured(): boolean {
  return Boolean(chatApiBaseUrl());
}

function wsBaseUrl(httpBase: string): string {
  if (httpBase.startsWith("https://")) {
    return "wss://" + httpBase.slice("https://".length);
  }
  if (httpBase.startsWith("http://")) {
    return "ws://" + httpBase.slice("http://".length);
  }
  return httpBase;
}

export function loadStoredGuest(): GuestSession | null {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  const guestRaw = window.localStorage.getItem(GUEST_KEY);
  if (!token || !guestRaw) return null;
  const guestId = Number(guestRaw);
  if (!Number.isFinite(guestId) || guestId <= 0) return null;
  return { token, guestId };
}

export function storeGuest(session: GuestSession): void {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(GUEST_KEY, String(session.guestId));
}

export function clearStoredGuest(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(GUEST_KEY);
}

async function api<T>(
  path: string,
  token: string | null,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (readCookieConsent() === "save") headers.set(COOKIE_CONSENT_HEADER, COOKIE_CONSENT_SAVE);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${chatApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function createGuest(): Promise<GuestSession> {
  const body = await api<{ token: string; guest_id: number }>(
    "/api/v1/guests",
    null,
    { method: "POST" },
  );
  const session = { token: body.token, guestId: body.guest_id };
  storeGuest(session);
  return session;
}

let visitorRegistration: Promise<void> | null = null;

const VISITOR_ID_HEADER = "X-Visitor-Id";

/** Сразу пишет куку, затем просит API запомнить посетителя. Повторные вызовы ждут один запрос. */
export function registerVisitor(): Promise<void> {
  if (typeof window === "undefined" || readCookieConsent() !== "save") return Promise.resolve();
  const visitorId = ensureVisitorId();
  if (!visitorRegistration) {
    const headers = new Headers();
    headers.set(COOKIE_CONSENT_HEADER, COOKIE_CONSENT_SAVE);
    headers.set(VISITOR_ID_HEADER, visitorId);
    const existing = loadStoredGuest();
    if (existing) headers.set("Authorization", `Bearer ${existing.token}`);
    visitorRegistration = fetch(`${chatApiBaseUrl()}/api/v1/visitors`, {
      method: "POST",
      credentials: "include",
      headers,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!text) return;
        const body = JSON.parse(text) as { id?: unknown };
        if (typeof body.id === "string") writeVisitorId(body.id);
      })
      .catch(() => {
        visitorRegistration = null;
      });
  }
  return visitorRegistration;
}

export async function ensureGuest(): Promise<GuestSession> {
  await registerVisitor();
  const existing = loadStoredGuest();
  if (existing) {
    try {
      await api("/api/v1/me/visit", existing.token, { method: "POST" });
      return existing;
    } catch {
      clearStoredGuest();
    }
  }
  return createGuest();
}

export async function getStats(): Promise<ChatStats> {
  return api<ChatStats>("/api/v1/stats", null);
}

export async function getState(token: string): Promise<Phase> {
  const body = await api<{ phase: Phase }>("/api/v1/me/state", token);
  return body.phase;
}

export async function startSearch(token: string): Promise<Phase> {
  const body = await api<{ phase: Phase }>("/api/v1/me/search", token, {
    method: "POST",
  });
  return body.phase;
}

export async function stopChat(token: string): Promise<{ wasActive: boolean }> {
  const body = await api<{ was_active: boolean }>("/api/v1/me/stop", token, {
    method: "POST",
  });
  return { wasActive: body.was_active };
}

export async function reportAndSearch(token: string): Promise<Phase> {
  const body = await api<{ phase: Phase }>("/api/v1/me/report", token, {
    method: "POST",
  });
  return body.phase;
}

export async function fetchPartnerMedia(token: string, mediaId: string): Promise<PartnerMedia> {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (readCookieConsent() === "save") headers.set(COOKIE_CONSENT_HEADER, COOKIE_CONSENT_SAVE);
  const response = await fetch(`${chatApiBaseUrl()}/api/v1/me/media/${mediaId}`, {
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  return {
    url: URL.createObjectURL(blob),
    kind: response.headers.get("x-media-kind") || "photo",
  };
}

export async function sendMessage(
  token: string,
  text: string,
): Promise<{ delivered: boolean; phase: Phase }> {
  return api("/api/v1/me/messages", token, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function openEvents(
  token: string,
  onEvent: (event: ChatEvent) => void,
  onStatus: (status: "connecting" | "open" | "closed") => void,
): () => void {
  const url = `${wsBaseUrl(chatApiBaseUrl())}/api/v1/me/events?token=${encodeURIComponent(token)}`;
  let closed = false;
  let socket: WebSocket | null = null;
  let retry = 0;
  let timer: number | undefined;

  const connect = () => {
    if (closed) return;
    onStatus("connecting");
    socket = new WebSocket(url);
    socket.onopen = () => {
      retry = 0;
      onStatus("open");
    };
    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(String(message.data)) as ChatEvent;
        if (data && typeof data.type === "string") onEvent(data);
      } catch {
        /* ignore */
      }
    };
    socket.onclose = () => {
      onStatus("closed");
      if (closed) return;
      const delay = Math.min(1000 * 2 ** retry, 15000);
      retry += 1;
      timer = window.setTimeout(connect, delay);
    };
    socket.onerror = () => {
      socket?.close();
    };
  };

  connect();

  return () => {
    closed = true;
    if (timer) window.clearTimeout(timer);
    socket?.close();
  };
}

/** Стабильный идентификатор браузера. Живёт в куке и уходит на API вместе с запросами. */

export const VISITOR_COOKIE = "iskra_id";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function readVisitorId(): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1 || part.slice(0, eq) !== VISITOR_COOKIE) continue;
    try {
      const value = decodeURIComponent(part.slice(eq + 1));
      if (VISITOR_ID_PATTERN.test(value)) return value;
    } catch {
      return null;
    }
  }
  return null;
}

function newVisitorId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function cookieSuffix(): string {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
}

export function clearVisitorCookie(): void {
  document.cookie = `${VISITOR_COOKIE}=; Max-Age=0${cookieSuffix()}`;
}

export function writeVisitorId(id: string): void {
  if (!VISITOR_ID_PATTERN.test(id)) return;
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(id)}; Max-Age=${MAX_AGE_SECONDS}${cookieSuffix()}`;
}

/** Возвращает текущий id или выпускает новый. Срок куки продлевается при каждом визите. */
export function ensureVisitorId(): string {
  const id = readVisitorId() ?? newVisitorId();
  writeVisitorId(id);
  return id;
}

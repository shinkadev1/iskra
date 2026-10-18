/** Кука iskra_id на публичном домене. Сам человек хранится в Chat API. */

const VISITOR_COOKIE = "iskra_id";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 400;
const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validVisitorId(value: string): string | null {
  try {
    const id = decodeURIComponent(value.trim());
    return VISITOR_ID_PATTERN.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function visitorIdFromRequest(request: Request): string | null {
  const cookie = request.headers.get("Cookie") ?? "";
  for (const part of cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1 || part.slice(0, eq).trim() !== VISITOR_COOKIE) continue;
    const id = validVisitorId(part.slice(eq + 1));
    if (id) return id;
  }
  return validVisitorId(request.headers.get("X-Visitor-Id") ?? "");
}

export function visitorSetCookie(id: string, request: Request): string {
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
  return `${VISITOR_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=${sameSite}${secureAttr}`;
}

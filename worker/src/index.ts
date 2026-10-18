/** Публичный API чата для сайта: chatwithyou.site/api/* → Chat API за Cloudflare Access. */

import { ChatApi, ChatApiError, type PeerAction } from "./chat-api";
import { GUEST_ID_HEADER } from "./guest-hub";
import { issueGuestToken, newGuestId, verifyGuestToken } from "./guest-token";
import { visitorIdFromRequest, visitorSetCookie } from "./visitor-cookie";

const COOKIE_CONSENT_HEADER = "X-Cookie-Consent";

export { GuestHub } from "./guest-hub";

const API_PREFIX = "/api/v1";
const MAX_MESSAGE_LENGTH = 4096;

const GUEST_ROUTES: Record<string, { method: "GET" | "POST"; action: PeerAction }> = {
  "POST /me/visit": { method: "POST", action: "visit" },
  "GET /me/state": { method: "GET", action: "state" },
  "POST /me/search": { method: "POST", action: "search" },
  "POST /me/stop": { method: "POST", action: "stop" },
  "POST /me/report": { method: "POST", action: "report" },
  "POST /me/messages": { method: "POST", action: "messages" },
};

function json(body: unknown, status = 200, headers?: HeadersInit): Response {
  return Response.json(body, { status, headers });
}

function errorResponse(status: number, detail: string, headers?: HeadersInit): Response {
  return json({ detail }, status, headers);
}

function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin");
  const allowed = env.ALLOWED_ORIGINS.split(",").map((item) => item.trim());
  if (origin && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Visitor-Id, X-Cookie-Consent",
    );
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return headers;
}

function savesCookie(request: Request): boolean {
  return request.headers.get(COOKIE_CONSENT_HEADER) === "save";
}

function bearerToken(request: Request): string {
  const [scheme, token] = (request.headers.get("Authorization") ?? "").split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : "";
}

async function readMessageText(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as { text?: unknown };
    const text = body.text;
    if (typeof text !== "string" || text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}

async function rememberVisitor(
  request: Request,
  env: Env,
  userId: number | null,
): Promise<{ id: string; userId: number; created: boolean }> {
  return new ChatApi(env).saveVisitor(visitorIdFromRequest(request), userId);
}

async function saveVisitor(request: Request, env: Env): Promise<Response> {
  if (!savesCookie(request)) return new Response(null, { status: 204 });
  const userId = await verifyGuestToken(bearerToken(request), env.GUEST_JWT_SECRET);
  const visitor = await rememberVisitor(request, env, userId);
  return json({ id: visitor.id }, visitor.created ? 201 : 200, {
    "Set-Cookie": visitorSetCookie(visitor.id, request),
  });
}

async function createGuest(request: Request, env: Env): Promise<Response> {
  const visitor = savesCookie(request) ? await rememberVisitor(request, env, null) : null;
  const guestId = visitor?.userId ?? newGuestId();
  await new ChatApi(env).peer("POST", guestId, "visit");
  const token = await issueGuestToken(guestId, env.GUEST_JWT_SECRET);
  console.log(
    JSON.stringify({
      message: "guest created",
      guestId,
      visitorId: visitor?.id ?? null,
    }),
  );
  return json(
    { token, guest_id: guestId },
    201,
    visitor ? { "Set-Cookie": visitorSetCookie(visitor.id, request) } : undefined,
  );
}

async function openGuestEvents(request: Request, env: Env): Promise<Response> {
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return errorResponse(426, "Нужен WebSocket");
  }
  // Браузерный WebSocket не умеет слать Authorization, поэтому токен приходит в query.
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const guestId = await verifyGuestToken(token, env.GUEST_JWT_SECRET);
  if (guestId === null) return errorResponse(401, "Нужен действующий токен");

  const forwarded = new Request(request);
  forwarded.headers.set(GUEST_ID_HEADER, String(guestId));
  return env.GUEST_HUB.getByName("hub").fetch(forwarded);
}

async function guestAction(request: Request, env: Env, route: string): Promise<Response> {
  const target = GUEST_ROUTES[route];
  if (!target) return errorResponse(404, "Не найдено");

  const guestId = await verifyGuestToken(bearerToken(request), env.GUEST_JWT_SECRET);
  if (guestId === null) {
    return errorResponse(401, "Нужен действующий токен", { "WWW-Authenticate": "Bearer" });
  }
  let body: { text: string } | undefined;
  if (target.action === "messages") {
    const text = await readMessageText(request);
    if (text === null) {
      return errorResponse(422, `Текст сообщения: от 1 до ${MAX_MESSAGE_LENGTH} символов`);
    }
    body = { text };
  }

  const result = await new ChatApi(env).peer(target.method, guestId, target.action, body);
  return result === undefined ? new Response(null, { status: 204 }) : json(result);
}

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname === "/api/health") {
    const ok = await new ChatApi(env).health();
    return json({ status: ok ? "ok" : "degraded", chat_api: ok ? "ok" : "down" }, ok ? 200 : 503);
  }
  if (!pathname.startsWith(`${API_PREFIX}/`)) return errorResponse(404, "Не найдено");

  const path = pathname.slice(API_PREFIX.length);
  if (request.method === "GET" && path === "/stats") return json(await new ChatApi(env).stats());
  if (request.method === "POST" && path === "/visitors") return saveVisitor(request, env);
  if (request.method === "POST" && path === "/guests") return createGuest(request, env);
  if (request.method === "GET" && path === "/me/events") return openGuestEvents(request, env);
  return guestAction(request, env, `${request.method} ${path}`);
}

export default {
  async fetch(request, env): Promise<Response> {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    let response: Response;
    try {
      response = await route(request, env);
    } catch (error) {
      if (error instanceof ChatApiError) {
        console.error(JSON.stringify({ message: "chat api error", status: error.status, detail: error.detail }));
        response = errorResponse(error.status, error.detail);
      } else {
        console.error(JSON.stringify({ message: "unhandled error", error: String(error) }));
        response = errorResponse(500, "Внутренняя ошибка");
      }
    }

    if (response.status === 101) return response;
    const headers = new Headers(response.headers);
    cors.forEach((value, key) => headers.set(key, value));
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;

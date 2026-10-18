/** Клиент Chat API: APP token + service token Cloudflare Access, платформа web. */

export class ChatApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
  ) {
    super(detail);
  }
}

export type PeerAction = "visit" | "state" | "search" | "stop" | "report" | "messages";

export type PresenceStats = {
  online: number;
  searching: number;
  chatting: number;
};

export type ChatStats = PresenceStats & {
  humans: PresenceStats;
  bots: PresenceStats;
};

export class ChatApi {
  private readonly root: string;

  constructor(private readonly env: Env) {
    this.root = env.CHAT_API_URL.replace(/\/$/, "");
  }

  private headers(): Headers {
    return new Headers({
      Authorization: `Bearer ${this.env.CHAT_API_APP_TOKEN}`,
      "CF-Access-Client-Id": this.env.CF_ACCESS_CLIENT_ID,
      "CF-Access-Client-Secret": this.env.CF_ACCESS_CLIENT_SECRET,
    });
  }

  async peer<T>(
    method: "GET" | "POST",
    guestId: number,
    action: PeerAction,
    body?: unknown,
  ): Promise<T | undefined> {
    const botKey = encodeURIComponent(this.env.WEB_BOT_KEY);
    const headers = this.headers();
    if (body !== undefined) headers.set("Content-Type", "application/json");
    const response = await this.send(`/api/v1/peers/web/${botKey}/${guestId}/${action}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 204) return undefined;
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : undefined;
  }

  /** Кука сайта хранится в Chat API. userId — уже известный гость, если браузер прислал его токен. */
  async saveVisitor(
    id: string | null,
    userId: number | null,
  ): Promise<{ id: string; userId: number; created: boolean }> {
    const headers = this.headers();
    headers.set("Content-Type", "application/json");
    const response = await this.send("/api/v1/visitors", {
      method: "POST",
      headers,
      body: JSON.stringify({
        id,
        bot_key: this.env.WEB_BOT_KEY,
        user_id: userId,
      }),
    });
    const body = (await response.json()) as { id: string; user_id: number; created: boolean };
    return { id: body.id, userId: body.user_id, created: body.created };
  }

  async stats(): Promise<ChatStats> {
    const response = await this.send("/api/v1/stats", { headers: this.headers() });
    return response.json() as Promise<ChatStats>;
  }

  async health(): Promise<boolean> {
    try {
      const response = await this.send("/health", { headers: this.headers() });
      return response.ok;
    } catch {
      return false;
    }
  }

  /** Upstream WebSocket со всеми событиями пользователей web. */
  async openEvents(): Promise<WebSocket> {
    const headers = this.headers();
    headers.set("Upgrade", "websocket");
    const response = await fetch(`${this.root}/api/v1/events/web`, { headers });
    const socket = response.webSocket;
    if (!socket) {
      throw new ChatApiError(502, `Chat API не открыл WebSocket: HTTP ${response.status}`);
    }
    return socket;
  }

  private async send(path: string, init: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.root}${path}`, { ...init, redirect: "manual" });
    } catch (error) {
      throw new ChatApiError(503, `Chat API недоступен: ${String(error)}`);
    }
    if (response.ok || response.status === 204) return response;

    const text = await response.text();
    if (response.status >= 300 && response.status < 400) {
      throw new ChatApiError(502, "Cloudflare Access не пропустил запрос к Chat API");
    }
    // 401/403 от Chat API означают неверный APP token, а не гостевой: браузеру это 502.
    if (response.status === 401 || response.status === 403) {
      throw new ChatApiError(502, `Chat API отклонил токен приложения (HTTP ${response.status})`);
    }
    throw new ChatApiError(response.status, text || response.statusText);
  }
}

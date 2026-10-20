"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  activePeople,
  chatApiConfigured,
  ensureGuest,
  getState,
  getStats,
  openEvents,
  reportAndSearch,
  sendMessage,
  fetchPartnerMedia,
  startSearch,
  stopChat,
  type ChatEvent,
  type Phase,
} from "@/lib/chat-api";

type UiMessage = {
  id: string;
  role: "me" | "partner" | "system";
  text: string;
  mediaUrl?: string;
  mediaKind?: string;
};

const phaseLabel: Record<Exclude<Phase, "idle">, string> = {
  searching: "Ищем собеседника…",
  chatting: "Диалог",
};

function formatOnline(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  const word =
    mod100 > 10 && mod100 < 20
      ? "человек"
      : mod10 === 1
        ? "человек"
        : mod10 >= 2 && mod10 <= 4
          ? "человека"
          : "человек";
  return `${count} ${word} онлайн`;
}

function nextId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function PartnerFile({ url, kind }: { url: string; kind: string }) {
  if (kind === "voice") return <audio controls src={url} />;
  if (kind === "photo") return <img src={url} alt="Фото собеседника" />;
  return <video controls playsInline src={url} />;
}

export function ChatRoom() {
  const configured = chatApiConfigured();
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">(
    "closed",
  );
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const pushSystem = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: "system", text }]);
  };

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    let closeWs: (() => void) | undefined;

    const onEvent = (event: ChatEvent) => {
      if (event.type === "partner_found") {
        setPhase("chatting");
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "system",
            text: "Собеседник найден. Можете писать.",
          },
        ]);
        return;
      }
      if (event.type === "message") {
        setPhase("chatting");
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "partner", text: event.text },
        ]);
        return;
      }
      if (event.type === "media") {
        setPhase("chatting");
        const token = tokenRef.current;
        const mediaId = event.media_id;
        if (!token || !mediaId) return;
        void fetchPartnerMedia(token, mediaId)
          .then((file) => {
            if (cancelled) {
              URL.revokeObjectURL(file.url);
              return;
            }
            setMessages((prev) => [
              ...prev,
              {
                id: nextId(),
                role: "partner",
                text: "",
                mediaUrl: file.url,
                mediaKind: event.kind || file.kind,
              },
            ]);
          })
          .catch(() => {
            if (!cancelled) pushSystem("Собеседник прислал файл, но он не открылся.");
          });
        return;
      }
      if (event.type === "partner_left") {
        setPhase("idle");
        const reason =
          event.reason === "reported"
            ? "Собеседник пожаловался. Диалог завершён."
            : event.reason === "undeliverable"
              ? "Собеседник недоступен. Диалог завершён."
              : "Собеседник вышел из чата.";
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "system", text: reason },
        ]);
      }
    };

    (async () => {
      try {
        const guest = await ensureGuest();
        if (cancelled) return;
        tokenRef.current = guest.token;
        const current = await getState(guest.token);
        if (cancelled) return;
        setPhase(current);
        if (current === "searching") {
          pushSystem("Поиск уже идёт. Ждём собеседника.");
        } else if (current === "chatting") {
          pushSystem("Диалог восстановлен. Можно писать.");
        }
        closeWs = openEvents(guest.token, onEvent, setWsStatus);
        setReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не удалось подключиться к чату",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      closeWs?.();
    };
  }, [configured]);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;

    const load = async () => {
      try {
        const stats = await getStats();
        if (!cancelled) setOnline(activePeople(stats));
      } catch {
        /* Счётчик не должен ломать сам чат. */
      }
    };

    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [configured]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, phase]);

  async function withToken<T>(
    fn: (token: string) => Promise<T>,
  ): Promise<T | undefined> {
    const token = tokenRef.current;
    if (!token) {
      setError("Сессия не готова");
      return undefined;
    }
    setBusy(true);
    setError(null);
    try {
      return await fn(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка запроса");
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    const phaseNext = await withToken(startSearch);
    if (!phaseNext) return;
    setPhase(phaseNext);
    pushSystem(
      phaseNext === "chatting"
        ? "Собеседник найден сразу. Можете писать."
        : "Ищем собеседника…",
    );
  }

  async function handleStop() {
    const result = await withToken(stopChat);
    if (!result) return;
    setPhase("idle");
    pushSystem(result.wasActive ? "Вы вышли из чата." : "Поиск остановлен.");
  }

  async function handleNext() {
    const phaseNext = await withToken(startSearch);
    if (!phaseNext) return;
    setPhase(phaseNext);
    pushSystem(
      phaseNext === "chatting"
        ? "Новый собеседник найден."
        : "Ищем следующего собеседника…",
    );
  }

  async function handleReport() {
    const phaseNext = await withToken(reportAndSearch);
    if (!phaseNext) return;
    setPhase(phaseNext);
    pushSystem(
      phaseNext === "chatting"
        ? "Жалоба отправлена. Новый собеседник найден."
        : "Жалоба отправлена. Ищем другого…",
    );
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || phase !== "chatting") return;
    setDraft("");
    setMessages((prev) => [...prev, { id: nextId(), role: "me", text }]);
    const result = await withToken((token) => sendMessage(token, text));
    if (!result) return;
    if (!result.delivered || result.phase !== "chatting") {
      setPhase("idle");
      pushSystem("Сообщение не доставлено. Диалог завершён.");
    }
  }

  if (!configured) {
    return (
      <section className="chat-shell">
        <div className="chat-card">
          <h1>Чат пока недоступен</h1>
          <p className="chat-lead">
            Задайте <code>NEXT_PUBLIC_CHAT_API_URL</code> — адрес Worker чата
            (локально обычно <code>http://127.0.0.1:8787</code>).
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-shell">
      <div className="chat-card">
        <header className="chat-head">
          <div>
            <p className="chat-kicker">Искра</p>
            <h1>Анонимный чат</h1>
          </div>
          <div className="chat-meta" aria-live="polite">
            <span className={`chat-dot chat-dot-${wsStatus}`} />
            <span>
              {online === null ? "…" : formatOnline(online)}
              {phase === "idle" ? "" : ` · ${phaseLabel[phase]}`}
              {wsStatus !== "open" ? " · соединение…" : ""}
            </span>
          </div>
        </header>

        {!ready && !error ? <p className="chat-lead">Подключаемся…</p> : null}
        {error ? (
          <p className="chat-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="chat-messages" ref={listRef} aria-live="polite">
          {messages.length === 0 ? (
            <p className="chat-empty">
              Нажмите «Найти собеседника», чтобы встать в общую очередь с VK и
              Telegram.
            </p>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className={`chat-bubble chat-bubble-${item.role}`}
              >
                {item.mediaUrl ? (
                  <PartnerFile url={item.mediaUrl} kind={item.mediaKind || "photo"} />
                ) : (
                  item.text
                )}
              </div>
            ))
          )}
        </div>

        <div className="chat-actions">
          {phase === "idle" ? (
            <button
              type="button"
              className="btn btn-lime"
              disabled={busy || !ready}
              onClick={handleSearch}
            >
              Найти собеседника
            </button>
          ) : null}
          {phase === "searching" ? (
            <>
              <p className="chat-waiting">Ждём в очереди…</p>
              <button
                type="button"
                className="btn btn-dark"
                disabled={busy}
                onClick={handleStop}
              >
                Отменить поиск
              </button>
            </>
          ) : null}
          {phase === "chatting" ? (
            <>
              <button
                type="button"
                className="btn btn-lime"
                disabled={busy}
                onClick={handleNext}
              >
                Следующий
              </button>
              <button
                type="button"
                className="btn btn-dark"
                disabled={busy}
                onClick={handleStop}
              >
                Выйти
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={handleReport}
              >
                Жалоба
              </button>
            </>
          ) : null}
        </div>

        <form className="chat-composer" onSubmit={handleSend}>
          <label className="visually-hidden" htmlFor="chat-input">
            Сообщение
          </label>
          <input
            id="chat-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              phase === "chatting"
                ? "Напишите сообщение…"
                : "Сначала найдите собеседника"
            }
            disabled={busy || phase !== "chatting"}
            maxLength={4096}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-lime"
            disabled={busy || phase !== "chatting" || !draft.trim()}
          >
            Отправить
          </button>
        </form>
      </div>
    </section>
  );
}

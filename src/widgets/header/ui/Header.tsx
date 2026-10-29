"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fetchSession, logout, requestCode, verifyCode } from "@/shared/api/auth";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

const links = [
  { href: "/", label: "Главная", match: "home" as const },
  { href: "/chat/#voice", label: "Голосовой чат", match: "none" as const },
  { href: "/chat/", label: "Текстовый чат", match: "chat" as const },
  { href: "/chat/#group", label: "Групповой чат", match: "none" as const },
  { href: "/chat/#friends", label: "Друзья", match: "none" as const },
];

type LinkMatch = (typeof links)[number]["match"];

/** Стадии формы входа: email → код на почту → вход выполнен. */
type AuthStage = "email" | "code" | "session";

export function Header() {
  const pathname = usePathname();
  const onChat = pathname === "/chat" || pathname === "/chat/";
  const onHome = pathname === "/" || pathname === "";
  const [open, setOpen] = useState(false);

  const [session, setSession] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [stage, setStage] = useState<AuthStage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<HTMLButtonElement>(null);
  /** Номер «прогона» формы: ответ закончившегося запроса не должен перерисовать новый. */
  const flowRef = useRef(0);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    fetchSession().then((value) => setSession(value?.email ?? null));
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 75rem)");
    const closeIfWide = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", closeIfWide);
    return () => media.removeEventListener("change", closeIfWide);
  }, []);

  useEffect(() => {
    if (!open && !authOpen) return;
    const close = open ? () => setOpen(false) : () => setAuthOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab" && authOpen && sheetRef.current) {
        // Простая ловушка фокуса: Tab не выпускает из диалога.
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, authOpen]);

  // Закрытие возвращает фокус на кнопку, открывшую диалог.
  useEffect(() => {
    if (authOpen) return;
    openerRef.current?.focus();
    openerRef.current = null;
  }, [authOpen]);

  useEffect(() => {
    if (!authOpen) return;
    if (stage === "session") {
      sessionRef.current?.focus();
    } else {
      (stage === "email" ? emailRef : codeRef).current?.focus();
    }
  }, [authOpen, stage]);

  const openAuth = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setAuthError(null);
    setStage(session ? "session" : "email");
    setCode("");
    flowRef.current += 1;
    setAuthOpen(true);
  };

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    const flow = flowRef.current;
    setBusy(true);
    setAuthError(null);
    try {
      const result = await requestCode(email);
      if (flow !== flowRef.current) return;
      if (!result.ok) {
        setAuthError(result.detail);
        return;
      }
      setStage("code");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const flow = flowRef.current;
    setBusy(true);
    setAuthError(null);
    try {
      const result = await verifyCode(email, code);
      if (flow !== flowRef.current) return;
      if (!result.ok) {
        setAuthError(result.detail);
        return;
      }
      setSession(result.email);
      setStage("session");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    const flow = flowRef.current;
    setBusy(true);
    try {
      const sent = await logout();
      if (flow !== flowRef.current) return;
      if (!sent) {
        setAuthError("Не удалось выйти, попробуйте ещё раз");
        return;
      }
      setSession(null);
      setStage("email");
      setEmail("");
      setAuthOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const isActive = (match: LinkMatch) => {
    if (match === "chat") return onChat;
    if (match === "home") return onHome;
    return false;
  };

  return (
    <div className="header-slot">
      <header className="header">
        <div className="header-inner">
          <Logo />

          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="nav"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="nav-toggle-lines" />
          </button>

          <nav className={open ? "nav is-open" : "nav"} id="nav" aria-label="Основное меню">
            {links.map((link) => {
              const active = isActive(link.match);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={active ? "is-active" : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <button className="header-lang" type="button" aria-label="Язык: Русский">
              <svg aria-hidden="true" width="24" height="17" viewBox="0 0 24 17">
                <rect width="24" height="17" fill="#ffffff" />
                <rect y="5.67" width="24" height="5.66" fill="#2a4bd0" />
                <rect y="11.33" width="24" height="5.67" fill="#e03a3e" />
              </svg>
              <span className="header-lang-label">Русский</span>
              <span className="header-lang-chevron" aria-hidden="true" />
            </button>

            <button
              className={`header-icon-btn header-profile${session ? " is-authed" : ""}`}
              type="button"
              aria-label={session ? `${session}, вход в аккаунт` : "Войти по email"}
              aria-haspopup="dialog"
              onClick={openAuth}
            >
              <Icon name="user" />
              <span className="header-profile-dot" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {authOpen && (
        <div className="auth-overlay" onClick={() => setAuthOpen(false)}>
          <div
            ref={sheetRef}
            className="auth-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Вход по email"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="auth-close"
              type="button"
              aria-label="Закрыть"
              onClick={() => setAuthOpen(false)}
            >
              ×
            </button>

            <p className="auth-title">Вход в neon chat</p>

            {stage === "email" && (
              <form className="auth-form" onSubmit={handleRequestCode}>
                <label className="auth-label" htmlFor="auth-email">
                  Email
                </label>
                <input
                  id="auth-email"
                  ref={emailRef}
                  className="auth-input"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <p className="auth-hint">Пришлём код подтверждения. Без пароля.</p>
                <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
                  {busy ? "Отправляем…" : "Получить код"}
                </button>
                {authError && <p className="auth-error" role="alert">{authError}</p>}
              </form>
            )}

            {stage === "code" && (
              <form className="auth-form" onSubmit={handleVerify}>
                <p className="auth-hint">
                  Код отправлен на <b>{email}</b>. Проверьте почту (и папку «Спам»).
                </p>
                <input
                  ref={codeRef}
                  className="auth-input auth-code"
                  aria-label="Шестизначный код из письма"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                />
                <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
                  {busy ? "Проверяем…" : "Войти"}
                </button>
                {authError && <p className="auth-error" role="alert">{authError}</p>}
                <button className="auth-back" type="button" onClick={() => setStage("email")}>
                  Сменить email
                </button>
              </form>
            )}

            {stage === "session" && (
              <div className="auth-form">
                <p className="auth-hint">
                  Вы вошли как <b>{session}</b>
                </p>
                <button
                  ref={sessionRef}
                  className="btn btn-primary auth-submit"
                  type="button"
                  disabled={busy}
                  onClick={handleLogout}
                >
                  {busy ? "Выходим…" : "Выйти"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

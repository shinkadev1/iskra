"use client";

import { useEffect, useState } from "react";
import {
  readCookieConsent,
  storeCookieConsent,
  type CookieConsent,
} from "@/shared/lib/cookie-consent";
import { registerVisitor } from "@/shared/api/chat";
import { clearVisitorCookie } from "@/shared/lib/visitor";

/** Плашка внизу экрана, пока человек не выбрал, сохранять ли куку. */
export function CookieNotice() {
  const [choice, setChoice] = useState<CookieConsent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCookieConsent();
    setChoice(stored);
    setReady(true);
    if (stored === "save") void registerVisitor();
  }, []);

  useEffect(() => {
    if (!ready || choice) {
      document.body.classList.remove("has-cookie-notice");
      return;
    }
    document.body.classList.add("has-cookie-notice");
    return () => document.body.classList.remove("has-cookie-notice");
  }, [choice, ready]);

  const handleSave = () => {
    storeCookieConsent("save");
    setChoice("save");
    void registerVisitor();
  };

  const handleSkip = () => {
    storeCookieConsent("skip");
    clearVisitorCookie();
    setChoice("skip");
  };

  if (!ready || choice) return null;

  return (
    <aside className="cookie-notice" aria-label="Мы используем куки">
      <p>Мы используем куки</p>
      <div className="cookie-notice-actions">
        <button className="btn btn-lime" type="button" onClick={handleSave}>
          Сохранять
        </button>
        <button className="btn btn-ghost" type="button" onClick={handleSkip}>
          Не сохранять
        </button>
      </div>
    </aside>
  );
}

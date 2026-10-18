/** Выбор пользователя: сохранять куку или нет. Само решение лежит в localStorage, не в куке. */

const CHOICE_KEY = "iskra_cookie_consent";

export type CookieConsent = "save" | "skip";

export const COOKIE_CONSENT_HEADER = "X-Cookie-Consent";
export const COOKIE_CONSENT_SAVE = "save";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CHOICE_KEY);
  return value === "save" || value === "skip" ? value : null;
}

export function storeCookieConsent(choice: CookieConsent): void {
  window.localStorage.setItem(CHOICE_KEY, choice);
}

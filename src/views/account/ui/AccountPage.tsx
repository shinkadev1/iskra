"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Account,
  type Subscription,
  cancelSubscription,
  fetchSubscription,
} from "@/shared/api/account";
import { logout } from "@/shared/api/auth";
import { payUrl } from "@/shared/config/site";
import { Icon } from "@/shared/ui/icon";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

const PAYMENTS_PREVIEW = 5;

type State =
  | { kind: "loading" }
  | { kind: "unauthorized" }
  | { kind: "error"; detail: string }
  | { kind: "ready"; account: Account };

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" });
}

function formatRub(amount: number): string {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

function formatDays(days: number): string {
  const rest100 = days % 100;
  const rest10 = days % 10;
  if (rest100 < 11 || rest100 > 14) {
    if (rest10 === 1) return `${days} день`;
    if (rest10 >= 2 && rest10 <= 4) return `${days} дня`;
  }
  return `${days} дней`;
}

function cardLabel(sub: Subscription): string {
  if (!sub.card_attached) return "Карта отвязана";
  return sub.card_last4 ? `Карта •••• ${sub.card_last4}` : "Карта";
}

function openAuth() {
  window.dispatchEvent(new CustomEvent("neon:open-auth"));
}

export function AccountPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [showAll, setShowAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const load = useCallback(async () => {
    const result = await fetchSubscription();
    if (result.ok) setState({ kind: "ready", account: result.account });
    else if (result.kind === "unauthorized") setState({ kind: "unauthorized" });
    else setState({ kind: "error", detail: result.detail });
  }, []);

  useEffect(() => {
    void load();
    const reload = () => {
      setState({ kind: "loading" });
      void load();
    };
    window.addEventListener("neon:auth-changed", reload);
    return () => window.removeEventListener("neon:auth-changed", reload);
  }, [load]);

  const closeConfirm = useCallback(() => {
    if (cancelBusy) return;
    setConfirmOpen(false);
  }, [cancelBusy]);

  useEffect(() => {
    if (!confirmOpen) return;
    const modal = modalRef.current;
    modal?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeConfirm();
        return;
      }
      if (event.key !== "Tab" || !modal) return;
      const focusables = Array.from(
        modal.querySelectorAll<HTMLElement>("button:not(:disabled), [href]"),
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
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmOpen, closeConfirm]);

  // Закрытие возвращает фокус на кнопку, открывшую диалог.
  useEffect(() => {
    if (confirmOpen) return;
    openerRef.current?.focus();
    openerRef.current = null;
  }, [confirmOpen]);

  const openConfirm = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setCancelError(null);
    setConfirmOpen(true);
  };

  const handleCancel = async () => {
    setCancelBusy(true);
    setCancelError(null);
    try {
      const result = await cancelSubscription();
      if (!result.ok) {
        if (result.kind === "unauthorized") {
          setConfirmOpen(false);
          setState({ kind: "unauthorized" });
        } else {
          setCancelError(result.detail);
        }
        return;
      }
      setConfirmOpen(false);
      await load();
    } finally {
      setCancelBusy(false);
    }
  };

  const handleLogout = async () => {
    setLogoutBusy(true);
    setLogoutError(null);
    const sent = await logout();
    if (!sent) {
      setLogoutBusy(false);
      setLogoutError("Не удалось выйти, попробуйте ещё раз");
      return;
    }
    router.replace("/");
  };

  return (
    <>
      <Header />
      <main id="main" className="account-main">
        <div className="wrap">{renderBody()}</div>
      </main>
      <Footer />
      {state.kind === "ready" && state.account.subscription && confirmOpen && (
        <CancelModal
          sub={state.account.subscription}
          periodEnd={state.account.subscription.period_end ?? state.account.premium_until}
          modalRef={modalRef}
          busy={cancelBusy}
          error={cancelError}
          onClose={closeConfirm}
          onConfirm={handleCancel}
        />
      )}
    </>
  );

  function renderBody() {
    if (state.kind === "loading") {
      return (
        <p className="account-status" role="status">
          Загружаем данные…
        </p>
      );
    }
    if (state.kind === "unauthorized") {
      return (
        <div className="account-empty">
          <h1 className="account-empty-title">Войдите, чтобы открыть кабинет</h1>
          <button className="account-btn account-btn-primary" type="button" onClick={openAuth}>
            Войти по email
          </button>
        </div>
      );
    }
    if (state.kind === "error") {
      return (
        <div className="account-empty">
          <p className="account-error" role="alert">
            {state.detail}
          </p>
          <button
            className="account-btn account-btn-ghost"
            type="button"
            onClick={() => {
              setState({ kind: "loading" });
              void load();
            }}
          >
            Повторить
          </button>
        </div>
      );
    }
    return renderAccount(state.account);
  }

  function renderAccount(account: Account) {
    const sub = account.subscription;
    const payments = showAll ? account.payments : account.payments.slice(0, PAYMENTS_PREVIEW);
    const periodEnd = sub?.period_end ?? account.premium_until;

    return (
      <>
        <div className="account-profile">
          <div className="account-avatar" aria-hidden="true">
            <Icon name="user" />
            <span className="account-avatar-dot" />
          </div>
          <div className="account-profile-text">
            <p className="account-eyebrow">Личный кабинет</p>
            <h1 className="account-email">{account.email}</h1>
          </div>
          <button
            className="account-btn account-btn-outline account-logout"
            type="button"
            disabled={logoutBusy}
            onClick={handleLogout}
          >
            {logoutBusy ? "Выходим…" : "Выйти"}
          </button>
        </div>
        {logoutError && (
          <p className="account-error" role="alert">
            {logoutError}
          </p>
        )}

        <h2 className="account-h2">Моя подписка</h2>
        {sub || account.premium_active ? (
          <section className="account-card" aria-label="Моя подписка">
            <div className="account-plan">
              <div className="account-plan-icon" aria-hidden="true">
                <Icon name="spark" />
              </div>
              <div className="account-plan-main">
                <p className="account-plan-title">
                  <span>Премиум{sub ? ` · ${sub.plan_name}` : ""}</span>
                  {sub && (
                    <span className="account-tag">
                      {formatRub(sub.price_rub)} / {formatDays(sub.days)}
                    </span>
                  )}
                </p>
                <p className="account-plan-desc">
                  Фото, видео и голосовые в чате
                  {sub && ` · автопродление ${sub.auto_renew ? "включено" : "выключено"}`}
                </p>
              </div>
              <div className={`account-until${account.premium_active ? "" : " is-expired"}`}>
                <span>{account.premium_active ? "Активна до" : "Закончилась"}</span>
                <b>{formatDate(periodEnd)}</b>
              </div>
            </div>
            <div className="account-actions">
              <a className="account-btn account-btn-primary" href={`${payUrl}/`}>
                Сменить тариф
              </a>
              {sub?.auto_renew && (
                <button
                  className="account-btn account-btn-ghost"
                  type="button"
                  aria-haspopup="dialog"
                  onClick={openConfirm}
                >
                  Отменить подписку
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className="account-card" aria-label="Моя подписка">
            <p className="account-plan-title">Подписки пока нет</p>
            <p className="account-plan-desc">
              Премиум открывает фильтры поиска, фото, видео и голосовые сообщения.
            </p>
            <div className="account-actions">
              <a className="account-btn account-btn-primary" href={`${payUrl}/`}>
                Оформить премиум
              </a>
            </div>
          </section>
        )}

        <div className={sub ? "account-grid" : "account-grid is-single"}>
          {sub && (
            <section className="account-card" aria-label="Информация о подписке">
              <h2 className="account-h2 account-h2-in">Информация о подписке</h2>
              <dl className="account-rows">
                <div className="account-row">
                  <span className="account-row-icon" aria-hidden="true">▣</span>
                  <dt>Дата оформления</dt>
                  <dd>{formatDate(sub.started_at)}</dd>
                </div>
                <div className="account-row">
                  <span className="account-row-icon" aria-hidden="true">◷</span>
                  <dt>Следующее списание</dt>
                  <dd>
                    {sub.auto_renew && sub.next_charge
                      ? `${formatDate(sub.next_charge.at)} · ${formatRub(sub.next_charge.amount_rub)}`
                      : "—"}
                  </dd>
                </div>
                <div className="account-row">
                  <span className="account-row-icon" aria-hidden="true">▭</span>
                  <dt>Способ оплаты</dt>
                  <dd>{cardLabel(sub)}</dd>
                </div>
              </dl>
            </section>
          )}

          <section className="account-card" aria-label="История платежей">
            <h2 className="account-h2 account-h2-in">История платежей</h2>
            {account.payments.length === 0 ? (
              <p className="account-plan-desc">Платежей пока нет.</p>
            ) : (
              <>
                <div className="account-table-wrap">
                  <table className="account-table">
                    <thead>
                      <tr>
                        <th scope="col">Дата</th>
                        <th scope="col">Тариф</th>
                        <th scope="col">Сумма</th>
                        <th scope="col">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment, index) => (
                        <tr key={`${payment.created_at}-${index}`}>
                          <td>{formatDate(payment.created_at)}</td>
                          <td>{payment.plan_name}</td>
                          <td className="account-sum">{formatRub(payment.amount_rub)}</td>
                          <td>
                            <span
                              className={`account-pill ${
                                payment.status === "paid" ? "is-paid" : "is-failed"
                              }`}
                            >
                              ● {payment.status === "paid" ? "оплачено" : "не прошёл"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {account.payments.length > PAYMENTS_PREVIEW && (
                  <button
                    className="account-more"
                    type="button"
                    aria-expanded={showAll}
                    onClick={() => setShowAll((value) => !value)}
                  >
                    {showAll ? "Свернуть ←" : "Показать все платежи →"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      </>
    );
  }
}

function CancelModal({
  sub,
  periodEnd,
  modalRef,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  sub: Subscription;
  periodEnd: string | null;
  modalRef: React.RefObject<HTMLDivElement | null>;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="account-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="account-modal-close" type="button" aria-label="Закрыть" onClick={onClose}>
          ✕
        </button>
        <div className="account-modal-icon" aria-hidden="true">!</div>
        <h3 id="account-modal-title" className="account-modal-title">
          Отмена подписки
        </h3>
        <p className="account-modal-text">Уверены, что хотите отменить подписку?</p>
        <div className="account-row">
          <span className="account-row-icon" aria-hidden="true">▭</span>
          <span className="account-row-label">Способ оплаты</span>
          <span className="account-row-value">{cardLabel(sub)}</span>
        </div>
        <div className="account-warn">
          <span className="account-warn-icon" aria-hidden="true">ⓘ</span>
          <span>
            Автопродление отключится, карта будет отвязана. Премиум сохранится до конца
            оплаченного периода — <b>{formatDate(periodEnd)}</b>.
          </span>
        </div>
        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}
        <div className="account-modal-actions">
          <button
            className="account-btn account-btn-danger"
            type="button"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Отменяем…" : "Отменить подписку"}
          </button>
          <button
            className="account-btn account-btn-ghost"
            type="button"
            data-autofocus
            disabled={busy}
            onClick={onClose}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

# Архитектура landing

Проверено: **2026-10-31**.

## Поток данных

Браузер или mobile → Worker `/api/v1/guests`, `/me/*` → Chat API как web-участник. События Chat API → GuestHub → гостевой WebSocket. Email-коды идут через Resend, данные кодов — в AUTH_KV.

## Точки входа

| Путь | Ответственность |
| --- | --- |
| `src/app/` | Страницы /, /chat, /policy, /terms, /account (личный кабинет, noindex); layout и metadata. |
| `src/views/` | Композиции страниц. |
| `src/widgets/` | Крупные UI-блоки и аналитика. |
| `src/features/anonymous-chat/ui/ChatRoom.tsx` | Интерфейс диалога. |
| `src/shared/api/` | Клиенты чата, email-авторизации и кабинета (`account.ts`). |
| `src/views/account/` | Страница /account: подписка, платежи, отмена подписки. |
| `src/shared/content/` | Тексты политики и условий. |
| `next.config.ts` | Статический экспорт в out/. |
| `worker/src/index.ts` | Публичные маршруты гостей, /me, stats, auth. |
| `worker/src/chat-api.ts` | Сервисный клиент Chat API. |
| `worker/src/guest-hub.ts` | Durable Object для выдачи событий. |
| `worker/src/account.ts` | GET `/api/v1/me/subscription` и POST `/api/v1/me/subscription/cancel`: по email из cookie-сессии вызывает pay-сервис `/internal/web/account[/cancel]` (Bearer CHAT_API_APP_TOKEN, база — `PREMIUM_API_URL` или https://pay.chatwithyou.site); 401 без сессии, 409 без подписки, 502 при сбое pay. |
| `worker/src/auth.ts` | Email-коды, KV и cookie-сессии. |
| `worker/wrangler.jsonc` | Маршруты, origins и bindings. |

## Контракты и ограничения

- Next.js настроен на статический экспорт. Серверную логику выполнять в Worker; Next server runtime на GitHub Pages отсутствует.
- Гостевой JWT чата и email-сессия — разные механизмы, не считать их автоматически одной учётной записью.
- Сервисные токены Chat API и Cloudflare Access остаются в Worker, не в NEXT_PUBLIC_* и клиентском bundle.
- Маршруты `/me/subscription*` требуют email-сессию (cookie), не гостевой JWT; POST проверяет Origin. Контракт ответа pay-сервиса задаёт vk-bot.
- Изменения публичных /me API и событий затрагивают mobile-app.
- `@/` указывает на src/. Сохранять текущую структуру views/widgets/features/shared.

## Развёртывание

`.github/workflows/pages.yml` на push в `main` собирает out/ и публикует в gh-pages. Worker имеет отдельный `npm run deploy`; сборка сайта его не деплоит.

Схема описывает репозиторий, а не подтверждённое состояние production.

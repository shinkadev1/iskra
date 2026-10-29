interface Env {
  CHAT_API_APP_TOKEN: string;
  GUEST_JWT_SECRET: string;
  CF_ACCESS_CLIENT_ID: string;
  CF_ACCESS_CLIENT_SECRET: string;
  /** KV для кодов и сессий email-авторизации (wrangler kv namespace create AUTH). */
  AUTH_KV: KVNamespace;
  /** Ключ Resend (wrangler secret put RESEND_API_KEY). */
  RESEND_API_KEY: string;
  /** Отправитель писем, например "Iskra <noreply@chatwithyou.site>". */
  AUTH_MAIL_FROM: string;
  ALLOWED_ORIGINS: string;
}

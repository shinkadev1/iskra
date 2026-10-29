import Link from "next/link";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import {
  supportEmail,
  supportTelegramUrl,
  supportVkUrl,
  telegramBotUrl,
  vkChatUrl,
} from "@/shared/config";

const supportMail = `mailto:${supportEmail}`;

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Анонимный чат для знакомств и общения в Telegram и VK.</p>
        </div>
        <nav aria-label="Продукт">
          <p className="footer-title">Продукт</p>
          <ul>
            <li>
              <a href="/#features">Возможности</a>
            </li>
            <li>
              <a href="/#premium">Тарифы</a>
            </li>
            <li>
              <a href="/#premium">Premium</a>
            </li>
            <li>
              <a href="/#faq">FAQ</a>
            </li>
          </ul>
        </nav>
        <div>
          <p className="footer-title">Поддержка</p>
          <ul>
            <li>
              <a href={supportMail}>Email</a>
            </li>
            <li>
              <a href={supportTelegramUrl}>Telegram</a>
            </li>
            <li>
              <a href={supportVkUrl}>VK</a>
            </li>
          </ul>
        </div>
        <nav aria-label="Документы">
          <p className="footer-title">Документы</p>
          <ul>
            <li>
              <Link href="/policy/">Политика конфиденциальности</Link>
            </li>
            <li>
              <Link href="/terms/">Пользовательское соглашение</Link>
            </li>
            <li>
              <a href={`${supportMail}?subject=${encodeURIComponent("Отмена подписки")}`}>
                Отмена подписки
              </a>
            </li>
            <li>
              <a href={`${supportMail}?subject=${encodeURIComponent("Заявка на возврат")}`}>
                Возврат средств
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="copy-bar">
        <div className="wrap copy">
          <p className="copy-legal">
            © 2026 ChatWithYou
            <span>
              Шинкаренко В.А., ИНН 781312974811 · самозанятый, плательщик НПД
            </span>
          </p>
          <div className="copy-icons">
            <a className="copy-icon" href={telegramBotUrl} aria-label="Telegram">
              <Icon name="telegram" />
            </a>
            <a className="copy-icon" href={vkChatUrl} aria-label="ВКонтакте">
              <Icon name="vk" />
            </a>
            <a className="copy-icon" href="/" aria-label="Сайт">
              <Icon name="globe" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

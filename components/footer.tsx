import { Icon } from "@/components/icon";
import {
  supportEmail,
  supportTelegramUrl,
  supportVkUrl,
  telegramBotUrl,
  vkChatUrl,
} from "@/lib/site";

const supportMail = `mailto:${supportEmail}`;

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-title">Продукт</p>
          <ul>
            <li>
              <a href="/#features">Возможности</a>
            </li>
            <li>
              <a href="/#premium">Тарифы</a>
            </li>
            <li>
              <a href="/#premium">Премиум</a>
            </li>
            <li>
              <a href="/#faq">FAQ</a>
            </li>
          </ul>
        </div>
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
        <div>
          <p className="footer-title">Правовая информация</p>
          <ul>
            <li>
              <a href="/policy/">Политика конфиденциальности</a>
            </li>
            <li>
              <a href="/terms/">Условия использования</a>
            </li>
            <li>
              <a href={`${supportMail}?subject=${encodeURIComponent("Отмена подписки")}`}>
                Отмена подписки
              </a>
            </li>
            <li>
              <a href={`${supportMail}?subject=${encodeURIComponent("Заявка на возврат")}`}>
                Заявка на возврат
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="copy-bar">
        <div className="wrap copy">
          <p className="copy-legal">
            © 2026 ChatWithYou. Все права защищены.
            <br />
            <span>
              Шинкаренко В.А. ИНН: 781312974811
              <br />
              Плательщик налога на профессиональный доход (самозанятый)
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

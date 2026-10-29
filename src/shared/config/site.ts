export const siteName = "neon chat";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
).replace(/\/$/, "");

export const siteTitle = "neon chat — анонимный чат для знакомств и общения";

export const siteDescription =
  "neon chat — анонимный чат во ВКонтакте и Telegram для знакомств и общения. Выбери собеседника и начни диалог за пару секунд.";

export const vkUrl = "https://vk.com/im?sel=-242042389";

export const vkChatUrl = "https://vk.me/club242172702";

export const telegramBotUrl = "https://t.me/IskraDatingTopbot";

export const supportEmail = "support@chatwithyou.site";

export const supportTelegramUrl = "https://t.me/iskradatingsupport";

export const supportVkUrl = "https://vk.ru/club242172702";

export const payUrl = "https://pay.chatwithyou.site";

export const features = [
  {
    icon: "search",
    tone: "orange",
    title: "Мгновенный поиск",
    text: "Поиск нового собеседника за несколько секунд. Более 1.000.000 собеседников.",
  },
  {
    icon: "list",
    tone: "blue",
    title: "Фильтр поиска",
    text: "Ищи собеседников по интересам, полу, возрасту и городу.",
  },
  {
    icon: "lock",
    tone: "green",
    title: "Анонимность",
    text: "Общение без риска и обязательств. Заполнения профиля не обязательно.",
  },
  {
    icon: "swap",
    tone: "purple",
    title: "Расширенный медиа-чат",
    text: "Отправляй фото, видео, стикеры, гифки и голосовые сообщения.",
  },
  {
    icon: "shield",
    tone: "yellow",
    title: "Защита от спама и мошенников",
    text: "Нажмите кнопку пожаловаться, если увидели спам и заподозрели мошенничество, наша поддержка разберет каждый случай.",
  },
  {
    icon: "spark",
    tone: "pink",
    title: "VIP и общение по интересам",
    text: "Приоритетный поиск, общение по интересам, расширенный поиск.",
  },
] as const;

export const steps = [
  {
    icon: "chat",
    tone: "orange",
    title: "Напиши боту",
    text: "Открой чат во ВКонтакте, Telegram или на сайте и нажми «Начать».",
  },
  {
    icon: "people",
    tone: "blue",
    title: "Выбери, кого ищешь",
    text: "Фильтры поиска по полу, городу и интересам.",
  },
  {
    icon: "search",
    tone: "purple",
    title: "Нажми «Поиск»",
    text: "Через несколько секунд бот подберет тебе собеседника.",
  },
  {
    icon: "heart",
    tone: "green",
    title: "Общайся",
    text: "Переписывайся без ограничений. Диалог можно закончить в любой момент.",
  },
] as const;

export const tariffs = [
  {
    id: "trial",
    name: "Пробный",
    term: "3 дня",
    price: "1",
    badge: "ограниченно",
    badgeTone: "red",
    tone: "slate",
  },
  {
    id: "week",
    name: "Неделя",
    term: "7 дней",
    price: "299",
    tone: "blue",
  },
  {
    id: "month",
    name: "Месяц",
    term: "30 дней",
    price: "999",
    tone: "orange",
  },
  {
    id: "year",
    name: "Год",
    term: "365 дней",
    price: "2999",
    tone: "purple",
  },
] as const;

export const premiumPerks = [
  {
    icon: "filter",
    tone: "blue",
    title: "Умные фильтры поиска",
    text: "Находи собеседников по возрасту, полу, городу и интересам",
  },
  {
    icon: "camera",
    tone: "green",
    title: "Обмен медиа",
    text: "Отправляй фото, видео и GIF без ограничений",
  },
  {
    icon: "mic",
    tone: "purple",
    title: "Голосовые сообщения",
    text: "Общайся голосом для более живого контакта",
  },
  {
    icon: "crown",
    tone: "yellow",
    title: "VIP «Топ-чат»",
    text: "Эксклюзивная комната для премиум-пользователей",
  },
  {
    icon: "infinity",
    tone: "pink",
    title: "Безлимитные поиски",
    text: "Ищи новых собеседников без ограничений",
  },
  {
    icon: "shield",
    tone: "cyan",
    title: "Приоритетная поддержка",
    text: "Мгновенная помощь от нашей команды",
  },
] as const;

export const faq = [
  {
    question: "Что такое neon chat?",
    answer:
      "Это анонимный чат, который работает через ботов в Telegram и VK. Сервис находит собеседника за секунды, а общаться можно текстом, голосом и медиа.",
  },
  {
    question: "Нужно ли регистрироваться?",
    answer:
      "Нет. Достаточно открыть диалог сообщества. Отдельный аккаунт на сайте не создаётся.",
  },
  {
    question: "Можно ли выбрать пол собеседника?",
    answer: "Да. В меню есть «Выбрать пол партнера»: девушка, парень или любой.",
  },
  {
    question: "Как закончить разговор?",
    answer:
      "В диалоге есть «Закончить диалог» и «Следующий собеседник». Напиши «Начать», чтобы вернуться в меню.",
  },
  {
    question: "Что делает жалоба?",
    answer:
      "Кнопка «Пожаловаться на спам» завершает текущий диалог и сразу ищет другого собеседника.",
  },
] as const;

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteName,
        url: siteUrl,
        inLanguage: "ru",
        description: siteDescription,
      },
      {
        "@type": "WebApplication",
        name: siteName,
        url: siteUrl,
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        inLanguage: "ru",
        description: siteDescription,
        offers: tariffs.map((tariff) => ({
          "@type": "Offer",
          name: `${tariff.name}, ${tariff.term}`,
          price: tariff.price,
          priceCurrency: "RUB",
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

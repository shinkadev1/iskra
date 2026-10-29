import Link from "next/link";
import { VkLink } from "@/shared/ui/vk-link";
import { Icon, type IconName } from "@/shared/ui/icon";
import {
  features,
  payUrl,
  premiumPerks,
  steps,
  tariffs,
  telegramBotUrl,
  vkChatUrl,
} from "@/shared/config";
import { Faq } from "./Faq";

export function HomeLanding() {
  return (
    <>
      <section className="hero" id="top">
        <HeroGlow />
        <div className="wrap hero-grid">
          <div className="hero-card">
            <span className="hero-chip">
              <span className="hero-chip-dot" aria-hidden="true" />
              Telegram и VK
            </span>
            <h1>
              Анонимный чат для <span className="hero-grad">знакомств</span> и общения
            </h1>
            <p className="lede">
              Общайся анонимно в Telegram и VK. Бот находит собеседника за секунды — без
              регистрации и анкет.
            </p>
            <div className="icon-row">
              <Link className="btn btn-main" href="/chat/">
                Начать чат
              </Link>
              <a className="btn-ghost" href={telegramBotUrl}>
                <Icon name="telegram" />
                Telegram
              </a>
              <a className="btn-ghost" href={vkChatUrl}>
                <span className="btn-ghost-brand" aria-hidden="true">
                  VK
                </span>
                ВКонтакте
              </a>
            </div>
            <p className="hero-note">Более миллиона пользователей уже общаются в чате</p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <ChatDemo />
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow eyebrow-cyan">Возможности</span>
            <h2>Ваши возможности</h2>
          </div>
          <div className="cards">
            {features.map((feature) => (
              <article className="card" key={feature.title}>
                <span className={`card-icon icon-${feature.tone}`}>
                  <Icon name={feature.icon as IconName} stroke />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow eyebrow-pink">Четыре шага</span>
            <h2>Как это работает</h2>
          </div>
          <ol className="steps">
            {steps.map((step, index) => (
              <li className={`step-${step.tone}`} key={step.title}>
                <span className="step-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: "40px" }}>
            <VkLink className="btn btn-main">Начать знакомство</VkLink>
          </div>
        </div>
      </section>

      <section className="tariffs" id="premium">
        <div className="wrap">
          <div className="section-head" style={{ alignItems: "center", textAlign: "center", maxWidth: "700px", marginInline: "auto" }}>
            <span className="eyebrow eyebrow-cyan">Premium</span>
            <h2>Раскрой весь потенциал</h2>
          </div>
          <div className="tariff-scroller">
            {tariffs.map((tariff) => (
              <article className="tariff-card" key={tariff.id}>
                <div style={{ minHeight: "28px" }}>
                  {"badge" in tariff && tariff.badge ? (
                    <p className="tariff-badge">{tariff.badge === "ограниченно" ? "Ограниченное предложение" : tariff.badge}</p>
                  ) : null}
                </div>
                <h3>{tariff.name}</h3>
                <p className="tariff-price">
                  {tariff.price} <span>₽</span>
                </p>
                <p className="tariff-term">{tariff.term}</p>
                <a className="tariff-btn" href={payUrl}>
                  Оплатить
                </a>
              </article>
            ))}
          </div>
          <p className="tariff-note">
            Оплачивая подписку, ты принимаешь{" "}
            <Link href="/policy/">политику конфиденциальности</Link>,{" "}
            <Link href="/terms/">пользовательское соглашение</Link> и{" "}
            <a href="#premium">тарифы</a>.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cards">
            {premiumPerks.map((perk) => (
              <article className="card benefit" key={perk.title}>
                <span className={`card-icon icon-${perk.tone}`}>
                  <Icon name={perk.icon as IconName} stroke />
                </span>
                <div>
                  <h3>{perk.title}</h3>
                  <p>{perk.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Faq />

      <section className="cta-band" id="start">
        <div className="wrap">
          <div className="cta-frame">
            <div className="cta-inner">
              <h2>Готов начать диалог?</h2>
              <p>Без регистрации и анкет: открой бота и найди собеседника за секунды.</p>
              <Link className="btn btn-main" href="/chat/">
                Начать чат
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Световые пятна, точечный узор и «созвездие» из мокапа. */
function HeroGlow() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div
        style={{
          position: "absolute",
          left: "-60px",
          top: "60px",
          width: "640px",
          height: "360px",
          background:
            "radial-gradient(closest-side, rgba(34,211,238,0.16), rgba(34,211,238,0) 100%)",
          filter: "blur(30px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "130px",
          top: "230px",
          width: "420px",
          height: "240px",
          background:
            "radial-gradient(closest-side, rgba(232,75,216,0.18), rgba(232,75,216,0) 100%)",
          filter: "blur(34px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-40px",
          top: "140px",
          width: "620px",
          height: "440px",
          background:
            "radial-gradient(closest-side, rgba(232,75,216,0.14), rgba(232,75,216,0) 100%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "0",
          top: "560px",
          width: "260px",
          height: "130px",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.4px, transparent 1.6px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage: "linear-gradient(225deg, #000, transparent 85%)",
          maskImage: "linear-gradient(225deg, #000, transparent 85%)",
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "0",
          top: "760px",
          width: "280px",
          height: "180px",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.4px, transparent 1.6px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "linear-gradient(45deg, #000, transparent 85%)",
          maskImage: "linear-gradient(45deg, #000, transparent 85%)",
          opacity: 0.5,
        }}
      />
      <svg
        width="520"
        height="340"
        viewBox="0 0 520 340"
        style={{ position: "absolute", left: 0, top: "560px", opacity: 0.45 }}
      >
        <g stroke="rgba(150,160,210,0.28)" strokeWidth="1" fill="none">
          <path d="M136 6 L180 78 L242 66 L276 20" />
          <path d="M180 78 L218 150 L328 178" />
          <path d="M218 150 L196 252 L264 288 L306 330" />
          <path d="M264 288 L378 262 L406 222" />
          <path d="M104 190 L196 252" />
        </g>
        <g fill="rgba(170,180,230,0.55)">
          <circle cx="136" cy="6" r="2.5" />
          <circle cx="180" cy="78" r="2.5" />
          <circle cx="242" cy="66" r="2" />
          <circle cx="276" cy="20" r="2" />
          <circle cx="218" cy="150" r="2.5" />
          <circle cx="328" cy="178" r="2" />
          <circle cx="196" cy="252" r="2.5" />
          <circle cx="264" cy="288" r="2.5" />
          <circle cx="306" cy="330" r="2" />
          <circle cx="378" cy="262" r="2" />
          <circle cx="406" cy="222" r="2" />
          <circle cx="104" cy="190" r="2" />
        </g>
      </svg>
    </div>
  );
}

/** Иллюстрация чата из мокапа: карточка с диалогом, голосом и полем ввода. */
function ChatDemo() {
  return (
    <div className="demo">
      <div className="demo-inner">
        <div className="demo-head">
          <span className="demo-avatar">?</span>
          <span className="demo-name">
            Собеседник
            <small>в сети</small>
          </span>
        </div>
        <div className="demo-msg">Привет! Чем увлекаешься?</div>
        <div className="demo-msg demo-msg-me demo-msg-me-pink">Привет! Музыка и кино. А ты?</div>
        <div className="demo-msg">Тоже! Скинешь любимый трек?</div>
        <div className="demo-msg demo-msg-me demo-msg-me-cyan demo-voice">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
          <svg
            width="120"
            height="22"
            viewBox="0 0 120 22"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M4 11v0M12 7v8M20 4v14M28 8v6M36 2v18M44 7v8M52 5v12M60 9v4M68 3v16M76 7v8M84 10v2M92 5v12M100 8v6M108 11v0" />
          </svg>
        </div>
        <div className="demo-input">
          <span className="demo-input-field">Напиши сообщение…</span>
          <span className="demo-send">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#04141a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

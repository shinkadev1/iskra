"use client";

import { useState } from "react";
import { faq } from "@/shared/config";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section" id="faq">
      <div className="wrap faq-wrap">
        <div className="section-head" style={{ alignItems: "center", textAlign: "center", marginInline: "auto" }}>
          <span className="eyebrow eyebrow-pink">FAQ</span>
          <h2>Частые вопросы</h2>
        </div>
        <div className="faq">
          {faq.map((item, index) => {
            const open = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            return (
              <article className={open ? "faq-item open" : "faq-item"} key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    {item.question}
                    <span aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-panel" id={panelId} role="region" aria-labelledby={buttonId}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

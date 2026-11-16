"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { BRACKETS, TARIFFS, type TariffMode } from "@/lib/data";
import { SectionHead, Arrow } from "./ui";

const MODES = Object.keys(TARIFFS) as TariffMode[];

export default function Tariffs() {
  const [mode, setMode] = useState<TariffMode>("auto");
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);

  // смена вкладки: карточки коротко «перещёлкиваются»
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".tcard__price, .tcard__time",
        { yPercent: 60, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.05, ease: "power3.out" },
      );
    },
    { scope: root, dependencies: [mode] },
  );

  const t = TARIFFS[mode];

  return (
    <section className="tariffs wrap" id="tariffs" ref={root}>
      <SectionHead
        label="Тарифы"
        index="USD за кг"
        aside={
          <>
            Ставка зависит от способа доставки и веса партии. Чем больше партия — тем дешевле килограмм. Итог считает{" "}
            <a href="#calc" data-open-calc className="ulink">
              калькулятор
            </a>
            .
          </>
        }
      >
        Тарифы <em>доставки</em>
      </SectionHead>

      <div className="tabs" role="tablist" aria-label="Способ доставки" data-fx="fade-up">
        {MODES.map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`tabs__btn ${mode === m ? "is-active" : ""}`}
            onClick={() => setMode(m)}
          >
            {TARIFFS[m].label}
            <small>{TARIFFS[m].time}</small>
          </button>
        ))}
        <span className="tabs__pill" style={{ "--i": MODES.indexOf(mode) } as React.CSSProperties} aria-hidden />
      </div>

      <div className="tgrid" data-fx="stagger">
        {BRACKETS.map((b, i) => {
          const popular = "popular" in b && b.popular;
          return (
            <article key={b.id} className={`tcard ${popular ? "tcard--pop" : ""}`} {...(popular ? { "data-spotlight": "" } : {})}>
              <svg className="tcard__border" aria-hidden>
                <rect x="1" y="1" rx="21" pathLength="100" />
              </svg>
              {popular && <span className="tcard__badge">Популярный</span>}
              <div className="tcard__top">
                <span className="tcard__range">{b.label}</span>
                <h3 className="tcard__for">{b.forWhom}</h3>
                <p className="tcard__note">{b.note}</p>
              </div>
              <div className="tcard__mid">
                <div className="tcard__price">
                  <b>{t.rates[i].toLocaleString("ru-RU")}</b>
                  <span>
                    $<br />/ кг
                  </span>
                </div>
                <div className="tcard__time">
                  {t.label} · {t.time}
                </div>
              </div>
              <ul className="tcard__perks">
                {t.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <a href="#calc" data-open-calc className={`btn ${popular ? "btn--accent" : "btn--ghost"} tcard__btn`}>
                <span>Рассчитать</span>
                <Arrow />
              </a>
            </article>
          );
        })}
      </div>
      <p className="tariffs__foot" data-fx="fade-up">
        Выкуп и проверка товара включены. К оплате — минимум 1 кг. Страховка — от 2% от объявленной стоимости.
      </p>
    </section>
  );
}

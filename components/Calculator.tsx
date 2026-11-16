"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCalc, setCalc } from "@/lib/calcStore";
import { gsap } from "@/lib/gsap";
import { calcCost, GOODS, FROM_CITIES, TO_CITIES, TARIFFS, type TariffMode } from "@/lib/data";
import { SectionHead, Arrow } from "./ui";

const MODES = Object.keys(TARIFFS) as TariffMode[];

/** Шкала веса: 0.5 → 1000 кг, логарифмическая, чтобы удобно было и с 2 кг, и с 300 кг. */
const W_MIN = 0.5;
const W_MAX = 1000;
const toKg = (p: number) => {
  const v = W_MIN * Math.pow(W_MAX / W_MIN, p / 1000);
  return v < 10 ? Math.round(v * 2) / 2 : v < 100 ? Math.round(v) : Math.round(v / 5) * 5;
};
const toPos = (kg: number) => Math.round((1000 * Math.log(kg / W_MIN)) / Math.log(W_MAX / W_MIN));

/** Секция калькулятора на странице. */
export default function Calculator() {
  return (
    <section className="calc wrap" id="calc">
      <SectionHead
        label="Калькулятор"
        index="расчёт за 15 минут"
        aside="Предварительная стоимость считается сразу. Оставьте контакты — менеджер уточнит детали и пришлёт точный расчёт."
      >
        Посчитайте <em>доставку</em>
      </SectionHead>
      <CalcForm />
    </section>
  );
}

/** Сама форма — та же и на странице, и в поп-апе «Рассчитать». */
export function CalcForm({ inModal = false }: { inModal?: boolean }) {
  // общее состояние: главная и поп-ап показывают одни и те же данные
  const { from, to, goods, mode, kg, name, phone, sent } = useCalc();
  const setFrom = (v: string) => setCalc({ from: v });
  const setTo = (v: string) => setCalc({ to: v });
  const setGoods = (v: string) => setCalc({ goods: v });
  const setMode = (v: TariffMode) => setCalc({ mode: v });
  const setKg = (v: number) => setCalc({ kg: v });
  const setName = (v: string) => setCalc({ name: v });
  const setPhone = (v: string) => setCalc({ phone: v });
  const setSent = (v: boolean) => setCalc({ sent: v });
  const [error, setError] = useState("");
  const uid = inModal ? "m" : "p";

  const k = GOODS.find((g) => g.id === goods)?.k ?? 1;
  const res = useMemo(() => calcCost(mode, kg, k), [mode, kg, k]);

  // Number Roll на изменение итога
  const totalEl = useRef<HTMLSpanElement>(null);
  const shown = useRef(res.total);
  useEffect(() => {
    const o = { v: shown.current };
    const tw = gsap.to(o, {
      v: res.total,
      duration: 0.6,
      ease: "power3.out",
      onUpdate: () => {
        shown.current = o.v;
        if (totalEl.current) totalEl.current.textContent = Math.round(o.v).toLocaleString("ru-RU");
      },
    });
    return () => {
      tw.kill();
    };
  }, [res.total]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Как к вам обращаться?");
    if (digits.length < 10) return setError("Проверьте номер телефона");
    setError("");
    // TODO(клиент): куда отправлять заявку — почта / Telegram-бот / amoCRM / Bitrix24.
    // Сейчас заявка только показывает подтверждение и не уходит на сервер.
    setSent(true);
  };

  const fmtPhone = (v: string) => {
    const d = v.replace(/\D/g, "").replace(/^[78]/, "").slice(0, 10);
    const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)];
    let out = "+7";
    if (p[0]) out += ` (${p[0]}`;
    if (p[0].length === 3) out += ")";
    if (p[1]) out += ` ${p[1]}`;
    if (p[2]) out += `-${p[2]}`;
    if (p[3]) out += `-${p[3]}`;
    return out;
  };

  const pos = toPos(kg);

  return (
    <form className="calc__box" onSubmit={submit} noValidate {...(inModal ? {} : { "data-fx": "fade-up" })}>
        <div className="calc__fields">
          <div className="calc__row2">
            <label className="field">
              <span>Откуда</span>
              <select value={from} onChange={(e) => setFrom(e.target.value)}>
                {FROM_CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Куда</span>
              <select value={to} onChange={(e) => setTo(e.target.value)}>
                {TO_CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="field">
            <legend>Тип товара</legend>
            <div className="chips">
              {GOODS.map((g) => (
                <label key={g.id} className={`chip ${goods === g.id ? "is-on" : ""}`}>
                  <input type="radio" name={`goods-${uid}`} value={g.id} checked={goods === g.id} onChange={() => setGoods(g.id)} />
                  {g.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Способ доставки</legend>
            <div className="seg">
              {MODES.map((m) => (
                <label key={m} className={`seg__opt ${mode === m ? "is-on" : ""}`}>
                  <input type="radio" name={`mode-${uid}`} value={m} checked={mode === m} onChange={() => setMode(m)} />
                  <b>{TARIFFS[m].label}</b>
                  <small>{TARIFFS[m].time}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <div className="field__line">
              <span>Вес груза (примерно)</span>
              <label className="kg">
                <input
                  type="number"
                  min={W_MIN}
                  max={W_MAX}
                  step="0.5"
                  value={kg}
                  onChange={(e) => setKg(Math.min(W_MAX, Math.max(W_MIN, Number(e.target.value) || W_MIN)))}
                  aria-label="Вес в килограммах"
                />
                кг
              </label>
            </div>
            <input
              className="range"
              type="range"
              min={0}
              max={1000}
              value={pos}
              onChange={(e) => setKg(toKg(Number(e.target.value)))}
              style={{ "--p": `${pos / 10}%` } as React.CSSProperties}
              aria-label="Вес груза"
            />
            <div className="range__marks">
              <span>0,5 кг</span>
              <span>10</span>
              <span>100</span>
              <span>1000 кг</span>
            </div>
          </div>
        </div>

        <aside className="calc__res" {...(inModal ? {} : { "data-spotlight": "" })}>
          <div className="calc__route">
            {from} <Arrow /> {to}
          </div>
          <div className="calc__label">Предварительная стоимость</div>
          <div className="calc__total">
            <span ref={totalEl}>{res.total.toLocaleString("ru-RU")}</span>
            <em>$</em>
          </div>
          <dl className="calc__dl">
            <div>
              <dt>Ставка</dt>
              <dd>{res.rate.toLocaleString("ru-RU")} $/кг</dd>
            </div>
            <div>
              <dt>Срок в пути</dt>
              <dd>{TARIFFS[mode].time}</dd>
            </div>
            <div>
              <dt>К оплате</dt>
              <dd>{res.billable.toLocaleString("ru-RU")} кг</dd>
            </div>
          </dl>

          {sent ? (
            <div className="calc__ok" role="status">
              <b>Заявка принята ✓</b>
              <span>Менеджер напишет вам в течение 15 минут в рабочее время.</span>
            </div>
          ) : (
            <div className="calc__form">
              <input placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Ваше имя" />
              <input
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(fmtPhone(e.target.value))}
                inputMode="tel"
                autoComplete="tel"
                aria-label="Телефон"
              />
              {error && <p className="calc__err">{error}</p>}
              <button type="submit" className="btn btn--accent btn--lg" data-magnetic="0.2">
                <span>Получить точный расчёт</span>
                <Arrow />
              </button>
              <small className="calc__legal">Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</small>
            </div>
          )}
        </aside>
      </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { STAGES, MODE_LABEL, DEMO_HINT, type PublicShipment } from "@/lib/tracking";
import { CONTACTS, img } from "@/lib/data";
import { Arrow } from "./ui";

const fmt = (iso: string, withTime = true) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });

/** Трекинг груза: трек-номер + 4 последние цифры телефона → статус, шкала этапов, история, фото. */
export default function Tracker({ demo = false }: { demo?: boolean }) {
  const [code, setCode] = useState("");
  const [phone4, setPhone4] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [s, setS] = useState<PublicShipment | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("code");
    if (q) setCode(q);
  }, []);

  const find = async (c = code, p = phone4) => {
    setError("");
    if (!c.trim()) return setError("Введите трек-номер");
    if (p.replace(/\D/g, "").length !== 4) return setError("Введите 4 последние цифры телефона");
    setLoading(true);
    try {
      const r = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c, phone4: p }),
      });
      const j = await r.json();
      if (!r.ok) {
        setS(null);
        setError(j.error ?? "Не удалось найти груз");
      } else {
        setS(j.shipment);
        history.replaceState(null, "", `/track?code=${encodeURIComponent(j.shipment.code)}`);
        setTimeout(() => {
          const el = document.getElementById("trk-result");
          if (!el) return;
          if (window.__lenis) window.__lenis.scrollTo(el, { offset: -90 });
          else el.scrollIntoView({ behavior: "smooth" });
        }, 80);
      }
    } catch {
      setError("Нет связи с сервером. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const current = s ? STAGES.findIndex((x) => x.id === s.stage) : -1;
  const delivered = s?.stage === "delivered";

  return (
    <>
      <section className="trk-hero navy">
        <div className="wrap trk-hero__in">
          <span className="shead__label">/ Трекинг</span>
          <h1 className="trk-hero__title">
            Где мой <em>груз?</em>
          </h1>
          <p className="trk-hero__lead">
            Введите трек-номер из договора или сообщения менеджера и 4 последние цифры телефона, на который оформлен груз.
          </p>

          <form
            className="trk-form"
            onSubmit={(e) => {
              e.preventDefault();
              find();
            }}
            noValidate
          >
            <label className="trk-field">
              <span>Трек-номер</span>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="FC-240117" autoComplete="off" spellCheck={false} />
            </label>
            <label className="trk-field trk-field--sm">
              <span>Телефон</span>
              <div className="trk-phone">
                <i>+7 ••• ••• </i>
                <input
                  value={phone4}
                  onChange={(e) => setPhone4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label="4 последние цифры телефона"
                />
              </div>
            </label>
            <button className="btn btn--accent btn--lg trk-form__btn" disabled={loading}>
              <span>{loading ? "Ищем…" : "Найти груз"}</span>
              <Arrow />
            </button>
          </form>
          {error && (
            <p className="trk-error" role="alert">
              {error}
            </p>
          )}
          {demo && (
          <button
            type="button"
            className="trk-demo"
            onClick={() => {
              setCode(DEMO_HINT.code);
              setPhone4(DEMO_HINT.phone4);
              find(DEMO_HINT.code, DEMO_HINT.phone4);
            }}
          >
            Демо: {DEMO_HINT.code} · телефон …{DEMO_HINT.phone4}
          </button>
          )}
        </div>
      </section>

      {s && (
        <section className="wrap trk-result" id="trk-result" key={s.code}>
          {/* сводка */}
          <div className="trk-card trk-sum">
            <div className="trk-sum__head">
              <div>
                <span className="trk-sum__code">{s.code}</span>
                <h2 className="trk-sum__status">{STAGES[current].label}</h2>
                <p className="trk-sum__hint">{STAGES[current].hint}</p>
              </div>
              <span className={`trk-chip ${delivered ? "is-done" : ""}`}>{delivered ? "Доставлен" : "В работе"}</span>
            </div>
            <div className="trk-route">
              <b>{s.from}</b>
              <span className="trk-route__line" style={{ "--p": s.progress } as React.CSSProperties}>
                <i />
              </span>
              <b>{s.to}</b>
            </div>
            <dl className="trk-facts">
              <div>
                <dt>Способ</dt>
                <dd>{MODE_LABEL[s.mode]}</dd>
              </div>
              <div>
                <dt>Груз</dt>
                <dd>{s.goods}</dd>
              </div>
              <div>
                <dt>Вес / места</dt>
                <dd>
                  {s.weight.toLocaleString("ru-RU")} кг · {s.places} {s.places === 1 ? "место" : s.places < 5 ? "места" : "мест"}
                </dd>
              </div>
              <div>
                <dt>{delivered ? "Выдан" : "Ожидаем"}</dt>
                <dd>{delivered ? fmt(s.events[s.events.length - 1].date, false) : fmt(s.eta, false)}</dd>
              </div>
            </dl>
          </div>

          {/* шкала этапов */}
          <ol className="trk-steps" aria-label="Этапы доставки">
            {STAGES.map((st, i) => {
              const ev = s.events.find((e) => e.stage === st.id);
              const state = i < current ? "done" : i === current ? "now" : "next";
              return (
                <li key={st.id} className={`trk-step is-${state}`}>
                  <span className="trk-step__dot">{state === "done" || (state === "now" && delivered) ? "✓" : i + 1}</span>
                  <b>{st.label}</b>
                  <small>{ev ? fmt(ev.date, false) : "—"}</small>
                </li>
              );
            })}
          </ol>

          <div className="trk-grid">
            {/* история */}
            <div className="trk-card">
              <h3 className="trk-h3">История</h3>
              <ul className="trk-log">
                {[...s.events].reverse().map((e, i) => (
                  <li key={e.stage + e.date} className={i === 0 ? "is-last" : ""}>
                    <time>{fmt(e.date)}</time>
                    <b>{STAGES.find((x) => x.id === e.stage)?.label}</b>
                    <span>{e.place}</span>
                    {e.note && <p>{e.note}</p>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="trk-side">
              {s.photos?.length ? (
                <div className="trk-card">
                  <h3 className="trk-h3">Фотоотчёт</h3>
                  <div className="trk-photos">
                    {s.photos.map((p) => (
                      <a key={p} href={img(p, 1600)} target="_blank" rel="noopener">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img(p, 500)} alt="Фото груза" loading="lazy" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="trk-card trk-help navy">
                <h3 className="trk-h3">Вопрос по грузу?</h3>
                <p>Ваш менеджер — {s.manager}. Ответит в течение 15 минут в рабочее время.</p>
                <a href={CONTACTS.phoneHref} className="btn btn--accent btn--lg">
                  <span>{CONTACTS.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

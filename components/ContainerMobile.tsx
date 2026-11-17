"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion, onSiteReady } from "@/lib/gsap";

/**
 * Контейнер для телефонов — плоский (2D), торцом к зрителю.
 * Без вложенного CSS-3D: на iPhone (Safari) 3D-сцена из десятков граней
 * «дырявится» и тормозит. Здесь — только поворот двух дверец и масштаб,
 * это одинаково быстро и стабильно на любом телефоне.
 */

const TAGS = [
  { t: "Выкуплено", s: "у поставщика на 1688" },
  { t: "Проверено", s: "фото- и видеоотчёт" },
  { t: "Упаковано", s: "и промаркировано" },
  { t: "Застраховано", s: "на полную стоимость" },
];

export default function ContainerMobile() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const d = prefersReducedMotion() ? 0.01 : 1;

      const off = onSiteReady(() => {
        if (prefersReducedMotion()) return;
        gsap.from(q(".cxm__body"), { y: 40, autoAlpha: 0, duration: 1, ease: "power3.out", delay: 0.3 });
      });

      gsap.set(q(".cxm__tag"), { autoAlpha: 0, y: 12 });
      gsap.set(q(".cxm__close"), { autoAlpha: 0 });

      tl.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.inOut" },
          onStart: () => setBusy(true),
          onComplete: () => setBusy(false),
          onReverseComplete: () => setBusy(false),
        })
        .to(q(".cxm__hint"), { autoAlpha: 0, duration: 0.25 * d })
        .to(q(".cxm__handle"), { rotation: -80, duration: 0.3 * d, stagger: 0.04 * d }, 0)
        // дверцы раскрываются; надписи гаснут, створка темнеет — видна «изнанка»
        .to(q(".cxm__door--l"), { rotationY: -112, duration: 1 * d, ease: "power2.inOut" }, 0.35 * d)
        .to(q(".cxm__door--r"), { rotationY: 112, duration: 1 * d, ease: "power2.inOut" }, 0.42 * d)
        .to(q(".cxm__door-print"), { autoAlpha: 0, duration: 0.35 * d }, 0.5 * d)
        .to(q(".cxm__door-shade"), { autoAlpha: 1, duration: 0.6 * d }, 0.6 * d)
        .to(q(".cxm__glow"), { autoAlpha: 1, duration: 0.8 * d }, 0.7 * d)
        // створки и рама уходят, «камера» заезжает внутрь (масштаб только внутри проёма)
        .to(q(".cxm__door, .cxm__frame"), { autoAlpha: 0, duration: 0.45 * d }, 1.25 * d)
        .to(q(".cxm__inside"), { inset: 0, borderRadius: 18, duration: 0.6 * d }, 1.3 * d)
        .to(q(".cxm__art"), { scale: 1.6, duration: 1.2 * d, ease: "power2.inOut" }, 1.3 * d)
        .to(q(".cxm__tag"), { autoAlpha: 1, y: 0, stagger: 0.08 * d, duration: 0.45 * d, ease: "back.out(2)" }, 2.2 * d)
        .to(q(".cxm__close"), { autoAlpha: 1, duration: 0.3 * d }, 2.4 * d);

      return off;
    },
    { scope: root },
  );

  const toggle = () => {
    const t = tl.current;
    if (!t) return;
    if (open) t.timeScale(1.6).reverse();
    else t.timeScale(1).play();
    setOpen(!open);
  };

  return (
    <div className={`cxm ${open ? "is-open" : ""}`} ref={root}>
      <div className="cxm__body">
        <div className="cxm__shadow" aria-hidden />
        <div className="cxm__view">
          <div className="cxm__cam">
            {/* внутренности: туннель в перспективе + коробки */}
            <div className="cxm__inside" aria-hidden>
              <div className="cxm__art">
              <i className="cxm__wall cxm__wall--top" />
              <i className="cxm__wall cxm__wall--bot" />
              <i className="cxm__wall cxm__wall--l" />
              <i className="cxm__wall cxm__wall--r" />
              <i className="cxm__wall cxm__wall--back" />
              <i className="cxm__lamp" />
              <i className="cxm__glow" />
              <span className="cxm__box cxm__box--1" />
              <span className="cxm__box cxm__box--2">
                <b>ИУ → АСТАНА</b>
              </span>
              <span className="cxm__box cxm__box--3 is-dark">
                <b>ELECTRONICS</b>
              </span>
              <span className="cxm__box cxm__box--4">
                <em>✓ проверено</em>
              </span>
              <span className="cxm__box cxm__box--5 is-crate" />
              </div>
            </div>

            {/* рама и дверцы */}
            <div className="cxm__frame" aria-hidden>
              <i />
            </div>
            <div className="cxm__doors" aria-hidden>
              <div className="cxm__door cxm__door--l">
                <i className="cxm__rod" />
                <i className="cxm__rod" />
                <i className="cxm__handle" />
                <i className="cxm__handle" />
                <span className="cxm__door-print">
                  <b>FLUX</b>
                  <small>
                    MAX.GROSS 30 480 KG
                    <br />
                    TARE 2 220 KG
                  </small>
                </span>
                <i className="cxm__door-shade" />
              </div>
              <div className="cxm__door cxm__door--r">
                <i className="cxm__rod" />
                <i className="cxm__rod" />
                <i className="cxm__handle" />
                <i className="cxm__handle" />
                <span className="cxm__door-print">
                  <b>CARGO</b>
                  <small>
                    FLXU 260114 5
                    <br />
                    22G1
                  </small>
                </span>
                <i className="cxm__door-shade" />
              </div>
            </div>
          </div>
        </div>

        {/* метки — сеткой 2×2 поверх сцены, обычный размер текста */}
        <div className="cxm__tags" aria-hidden={!open}>
          {TAGS.map((t) => (
            <div className="cxm__tag" key={t.t}>
              <i />
              <b>{t.t}</b>
              <span>{t.s}</span>
            </div>
          ))}
        </div>

        {!open && <button className="cxm__hit" onClick={toggle} aria-label="Открыть контейнер и посмотреть, что внутри" />}
      </div>

      <button className="cxm__hint" onClick={toggle} disabled={busy} tabIndex={open ? -1 : 0} aria-hidden={open}>
        Нажмите на дверцы
      </button>
      <button className="cxm__close" onClick={toggle} disabled={busy} tabIndex={open ? 0 : -1}>
        ← Закрыть контейнер
      </button>
    </div>
  );
}

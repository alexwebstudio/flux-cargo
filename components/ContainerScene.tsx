"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, onSiteReady } from "@/lib/gsap";

/**
 * Контейнер-фишка (вариант A из концепта, усиленный):
 * настоящая CSS-3D коробка из слоёв (без WebGL), GSAP-timeline.
 * Клик по дверцам → створки раскрываются → «камера» доворачивает
 * и заезжает внутрь → показываем начинку и теги сервиса.
 *
 * Размеры сцены в базовых px, на экране всё масштабируется через --k.
 */

const W = 260; // ширина торца
const H = 280; // высота
const L = 620; // длина
const STAGE_W = 720;
const STAGE_H = 540;

type Cube = {
  x: number; // центр по X
  z: number; // центр по Z
  w: number;
  h: number;
  d: number;
  base?: number; // высота подставки (если стоит на другой коробке)
  kind?: "box" | "crate" | "dark";
  label?: string;
  stamp?: boolean;
  fragile?: boolean;
};

const CUBES: Cube[] = [
  { x: -68, z: -240, w: 104, h: 96, d: 110, label: "FLUX · 0427" },
  { x: 62, z: -244, w: 104, h: 92, d: 104, kind: "crate" },
  { x: -64, z: -246, w: 90, h: 72, d: 90, base: 96, fragile: true },
  { x: 58, z: -250, w: 84, h: 64, d: 84, base: 92, label: "ИУ → АСТАНА" },
  { x: -78, z: -96, w: 76, h: 66, d: 76, stamp: true },
  { x: 54, z: -110, w: 112, h: 84, d: 96, kind: "dark", label: "ELECTRONICS" },
  { x: 46, z: -112, w: 66, h: 52, d: 64, base: 84, fragile: true },
  { x: -70, z: 30, w: 92, h: 54, d: 130, kind: "crate" },
  { x: 76, z: 40, w: 56, h: 44, d: 56, stamp: true },
];

const TAGS = [
  { t: "Выкуплено", s: "у поставщика на 1688", x: 14, y: 24 },
  { t: "Проверено", s: "фото- и видеоотчёт", x: 62, y: 16 },
  { t: "Упаковано", s: "и промаркировано", x: 8, y: 66 },
  { t: "Застраховано", s: "на полную стоимость", x: 64, y: 70 },
];

const px = (n: number) => `${n}px`;

function CubeEl({ c, light = false }: { c: Cube; light?: boolean }) {
  const y = H / 2 - (c.base ?? 0) - c.h / 2;
  const style = {
    transform: `translate3d(${px(c.x)}, ${px(y)}, ${px(c.z)})`,
    "--w": px(c.w),
    "--h": px(c.h),
    "--d": px(c.d),
  } as CSSProperties;
  return (
    <div className={`cube cube--${c.kind ?? "box"} ${light ? "cube--opt" : ""}`} style={style}>
      <div className="cube__f cube__front">
        {c.kind !== "crate" && <i className="cube__tape" />}
        {c.label && <span className="cube__label">{c.label}</span>}
        {c.stamp && <span className="cube__stamp">✓ проверено</span>}
        {c.fragile && (
          <svg className="cube__glass" viewBox="0 0 20 28" aria-hidden>
            <path d="M4 1h12l-1 9a5 5 0 0 1-10 0L4 1Zm6 15v8m-4 3h8" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        )}
      </div>
      <div className="cube__f cube__top" />
      <div className="cube__f cube__left" />
      <div className="cube__f cube__right" />
    </div>
  );
}

function Door({ side }: { side: "l" | "r" }) {
  return (
    <div className={`cx-door cx-door--${side}`}>
      <div className="cx-door__out">
        <i className="rod rod--1" />
        <i className="rod rod--2" />
        <i className="handle handle--1" />
        <i className="handle handle--2" />
        <span className="cx-door__word">{side === "l" ? "FLUX" : "CARGO"}</span>
        {side === "r" && (
          <span className="cx-door__code">
            FLXU 260114 <b>5</b>
            <br />
            22G1
          </span>
        )}
        {side === "l" && (
          <span className="cx-door__spec">
            MAX.GROSS 30 480 KG
            <br />
            TARE 2 220 KG
          </span>
        )}
      </div>
      <div className="cx-door__in" />
    </div>
  );
}

export default function ContainerScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const idle = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const [busy, setBusy] = useState(false);

  // масштаб сцены под ширину колонки
  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(([e]) => {
      el.style.setProperty("--k", String(e.contentRect.width / STAGE_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const q = gsap.utils.selector(wrap);

      gsap.set(q(".cx-cam"), { rotationX: -13, z: 0, y: 10 });
      gsap.set(q(".cx-box"), { rotationY: -36 });

      // Въезд контейнера после прелоадера
      const off = onSiteReady(() => {
        if (reduced) return;
        gsap.from(q(".cx-cam"), { y: -260, rotationX: -28, duration: 1.6, ease: "expo.out", delay: 0.35 });
        gsap.from(q(".cx-box"), { rotationY: -70, duration: 1.8, ease: "expo.out", delay: 0.35 });
        gsap.from(q(".cx-shadow"), { scale: 0.3, autoAlpha: 0, duration: 1.6, ease: "expo.out", delay: 0.35 });
        gsap.from(q(".cx-hint"), { autoAlpha: 0, y: 10, duration: 0.8, delay: 1.4 });
      });

      const isPhone = window.matchMedia("(max-width: 760px)").matches;
      if (!reduced && !isPhone) {
        idle.current = gsap
          .timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: "sine.inOut", duration: 2.6 } })
          .to(q(".cx-float"), { y: -12 })
          .to(q(".cx-shadow"), { scale: 0.9, opacity: 0.55 }, 0);
        // вне экрана не анимируем — экономим кадры при скролле (особенно на телефонах)
        ScrollTrigger.create({
          trigger: wrap.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (st) => {
            if (st.isActive && !openRef.current) idle.current?.play();
            else idle.current?.pause();
          },
        });
      }

      const d = reduced ? 0.01 : 1;
      tl.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.inOut" },
          onStart: () => setBusy(true),
          onComplete: () => setBusy(false),
          onReverseComplete: () => {
            setBusy(false);
            idle.current?.play();
          },
        })
        .to(q(".cx-hint"), { autoAlpha: 0, duration: 0.3 * d })
        .to(q(".handle"), { rotation: -80, duration: 0.35 * d, stagger: 0.05 * d, ease: "back.in(2)" }, 0)
        .to(q(".rod"), { y: -6, duration: 0.25 * d }, 0.25 * d)
        .to(q(".cx-door--l"), { rotationY: -128, duration: 1.15 * d, ease: "power2.inOut" }, 0.5 * d)
        .to(q(".cx-door--r"), { rotationY: 128, duration: 1.15 * d, ease: "power2.inOut" }, 0.58 * d)
        .to(q(".cx-glow"), { opacity: 1, duration: 0.8 * d }, 0.8 * d)
        // камера доворачивает к торцу
        .to(q(".cx-float"), { y: 0, duration: 0.8 * d }, 0.9 * d)
        .to(q(".cx-box"), { rotationY: 0, duration: 1.3 * d }, 1.1 * d)
        .to(q(".cx-cam"), { rotationX: 0, y: 0, duration: 1.3 * d }, 1.1 * d)
        .to(q(".cx-shadow"), { autoAlpha: 0, duration: 0.6 * d }, 1.1 * d)
        // заезд внутрь
        .to(q(".cx-cam"), { z: 590, duration: 1.6 * d, ease: "power2.inOut" }, 2.2 * d)
        .to(q(".cx-door"), { autoAlpha: 0, duration: 0.5 * d }, 2.7 * d)
        .to(q(".cx-frame"), { autoAlpha: 0, duration: 0.5 * d }, 3.1 * d)
        .to(q(".cx-inside"), { autoAlpha: 1, duration: 0.4 * d }, 3.3 * d)
        .from(q(".cx-tag"), { autoAlpha: 0, y: 18, scale: 0.9, stagger: 0.1 * d, duration: 0.6 * d, ease: "back.out(2)" }, 3.4 * d)
        .fromTo(q(".cx-close"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 * d }, 3.6 * d);

      gsap.set(q(".cx-inside"), { autoAlpha: 0 });
      gsap.set(q(".cx-close"), { autoAlpha: 0 });

      return off;
    },
    { scope: wrap },
  );

  const toggle = () => {
    const t = tl.current;
    if (!t) return;
    if (!open) {
      idle.current?.pause();
      t.timeScale(1).play();
    } else {
      t.timeScale(1.6).reverse();
    }
    openRef.current = !open;
    setOpen(!open);
  };

  return (
    <div className={`cx ${open ? "is-open" : ""} ${busy ? "is-busy" : ""}`} ref={wrap}>
      <div className="cx-scaler" style={{ width: STAGE_W, height: STAGE_H }}>
        <div className="cx-stage">
          <div className="cx-shadow" />
          <div className="cx-float">
            <div className="cx-cam">
              <div className="cx-box" style={{ "--W": px(W), "--H": px(H), "--L": px(L) } as CSSProperties}>
                {/* Внешние стенки */}
                <div className="cx-face cx-side cx-side--r">
                  <span className="cx-brand">
                    FLUX<em>CARGO</em>
                  </span>
                  <span className="cx-side__tag">CHINA → KAZAKHSTAN</span>
                  <i className="cx-cast cx-cast--tl" />
                  <i className="cx-cast cx-cast--tr" />
                  <i className="cx-cast cx-cast--bl" />
                  <i className="cx-cast cx-cast--br" />
                </div>
                <div className="cx-face cx-side cx-side--l" />
                <div className="cx-face cx-roof" />
                <div className="cx-face cx-floor-out" />
                <div className="cx-face cx-back" />

                {/* Внутренние стенки */}
                <div className="cx-face cx-in cx-in--r" />
                <div className="cx-face cx-in cx-in--l" />
                <div className="cx-face cx-in cx-in--top">
                  <i className="cx-lamp" />
                </div>
                <div className="cx-face cx-in cx-in--floor" />
                <div className="cx-face cx-in cx-in--back">
                  <i className="cx-glow" />
                </div>

                {CUBES.map((c, i) => (
                  <CubeEl key={i} c={c} light={[2, 6, 8].includes(i)} />
                ))}

                {/* Торец с дверцами */}
                <div className="cx-front">
                  <div className="cx-frame">
                    <i className="cx-frame__top" />
                    <i className="cx-frame__bot" />
                    <i className="cx-frame__l" />
                    <i className="cx-frame__r" />
                  </div>
                  <Door side="l" />
                  <Door side="r" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* HUD поверх сцены — не масштабируется, текст читается и на телефоне */}
      <div className="cx-inside" aria-hidden={!open}>
        {TAGS.map((t) => (
          <div key={t.t} className="cx-tag" style={t.x < 50 ? { left: `${t.x}%`, top: `${t.y}%` } : { right: `${Math.max(2, 96 - t.x - 30)}%`, top: `${t.y}%` }}>
            <i />
            <b>{t.t}</b>
            <span>{t.s}</span>
          </div>
        ))}
      </div>

      {/* Кликабельная зона — дверцы (в закрытом состоянии) */}
      {!open && (
        <button className="cx-hit" onClick={toggle} aria-label="Открыть контейнер и посмотреть, что внутри" />
      )}

      <button className="cx-hint" onClick={toggle} disabled={busy} tabIndex={open ? -1 : 0} aria-hidden={open}>
        Нажмите на дверцы<span className="cx-hint__more">&nbsp;— посмотрите, что внутри</span>
      </button>

      <button className="cx-close" onClick={toggle} disabled={busy} tabIndex={open ? 0 : -1}>
        ← Закрыть контейнер
      </button>
    </div>
  );
}

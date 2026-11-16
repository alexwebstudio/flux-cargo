"use client";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Коробка FLUX CARGO в финальном CTA — как контейнер в Hero, только меньше:
 * клик → клапаны раскрываются → из коробки поднимаются товары с подписями.
 * CSS-3D (без WebGL), анимация на GSAP.
 */

const W = 240; // ширина
const H = 150; // высота
const D = 200; // глубина

const ITEMS = [
  { key: "phone", label: "Электроника", x: -58, z: 10, h: 120, icon: <PhoneIcon /> },
  { key: "shoe", label: "Обувь", x: 52, z: -14, h: 92, icon: <ShoeIcon /> },
  { key: "shirt", label: "Одежда", x: 4, z: -36, h: 150, icon: <ShirtIcon /> },
];

export default function BoxScene() {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      const d = prefersReducedMotion() ? 0.01 : 1;
      const q = gsap.utils.selector(root);
      gsap.set(q(".bx-rot"), { rotationX: -22 });
      gsap.set(q(".bx-flap--f"), { y: -H / 2, z: D / 2, rotationX: 90, transformOrigin: "50% 100%" });
      gsap.set(q(".bx-flap--b"), { y: -H / 2, z: -D / 2, rotationX: -90, transformOrigin: "50% 100%" });
      gsap.set(q(".bx-item"), { y: 0, autoAlpha: 0 });
      gsap.set(q(".bx-tag"), { autoAlpha: 0, y: 8 });
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.inOut" } })
        .to(q(".bx-hint"), { autoAlpha: 0, duration: 0.25 * d })
        .to(q(".bx-tape"), { scaleX: 0, duration: 0.35 * d, ease: "power2.in" }, 0)
        .to(q(".bx-flap--f"), { rotationX: -125, duration: 0.8 * d, ease: "back.out(1.4)" }, 0.25 * d)
        .to(q(".bx-flap--b"), { rotationX: 125, duration: 0.8 * d, ease: "back.out(1.4)" }, 0.35 * d)
        .to(q(".bx-rot"), { rotationX: -34, duration: 0.9 * d }, 0.3 * d)
        .to(q(".bx-item"), { y: (i: number) => -ITEMS[i].h, autoAlpha: 1, duration: 0.9 * d, stagger: 0.12 * d, ease: "back.out(1.6)" }, 0.75 * d)
        .to(q(".bx-tag"), { autoAlpha: 1, y: 0, duration: 0.4 * d, stagger: 0.1 * d }, 1.3 * d)
        .fromTo(q(".bx-close"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 * d }, 1.4 * d);
      gsap.set(q(".bx-close"), { autoAlpha: 0 });
    },
    { scope: root },
  );

  const toggle = () => {
    if (!tl.current) return;
    if (open) tl.current.timeScale(1.5).reverse();
    else tl.current.timeScale(1).play();
    setOpen(!open);
  };

  const vars = { "--W": `${W}px`, "--H": `${H}px`, "--D": `${D}px` } as CSSProperties;

  return (
    <div className={`bx ${open ? "is-open" : ""}`} ref={root}>
      <button className="bx-stage" onClick={toggle} aria-label={open ? "Закрыть коробку" : "Открыть коробку и посмотреть, что внутри"}>
        <div className="bx-shadow" />
        <div className="bx-rot" style={vars}>
          <div className="bx-yaw">
            {/* дно и стенки (видно внутрь, когда коробка открыта) */}
            <div className="bx-f bx-bottom" />
            <div className="bx-f bx-back" />
            <div className="bx-f bx-left" />
            {ITEMS.map((it) => (
              <div key={it.key} className="bx-slot" style={{ "--x": `${it.x}px`, "--z": `${it.z}px` } as CSSProperties}>
                <div className="bx-item">
                  <div className="bx-item__bb">
                    {it.icon}
                    <span className="bx-tag">{it.label} ✓</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="bx-f bx-right">
              <span className="bx-arrows">↑↑</span>
            </div>
            <div className="bx-f bx-front">
              <span className="bx-logo">
                FLUX <b>CARGO</b>
              </span>
              <span className="bx-label">ИУ → АСТАНА · 12,4 КГ</span>
            </div>
            <div className="bx-flap bx-flap--f">
              <i className="bx-tape" />
            </div>
            <div className="bx-flap bx-flap--b" />
          </div>
        </div>
      </button>
      <span className="bx-hint" aria-hidden>
        Нажмите на коробку
      </span>
      <button className="bx-close" onClick={toggle} tabIndex={open ? 0 : -1}>
        Закрыть коробку
      </button>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 60 104" className="bx-ico bx-ico--phone" aria-hidden>
      <rect x="2" y="2" width="56" height="100" rx="10" fill="#0f172a" />
      <rect x="6" y="10" width="48" height="80" rx="4" fill="#1f3260" />
      <rect x="6" y="10" width="48" height="80" rx="4" fill="url(#bxg)" opacity=".6" />
      <defs>
        <linearGradient id="bxg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8562" />
          <stop offset="1" stopColor="#1f3260" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="22" y="94" width="16" height="3" rx="1.5" fill="#56627a" />
    </svg>
  );
}
function ShoeIcon() {
  return (
    <svg viewBox="0 0 110 60" className="bx-ico bx-ico--shoe" aria-hidden>
      <path d="M6 40c0-12 4-26 10-30 6 4 14 10 24 12 14 3 30 4 44 10 12 5 20 10 20 16v4H6z" fill="#fff" />
      <path d="M6 48h98v6c0 2-2 4-4 4H10c-2 0-4-2-4-4z" fill="#f36442" />
      <path d="M28 18l6 8M36 20l5 8M44 22l4 8" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function ShirtIcon() {
  return (
    <svg viewBox="0 0 100 92" className="bx-ico bx-ico--shirt" aria-hidden>
      <path d="M34 4l-26 12 8 22 12-5v55h44V33l12 5 8-22L66 4c-2 7-8 11-16 11S36 11 34 4z" fill="#f36442" />
      <path d="M34 4c2 7 8 11 16 11s14-4 16-11" stroke="#c94a2f" strokeWidth="3" fill="none" />
    </svg>
  );
}

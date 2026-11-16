"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, READY_EVENT } from "@/lib/gsap";

/**
 * Прелоадер в теме сайта: логотип собирается по буквам, под ним маршрут
 * «Китай → Казахстан», по которому едет контейнер — это и есть прогресс.
 * В конце синий экран уходит вверх и открывает сайт.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      // Асинхронно: колбэки GSAP выполняются внутри контекста прелоадера, и
      // строковые селекторы подписчиков искались бы только внутри .pl.
      const finish = () => {
        setTimeout(() => {
          document.documentElement.dataset.ready = "1";
          window.dispatchEvent(new Event(READY_EVENT));
        }, 0);
      };

      // уже показывали в этой вкладке — второй раз не держим
      if (document.documentElement.dataset.ready === "1") {
        gsap.set(root.current, { display: "none" });
        return;
      }

      if (prefersReducedMotion()) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: finish });
        return;
      }

      const p = { v: 0 };
      const render = () => {
        const v = p.v / 100;
        gsap.set(".pl__fill", { scaleX: v });
        gsap.set(".pl__box", { left: `${v * 100}%` });
        if (num.current) num.current.textContent = `${Math.round(p.v)}%`;
      };

      let isLoaded = document.readyState === "complete";
      const go = () => {
        isLoaded = true;
        if (tl.paused()) tl.play();
      };
      if (!isLoaded) window.addEventListener("load", go, { once: true });
      const safety = window.setTimeout(go, 3000);

      const tl = gsap.timeline();
      tl.from(".pl__brand span", { yPercent: 110, stagger: 0.04, duration: 0.8, ease: "power4.out" })
        .from([".pl__route", ".pl__num"], { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.06 }, 0.3)
        .to(p, { v: 80, duration: 1, ease: "power2.inOut", onUpdate: render }, 0.35)
        .call(() => {
          if (!isLoaded) tl.pause();
        })
        .to(p, { v: 100, duration: 0.4, ease: "power1.out", onUpdate: render })
        .to(".pl__center", { y: -30, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "+=0.1")
        .to(root.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.15")
        .add(finish, "-=0.55")
        .set(root.current, { display: "none" });

      return () => {
        window.clearTimeout(safety);
        window.removeEventListener("load", go);
      };
    },
    { scope: root },
  );

  return (
    <div className="pl" ref={root} aria-hidden>
      <div className="pl__center">
        <div className="pl__brand">
          {"FLUX CARGO".split("").map((c, i) => (
            <span key={i} className={i > 4 ? "is-acc" : ""}>
              {c === " " ? " " : c}
            </span>
          ))}
        </div>
        <div className="pl__route">
          <span>Китай</span>
          <div className="pl__track">
            <i className="pl__fill" />
            <svg className="pl__box" viewBox="0 0 30 18" aria-hidden>
              <rect x="0.5" y="0.5" width="29" height="17" rx="1.5" fill="#f36442" />
              <path d="M6 3v12M10 3v12M14 3v12M18 3v12M22 3v12M26 3v12" stroke="#c94a2f" strokeWidth="1.2" />
            </svg>
          </div>
          <span>Казахстан</span>
        </div>
        <div className="pl__num">
          <span ref={num}>0%</span>
        </div>
      </div>
    </div>
  );
}

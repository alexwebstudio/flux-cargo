"use client";

import { useEffect, useState } from "react";
import { NAV } from "@/lib/data";
import { Arrow } from "./ui";

/**
 * Лого + меню + кнопка — одной плашкой.
 * Наверху плашка прилегает к краю на всю ширину; при скролле отсоединяется,
 * сужается и становится стеклянной (glassmorphism). Пункты не меняются.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  return (
    <header className={`hdr ${scrolled && !open ? "is-scrolled" : "t-dark"}`}>
      <div className="hdr__in">
        <a href="#top" className="hdr__logo" aria-label="Flux Cargo — на главную">
          FLUX<span>CARGO</span>
        </a>
        <span className="hdr__sep" aria-hidden />

        <nav className="hdr__nav" aria-label="Основное меню">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hdr__link">
              <span className="hdr__slash">/</span>
              <span className="hdr__txt" data-text={n.label}>
                {n.label}
              </span>
            </a>
          ))}
        </nav>

        <a href="#calc" data-open-calc className="btn btn--accent btn--sm hdr__cta" data-magnetic="0.25">
          <span>Рассчитать</span>
          <Arrow />
        </a>

        <button
          className={`burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </div>

      <div className={`mnav ${open ? "is-open" : ""}`} onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
        <nav>
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} style={{ transitionDelay: `${open ? 0.08 + i * 0.05 : 0}s` }}>
              <span>/</span>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#calc" data-open-calc className="btn btn--accent btn--lg">
          <span>Рассчитать</span>
          <Arrow />
        </a>
      </div>
    </header>
  );
}

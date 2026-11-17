"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, CONTACTS } from "@/lib/data";
import { Arrow } from "./ui";

/**
 * Лого + меню + кнопка — одной плашкой.
 * Наверху плашка прилегает к краю на всю ширину; при скролле отсоединяется,
 * сужается и становится стеклянной (glassmorphism). Пункты не меняются.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

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
        {/* логотип — ссылка на главную; на самой главной плавно поднимает наверх */}
        <Link
          href="/"
          className="hdr__logo"
          aria-label="Flux Cargo — на главную"
          onClick={(e) => {
            setOpen(false);
            if (pathname === "/") {
              e.preventDefault();
              if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          FLUX<span>CARGO</span>
        </Link>
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
        <div className="mnav__foot">
          <a href="#calc" data-open-calc className="btn btn--accent btn--lg">
            <span>Рассчитать</span>
            <Arrow />
          </a>
          <address className="mnav__contacts">
            <a href={CONTACTS.phoneHref} className="mnav__phone">
              {CONTACTS.phone}
            </a>
            <span>{CONTACTS.address}</span>
            <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>
          </address>
        </div>
      </div>
    </header>
  );
}

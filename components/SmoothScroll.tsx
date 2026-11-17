"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, isTouch } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Плавный скролл Lenis — только на компьютере (колесо мыши/тачпад).
 * На телефонах и планшетах — нативный скролл браузера: он самый плавный
 * и не тратит кадры на пересчёт позиции.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  // смена страницы: пересчитать высоту и триггеры
  useEffect(() => {
    const t = setTimeout(() => {
      window.__lenis?.resize();
      ScrollTrigger.refresh();
    }, 50);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const useLenis = !isTouch();
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (useLenis) {
      lenis = new Lenis({
        duration: reduced ? 0 : 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: !reduced,
      });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const l = lenis;
      tick = (time: number) => l.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      // пока идёт прелоадер — скролл стоит
      if (document.documentElement.dataset.ready !== "1") lenis.stop();
    }

    /** прокрутка к элементу/позиции — Lenis на компьютере, нативно на телефоне */
    const scrollTo = (target: HTMLElement | number, duration = 1.4) => {
      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration });
        return;
      }
      const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    };

    const onReady = () => {
      lenis?.start();
      // пришли со страницы категории на /#how — докручиваем к блоку
      const h = location.hash;
      if (h && h !== "#top") {
        const el = document.querySelector<HTMLElement>(h);
        if (el) setTimeout(() => scrollTo(el, 1.2), 100);
      }
    };
    window.addEventListener("flux:ready", onReady);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
      if (!a || a.hasAttribute("data-open-calc")) return; // «Рассчитать» открывает поп-ап
      let id = a.getAttribute("href")!;
      if (id.startsWith("/#")) {
        if (location.pathname !== "/") return; // со страницы категории — обычный переход на главную
        id = id.slice(1);
      }
      const el = id === "#top" ? 0 : document.querySelector<HTMLElement>(id);
      if (el === null) return;
      e.preventDefault();
      scrollTo(el as HTMLElement | number);
      history.replaceState(null, "", id === "#top" ? location.pathname : id);
    };
    document.addEventListener("click", onClick);

    return () => {
      if (tick) gsap.ticker.remove(tick);
      window.removeEventListener("flux:ready", onReady);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

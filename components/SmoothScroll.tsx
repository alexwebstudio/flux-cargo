"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis в связке со ScrollTrigger (один тикер GSAP) + плавные якоря. */
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
    const lenis = new Lenis({
      duration: reduced ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
    });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Пока идёт прелоадер — скролл стоит
    if (document.documentElement.dataset.ready !== "1") lenis.stop();
    const onReady = () => {
      lenis.start();
      // пришли со страницы категории на /#how — докручиваем к блоку
      const h = location.hash;
      if (h && h !== "#top") {
        const el = document.querySelector<HTMLElement>(h);
        if (el) setTimeout(() => lenis.scrollTo(el, { duration: 1.2 }), 100);
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
      lenis.scrollTo(el as HTMLElement | number, { offset: 0, duration: 1.4 });
      history.replaceState(null, "", id === "#top" ? location.pathname : id);
    };
    document.addEventListener("click", onClick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("flux:ready", onReady);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

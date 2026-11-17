"use client";

import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, SplitText, useGSAP, isTouch, prefersReducedMotion, onSiteReady } from "@/lib/gsap";

/**
 * AW-Flow эффекты, перенесённые из Tilda-классов в React.
 * Логика та же, что в библиотеке: элементу назначается атрибут — эффект подхватывается.
 *
 *   data-fx="fade-up | mask | blur | stagger | number | scramble | marker | scale-in | parallax"
 *   data-magnetic  — Magnetic Button
 *   data-tilt      — Hover Tilt (+ блик)
 *   data-spotlight — Spotlight (пятно света за курсором, только transform)
 *
 * Все hover-эффекты выключены на тач-экранах, анимации — при prefers-reduced-motion.
 */
export default function AwFlow() {
  // перезапуск на каждой странице (главная ↔ категории при клиентской навигации)
  const pathname = usePathname();
  useGSAP(() => {
    const reduced = prefersReducedMotion();
    const q = <T extends HTMLElement = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);
    const cleanups: (() => void)[] = [];

    const reveal = () => {
      if (reduced) {
        gsap.set("[data-fx]", { autoAlpha: 1 });
        q("[data-fx=number]").forEach((el) => (el.textContent = format(Number(el.dataset.to))));
        q("[data-fx=marker] mark").forEach((m) => m.classList.add("is-on"));
        return;
      }

      /* Fade Up */
      q("[data-fx=fade-up]").forEach((el) => {
        gsap.from(el, {
          y: Number(el.dataset.y ?? 48),
          autoAlpha: 0,
          duration: 1.1,
          delay: Number(el.dataset.delay ?? 0),
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* Scale In (с пружинкой) */
      q("[data-fx=scale-in]").forEach((el) => {
        gsap.from(el, {
          scale: 0.7,
          rotate: -6,
          autoAlpha: 0,
          duration: 1.3,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      /* Mask Reveal — строки выезжают из-под маски */
      q("[data-fx=mask]").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "fx-line" });
        gsap.set(el, { autoAlpha: 1 });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.09,
          ease: "power4.out",
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      /* Blur Reveal — слова из размытия */
      q("[data-fx=blur]").forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.set(el, { autoAlpha: 1 });
        gsap.from(split.words, {
          filter: "blur(12px)",
          autoAlpha: 0,
          y: 14,
          duration: 0.9,
          stagger: 0.035,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      /* Карточки: AW-Flow «3D Tilt In» волной (ScrollTrigger.batch).
         Параметры как в конструкторе AW-Flow: наклон по X 35°, перспектива 1200px,
         смещение 60px, 1000мс, ease cubic-bezier(.33,1,.68,1) ≈ power2.out,
         ось вращения — нижний край, прозрачность за 0.6 длительности линейно. */
      const TILT = { angle: 35, perspective: 1200, distance: 60, duration: 1, stagger: 0.1 };
      q("[data-fx=stagger]").forEach((grid) => {
        const items = Array.from(grid.children) as HTMLElement[];
        gsap.set(grid, { autoAlpha: 1 });
        gsap.set(items, {
          autoAlpha: 0,
          y: TILT.distance,
          rotationX: TILT.angle,
          transformPerspective: TILT.perspective,
          transformOrigin: "50% 100%",
        });
        ScrollTrigger.batch(items, {
          start: "top 92%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              autoAlpha: 1,
              duration: TILT.duration * 0.6,
              ease: "none",
              stagger: TILT.stagger,
            });
            gsap.to(batch, {
              y: 0,
              rotationX: 0,
              duration: TILT.duration,
              ease: "power2.out",
              stagger: TILT.stagger,
              clearProps: "transform,transformOrigin",
            });
          },
        });
      });

      /* Number Roll */
      q("[data-fx=number]").forEach((el) => {
        const to = Number(el.dataset.to);
        const o = { v: 0 };
        el.textContent = format(0);
        gsap.to(o, {
          v: to,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = format(Math.round(o.v));
          },
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* Scramble */
      q("[data-fx=scramble]").forEach((el) => {
        const text = el.textContent ?? "";
        gsap.set(el, { autoAlpha: 1 });
        gsap.from(el, {
          duration: 1.1,
          scrambleText: { text: "", chars: "FLUXCARGO/0123456789", speed: 0.6 },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onComplete: () => {
            el.textContent = text;
          },
        });
      });

      /* Marker Highlight */
      q("[data-fx=marker]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 80%",
          once: true,
          onEnter: () =>
            el.querySelectorAll("mark").forEach((m, i) => setTimeout(() => m.classList.add("is-on"), 250 + i * 220)),
        });
      });

      /* Parallax — только на десктопе */
      if (!isTouch() && window.innerWidth > 760) q("[data-fx=parallax]").forEach((el) => {
        const speed = Number(el.dataset.speed ?? 12);
        gsap.fromTo(
          el,
          { yPercent: -speed },
          {
            yPercent: speed,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      ScrollTrigger.refresh();
    };

    cleanups.push(onSiteReady(reveal));

    /* ---------- Hover-эффекты (только мышь) ---------- */
    if (!isTouch() && !reduced) {
      q("[data-magnetic]").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
        const strength = Number(el.dataset.magnetic || 0.35);
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * strength);
          yTo((e.clientY - (r.top + r.height / 2)) * strength);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });

      q("[data-tilt]").forEach((el) => {
        const max = Number(el.dataset.tilt || 7);
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * max * 2);
          rx(-(py - 0.5) * max * 2);
          el.style.setProperty("--gx", `${px * 100}%`);
          el.style.setProperty("--gy", `${py * 100}%`);
        };
        const leave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });

      q("[data-spotlight]").forEach((el) => {
        const spot = document.createElement("span");
        spot.className = "fx-spot";
        el.prepend(spot);
        const xTo = gsap.quickTo(spot, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(spot, "y", { duration: 0.5, ease: "power3" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo(e.clientX - r.left);
          yTo(e.clientY - r.top);
        };
        el.addEventListener("pointermove", move);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          spot.remove();
        });
      });
    }

    return () => cleanups.forEach((c) => c());
  }, { dependencies: [pathname], revertOnUpdate: true });

  return null;
}

function format(n: number) {
  return n.toLocaleString("ru-RU").replace(/ /g, " ");
}

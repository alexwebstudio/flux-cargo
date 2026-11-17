"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion, onSiteReady } from "@/lib/gsap";
import { img, PHOTOS } from "@/lib/data";
import ContainerScene from "./ContainerScene";
import ContainerMobile from "./ContainerMobile";
import { Arrow } from "./ui";

const BRAND = "flux cargo";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const brand = useRef<HTMLDivElement>(null);

  // Заголовок во всю ширину контента: от поля до поля, за край не уходит
  useEffect(() => {
    const el = brand.current!;
    const fit = () => {
      const wrap = el.parentElement!;
      const cs = getComputedStyle(wrap);
      const target = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      el.style.fontSize = `${Math.floor(((100 * target) / w) * 1000) / 1000}px`;
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(".hero [data-hero]", { autoAlpha: 1 });
        return;
      }
      gsap.set(".hero__char", { yPercent: 105 });
      gsap.set("[data-hero]", { autoAlpha: 0, y: 30 });

      const off = onSiteReady(() => {
        const tl = gsap.timeline({ delay: 0.1 });
        tl.fromTo(".hero__photo img", { scale: 1.2 }, { scale: 1.04, duration: 2, ease: "expo.out" }, 0)
          .to(".hero__char", { yPercent: 0, duration: 1.3, stagger: 0.045, ease: "expo.out" }, 0.1)
          .to("[data-hero]", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.6);
      });

      // параллакс фото — только на десктопе: на телефоне scrub на каждый кадр скролла даёт рывки
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (min-width: 761px)", () => {
        gsap.to(".hero__photo img", {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      return off;
    },
    { scope: root },
  );

  return (
    <section className="hero navy" id="top" ref={root}>
      {/* фото корабля — на весь герой, в том числе под заголовком */}
      <div className="hero__photo" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(PHOTOS.heroPort, 2400)}
          srcSet={[800, 1200, 1800, 2400].map((w) => `${img(PHOTOS.heroPort, w)} ${w}w`).join(", ")}
          sizes="100vw"
          alt=""
          fetchPriority="high"
        />
      </div>

      <div className="hero__meta wrap" data-hero>
        <span>/ Карго из Китая в Казахстан</span>
        <span className="hero__meta-mid">Авиа · Авто · Ж/Д · Море</span>
        <span>Астана — 14 городов выдачи</span>
      </div>

      <div className="wrap hero__brand-wrap">
        <div className="hero__brand" ref={brand} aria-label="Flux Cargo" role="img">
          {BRAND.split("").map((c, i) => (
            <span className="hero__mask" key={i} aria-hidden>
              <span className="hero__char">{c === " " ? " " : c}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero__grid wrap">
        <div className="hero__text">
          <h1 className="hero__h1" data-hero>
            Доставка грузов из Китая — <em>от&nbsp;1&nbsp;коробки</em> до&nbsp;оптовой партии
          </h1>
          <ol className="hero__verbs" data-hero>
            {["выкупим", "проверим", "объединим", "довезём"].map((v, i) => (
              <li key={v}>
                <span>0{i + 1}</span>
                {v}
              </li>
            ))}
          </ol>
          <p className="hero__lead" data-hero>
            Привозим товары с Taobao, 1688 и Pinduoduo в любой город Казахстана. Работаем от одного товара, расчёт — за
            15 минут.
          </p>
          <div className="hero__ctas" data-hero>
            <a href="#calc" data-open-calc className="btn btn--accent btn--lg" data-magnetic>
              <span>Рассчитать</span>
              <Arrow />
            </a>
            <a href="#how" className="btn btn--ghost btn--lg" data-magnetic="0.2">
              <span>Как работаем</span>
            </a>
          </div>
        </div>

        <div className="hero__scene" data-hero>
          {/* десктоп — 3D-контейнер, телефон — облегчённый 2D (CSS переключает) */}
          <ContainerScene />
          <ContainerMobile />
        </div>
      </div>

      <div className="hero__foot wrap" data-hero>
        <span>Работаем от 1 товара · Страхуем груз · Фото-отчёт перед отправкой</span>
      </div>
    </section>
  );
}

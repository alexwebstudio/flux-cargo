"use client";

import { useState } from "react";
import { SERVICES, img, type ModeKey } from "@/lib/data";
import { SectionHead, Arrow } from "./ui";
import { Modal } from "./Modal";

/** Способы доставки — карточки; у каждого способа свой поп-ап с подробностями. */
export default function Services() {
  const [open, setOpen] = useState<ModeKey | null>(null);

  return (
    <section className="services wrap" id="services">
      <SectionHead
        label="Способы доставки"
        index="04 варианта"
        aside="Подбираем способ под ваш груз и бюджет — от срочной авиапосылки до контейнера морем."
      >
        Четыре пути <em>из Китая</em>
      </SectionHead>

      <div className="srv" data-fx="stagger">
        {SERVICES.map((s) => (
          <article className="srv__card" key={s.key}>
            <button className="srv__open" onClick={() => setOpen(s.key)} aria-label={`${s.title} — подробнее`} />
            <div className="srv__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(s.photo, 800)} alt={s.title} loading="lazy" />
              <span className="srv__time">{s.time}</span>
            </div>
            <div className="srv__body">
              <h3 className="srv__title">{s.title}</h3>
              <p className="srv__text">{s.text}</p>
              <p className="srv__for">
                <span>Для каких партий</span>
                {s.forWhom}
              </p>
              <span className="srv__link">
                Подробнее <Arrow />
              </span>
            </div>
          </article>
        ))}
      </div>

      {SERVICES.map((s) => (
        <Modal key={s.key} id={`srv-${s.key}`} open={open === s.key} onClose={() => setOpen(null)} title={s.title}>
          <div className="smod">
            <div className="smod__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(s.photo, 1200)} alt={s.title} loading="lazy" />
              <div className="smod__badges">
                <span>{s.time}</span>
                <span>{s.price}</span>
              </div>
            </div>
            <div className="smod__body">
              <p className="smod__lead">{s.lead}</p>
              <div className="smod__route">
                <small>Маршрут</small>
                {s.route}
              </div>
              <div className="smod__cols">
                <div>
                  <h3>Что везти</h3>
                  <ul>
                    {s.fits.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Плюсы</h3>
                  <ul className="is-pros">
                    {s.pros.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Учтите</h3>
                  <ul className="is-limits">
                    {s.limits.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <a href="#calc" data-open-calc data-calc-mode={s.calcMode} className="btn btn--accent btn--lg smod__btn">
                <span>Рассчитать</span>
                <Arrow />
              </a>
            </div>
          </div>
        </Modal>
      ))}
    </section>
  );
}

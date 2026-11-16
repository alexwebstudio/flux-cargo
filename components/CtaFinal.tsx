import { Arrow } from "./ui";
import BoxScene from "./BoxScene";

/** Финальный CTA: компактная синяя плашка + интерактивная коробка (открывается, как контейнер в Hero). */
export default function CtaFinal() {
  return (
    <section className="cta wrap" aria-labelledby="cta-title">
      <div className="cta__plate navy" data-fx="fade-up">
        <div className="blobs blobs--cta" aria-hidden>
          <i />
          <i />
        </div>
        <div className="cta__text">
          <span className="shead__label">/ Рассчитайте доставку</span>
          <h2 id="cta-title" className="cta__title">
            Получите расчёт за <em>15 минут</em>
          </h2>
          <p>Пришлите ссылку на товар или описание груза — ответим с ценой, сроками и лучшим маршрутом.</p>
          <div className="cta__btns">
            <a href="#calc" data-open-calc className="btn btn--accent btn--lg" data-magnetic>
              <span>Рассчитать</span>
              <Arrow />
            </a>
          </div>
        </div>
        <div className="cta__box" data-fx="scale-in">
          <BoxScene />
        </div>
      </div>
    </section>
  );
}

import { STEPS } from "@/lib/data";
import { SectionHead } from "./ui";

/** 6 шагов простыми карточками — без привязки к скроллу. */
export default function Steps() {
  return (
    <section className="steps" id="how">
      <div className="wrap">
        <SectionHead
          label="Как работаем"
          index="01 — 06"
          aside="Шесть шагов от ссылки на товар до коробки у вас в руках. Срок и результат каждого шага известны заранее."
        >
          Как работает <em>доставка</em>
        </SectionHead>

        <ol className="steps__grid" data-fx="stagger">
          {STEPS.map((s, i) => (
            <li className="step" key={s.title}>
              <div className="step__top">
                <span className="step__num">{i + 1}</span>
                <span className="step__time">{s.time}</span>
              </div>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
              <p className="step__result">
                <span>Результат:</span> {s.result}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

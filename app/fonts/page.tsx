import type { Metadata } from "next";
import { HEADING_FONTS, googleFontsUrl } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Варианты шрифта заголовков — Flux Cargo",
  robots: { index: false },
};

/** Служебная страница: сравнить шрифты заголовков и примерить любой на сайте. */
export default function FontsPage() {
  return (
    <main className="fonts">
      <link rel="stylesheet" href={googleFontsUrl(HEADING_FONTS)} />
      <section className="fonts__hero navy">
        <div className="wrap">
          <span className="shead__label">/ Шрифт заголовков</span>
          <h1 className="fonts__title">Выберите шрифт для заголовков</h1>
          <p className="fonts__lead">
            Все варианты бесплатные и с кириллицей. Нажмите «Примерить на сайте» — главная откроется с этим шрифтом, а
            внизу появится переключатель, чтобы сравнить остальные. Текст сайта остаётся на Manrope.
          </p>
        </div>
      </section>

      <section className="wrap fonts__list">
        {HEADING_FONTS.map((f, i) => (
          <article className="fcard" key={f.id} style={{ "--ff": `"${f.family}"`, "--fw": f.weight } as React.CSSProperties}>
            <header className="fcard__head">
              <span className="fcard__n">0{i + 1}</span>
              <h2>{f.name}</h2>
              <p>{f.note}</p>
              <a className="btn btn--accent btn--sm" href={`/?font=${f.id}`}>
                <span>Примерить на сайте</span>
              </a>
            </header>
            <div className="fcard__hero navy">
              flux <span>cargo</span>
            </div>
            <div className="fcard__samples">
              <p className="fcard__h2">
                Как работает <span>доставка</span>
              </p>
              <p className="fcard__h3">Доставка грузов из Китая — от 1 коробки до оптовой партии</p>
              <p className="fcard__abc">АБВГДЕЁЖЗИЙКЛМН абвгдеёжз 0123456789 ₸$%</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

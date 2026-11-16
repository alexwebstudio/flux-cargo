/** Маркетплейсы — статичной сеткой, у каждого логотипа подпись. */
const MARKETS = [
  { name: "Taobao", note: "Розница и мелкий опт", color: "#ff5000" },
  { name: "Pinduoduo", note: "Низкие цены, акции", color: "#e02e24" },
  { name: "1688", note: "Оптовые закупки у фабрик", color: "#ff6a00" },
  { name: "Alibaba", note: "Производители и опт", color: "#ff6a00" },
];

export default function Marketplaces() {
  return (
    <section className="mq wrap" aria-labelledby="mq-title">
      <div className="mq__head">
        <span className="shead__label" data-fx="scramble">
          / Маркетплейсы
        </span>
        <h2 id="mq-title" className="mq__title" data-fx="fade-up">
          Выкупаем с любых китайских площадок — пришлите ссылку на товар
        </h2>
      </div>
      <ul className="mq__grid" data-fx="stagger">
        {MARKETS.map((m) => (
          <li className="mq__card" key={m.name}>
            <span className="mq__logo" style={{ color: m.color }}>
              {m.name}
            </span>
            <span className="mq__note">{m.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

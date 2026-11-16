import { METRICS } from "@/lib/data";

export default function Metrics() {
  return (
    <section className="metrics wrap" aria-label="Flux Cargo в цифрах">
      <div className="metrics__row" data-fx="stagger">
        {METRICS.map((m) => (
          <div className="metric" key={m.label}>
            <div className="metric__num">
              {m.prefix && <small>{m.prefix}</small>}
              <span data-fx="number" data-to={m.value}>
                {m.value.toLocaleString("ru-RU")}
              </span>
              {m.suffix && <em>{m.suffix}</em>}
            </div>
            <p className="metric__label">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

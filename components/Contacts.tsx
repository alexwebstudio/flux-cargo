import { CONTACTS } from "@/lib/data";
import { SectionHead, Arrow } from "./ui";
import MapCard from "./MapCard";

const ROUTE = `https://2gis.kz/astana/search/${encodeURIComponent("Сыгынак 47 Emerald Towers")}`;

/** Отдельный блок контактов. */
export default function Contacts() {
  return (
    <section className="contacts wrap" id="contacts">
      <SectionHead label="Контакты" index="Астана">
        Свяжитесь <em>с нами</em>
      </SectionHead>

      <div className="contacts__grid" data-fx="stagger">
        <a href={CONTACTS.phoneHref} className="ccard">
          <span className="ccard__label">Телефон</span>
          <span className="ccard__value">{CONTACTS.phone}</span>
          <span className="ccard__hint">Звонки и WhatsApp</span>
          <Arrow className="ccard__arrow" />
        </a>
        <a href={`mailto:${CONTACTS.email}`} className="ccard">
          <span className="ccard__label">Почта</span>
          <span className="ccard__value">{CONTACTS.email}</span>
          <span className="ccard__hint">Ответим в течение дня</span>
          <Arrow className="ccard__arrow" />
        </a>
        <a href={ROUTE} target="_blank" rel="noopener" className="ccard">
          <span className="ccard__label">Офис</span>
          <span className="ccard__value ccard__value--sm">{CONTACTS.address}</span>
          {/* TODO(клиент): подтвердить часы работы */}
          <span className="ccard__hint">Пн–Пт, 9:00–18:00 · Построить маршрут</span>
          <Arrow className="ccard__arrow" />
        </a>
        <div className="ccard ccard--accent">
          <span className="ccard__label">{CONTACTS.company}</span>
          <span className="ccard__value ccard__value--sm">Посчитаем доставку вашего груза за 15 минут</span>
          <a href="#calc" data-open-calc className="btn btn--lg ccard__btn">
            <span>Рассчитать</span>
            <Arrow />
          </a>
        </div>
      </div>

      <MapCard />
    </section>
  );
}

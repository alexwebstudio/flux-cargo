import { PRINCIPLES, PHOTOS, img } from "@/lib/data";
import { SectionHead } from "./ui";

export default function About() {
  return (
    <section className="about navy" id="about">
      <div className="blobs" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="wrap about__in">
        <SectionHead label="О нас" index="Flux Cargo">
          Сделали доставку <em>простой</em>
        </SectionHead>

        <div className="about__grid">
          <div className="about__text">
            <p className="about__lead" data-fx="marker">
              Flux Cargo создали люди, которые сами годами закупают в Китае. Мы знаем, как важно получить товар{" "}
              <mark>вовремя</mark>, <mark>без переплат</mark> и скрытых условий.
            </p>
            <div className="about__body" data-fx="fade-up">
              <p>
                Мы начинали как обычные покупатели: заказывали на Taobao и 1688, ждали посылки месяцами, получали не
                тот цвет и размер, переплачивали посредникам. Поэтому построили сервис, которым хотели бы пользоваться
                сами.
              </p>
              <p>
                Сегодня у нас свои склады в Гуанчжоу и Иу, команда закупщиков, говорящих на китайском, и выдача в 14
                городах Казахстана. Мы выкупаем товар, проверяем его до отправки, объединяем заказы от разных продавцов
                и довозим до вашего города.
              </p>
              <p>
                Возим и личные заказы от одной коробки, и коммерческие партии для магазинов и селлеров Kaspi,
                Wildberries и Ozon. За каждым грузом закреплён один менеджер — он на связи от расчёта до выдачи.
              </p>
            </div>
            {/* TODO(клиент): подставить реальные факты */}
            <div className="about__facts" data-fx="fade-up">
              <div>
                <b>6 лет</b>
                <span>возим грузы из Китая</span>
              </div>
              <div>
                <b>2 склада</b>
                <span>в Гуанчжоу и Иу</span>
              </div>
              <div>
                <b>98%</b>
                <span>грузов приходят в срок</span>
              </div>
            </div>
          </div>
          <div className="about__media" data-fx="fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(PHOTOS.warehouse, 1200)} alt="Склад консолидации в Китае" loading="lazy" data-fx="parallax" data-speed="6" />
          </div>
        </div>

        <div className="princ" data-fx="stagger">
          {PRINCIPLES.map((p, i) => (
            <div className="princ__item" key={p.title}>
              <span className="princ__n">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

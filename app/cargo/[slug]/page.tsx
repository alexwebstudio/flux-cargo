import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, TARIFFS, img } from "@/lib/data";
import Link from "next/link";
import { Arrow } from "@/components/ui";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CATEGORIES.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.title} из Китая в Казахстан — Flux Cargo`,
    description: c.lead,
  };
}

/** Отдельная страница категории «Что доставляем». */
export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const i = CATEGORIES.findIndex((x) => x.slug === slug);
  if (i === -1) notFound();
  const c = CATEGORIES[i];
  const t = TARIFFS[c.mode];
  const others = CATEGORIES.filter((x) => x.slug !== slug);

  return (
    <main className="catpage">
      <section className="catpage__hero navy">
        <div className="wrap catpage__hero-in">
          <nav className="crumbs" aria-label="Хлебные крошки">
            <Link href="/">Главная</Link>
            <span>/</span>
            <Link href="/#cargo">Что доставляем</Link>
            <span>/</span>
            <b>{c.title}</b>
          </nav>
          <span className="catpage__idx" data-fx="fade-up">
            Категория 0{i + 1}
          </span>
          <h1 className="catpage__title" data-fx="fade-up">
            {c.title} <em>из Китая</em>
          </h1>
          <p className="catpage__lead" data-fx="fade-up">
            {c.lead}
          </p>
          <div className="catpage__ctas" data-fx="fade-up">
            <a href="#calc" data-open-calc data-calc-goods={c.goods} data-calc-mode={c.mode} className="btn btn--accent btn--lg" data-magnetic>
              <span>Рассчитать</span>
              <Arrow />
            </a>
            <Link href="/#cargo" className="btn btn--ghost btn--lg">
              <span>Все категории</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="wrap catpage__block">
        <div className="catpage__grid">
          <div>
            <span className="shead__label">/ Что привозим</span>
            <h2 className="catpage__h2" data-fx="mask">
              Примеры <em>товаров</em>
            </h2>
            <ul className="catpage__list" data-fx="stagger">
              {c.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div className="catpage__photo" data-fx="fade-up">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(c.photo, 1200)} alt={c.title} loading="lazy" />
          </div>
        </div>
      </section>

      <section className="wrap catpage__block">
        <span className="shead__label">/ Как работаем с категорией</span>
        <h2 className="catpage__h2" data-fx="mask">
          На что <em>обращаем внимание</em>
        </h2>
        <div className="catpage__care" data-fx="stagger">
          {c.care.map((x, n) => (
            <div className="care" key={x.title}>
              <span className="care__n">{n + 1}</span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap catpage__block">
        <div className="catpage__rec navy" data-fx="fade-up">
          <div>
            <span className="shead__label">/ Рекомендуем</span>
            <h2 className="catpage__h2">
              {t.label} — <em>{t.time}</em>
            </h2>
            <p>{c.tip}</p>
          </div>
          <div className="catpage__rec-price">
            <small>Ставка</small>
            <b>от {Math.min(...t.rates).toLocaleString("ru-RU")} $/кг</b>
            <a href="#calc" data-open-calc data-calc-goods={c.goods} data-calc-mode={c.mode} className="btn btn--accent btn--lg">
              <span>Рассчитать</span>
              <Arrow />
            </a>
          </div>
        </div>
      </section>

      <section className="wrap catpage__block catpage__others">
        <span className="shead__label">/ Другие категории</span>
        <div className="catpage__links">
          {others.map((o) => (
            <Link key={o.slug} href={`/cargo/${o.slug}`} className="catlink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(o.photo, 400)} alt="" loading="lazy" />
              <span>{o.title}</span>
              <Arrow />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

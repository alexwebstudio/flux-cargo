import Link from "next/link";
import { CATEGORIES, img } from "@/lib/data";
import { SectionHead, Arrow } from "./ui";

/** «Что доставляем»: превью-сетка, каждая карточка ведёт на отдельную страницу категории. */
export default function Categories() {
  return (
    <section className="cats wrap" id="cargo">
      <SectionHead
        label="Что доставляем"
        index={`${CATEGORIES.length} категорий`}
        aside="От партии футболок для магазина до запчастей и электроники. Не нашли свою категорию — спросите."
      >
        Любые грузы <em>из Китая</em>
      </SectionHead>

      <div className="cats__grid" data-fx="stagger">
        {CATEGORIES.map((c, i) => (
          <Link href={`/cargo/${c.slug}`} className="cat" key={c.slug} data-tilt="5">
            <div className="cat__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img(c.photo, 900)} alt={c.title} loading="lazy" />
            </div>
            <div className="cat__body">
              <span className="cat__idx">0{i + 1}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
            <span className="cat__go" aria-hidden>
              <Arrow />
            </span>
            <i className="cat__glare" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}

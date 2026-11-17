"use client";

import { useState } from "react";
import { FAQ } from "@/lib/data";
import { SectionHead } from "./ui";

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq wrap" id="faq">
      <div className="faq__grid">
        <div className="faq__side">
          <SectionHead label="FAQ" index="05">
            Частые <em>вопросы</em>
          </SectionHead>
          <p className="faq__ask" data-fx="fade-up">
            Не нашли ответ —{" "}
            <a href="#contacts" className="ulink">
              свяжитесь с нами
            </a>
          </p>
        </div>
        <ul className="faq__list" data-fx="stagger">
          {FAQ.map((f, i) => (
            <li key={f.q} className={`faq__item ${open === i ? "is-open" : ""}`}>
              <button className="faq__q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{f.q}</span>
                <i aria-hidden />
              </button>
              <div className="faq__a">
                <div>
                  <p>{f.a}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

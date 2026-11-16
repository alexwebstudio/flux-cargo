import Link from "next/link";
import { CONTACTS, NAV } from "@/lib/data";
import ToTop from "./ToTop";

export default function Footer() {
  return (
    <footer className="ftr navy">
      <div className="wrap">
        <div className="ftr__top">
          {/* те же «подлетающие» пункты, что и в шапке */}
          <nav className="ftr__nav" aria-label="Меню в подвале">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hdr__link ftr__link">
                <span className="hdr__slash">/</span>
                <span className="hdr__txt" data-text={n.label}>
                  {n.label}
                </span>
              </a>
            ))}
          </nav>
          <div className="ftr__contacts">
            <a href={CONTACTS.phoneHref} className="glow">
              {CONTACTS.phone}
            </a>
            <a href={`mailto:${CONTACTS.email}`} className="glow glow--rtl">
              {CONTACTS.email}
            </a>
          </div>
        </div>

        <Link href="/" className="ftr__brand" aria-label="Flux Cargo — на главную">
          <span className="ftr__flux">FLUX</span> <span className="ftr__cargo">CARGO</span>
        </Link>

        <div className="ftr__bottom">
          <span>© Flux Cargo, {new Date().getFullYear()}. Все права защищены.</span>
          <span>
            Разработано —{" "}
            <a href="https://www.alexwebstudio.ru/" target="_blank" rel="noopener" className="glow">
              alexwebstudio
            </a>
          </span>
          <ToTop className="ftr__up glow glow--rtl" />
        </div>
      </div>
    </footer>
  );
}

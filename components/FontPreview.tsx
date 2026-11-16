"use client";

import { useEffect, useState } from "react";
import { HEADING_FONTS, googleFontsUrl, type HeadingFont } from "@/lib/fonts";

const KEY = "flux:font";

/**
 * Примерка шрифта заголовков на живом сайте: /?font=unbounded
 * Выбор запоминается на вкладку, внизу экрана — переключатель вариантов.
 * Без параметра (и без сохранённого выбора) ничего не делает.
 */
export default function FontPreview() {
  const [font, setFont] = useState<HeadingFont | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("font");
    let id = q;
    try {
      if (q === "reset") sessionStorage.removeItem(KEY);
      else if (q) sessionStorage.setItem(KEY, q);
      else id = sessionStorage.getItem(KEY);
    } catch {}
    const f = HEADING_FONTS.find((x) => x.id === id) ?? null;
    setFont(f);
  }, []);

  useEffect(() => {
    if (!font) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = googleFontsUrl([font]);
    document.head.appendChild(link);
    const root = document.documentElement;
    root.style.setProperty("--f-display", `"${font.family}", sans-serif`);
    root.style.setProperty("--f-display-weight", String(font.weight));
    root.dataset.font = font.id;
    // заголовок в Hero подгоняется по ширине — пересчитать после загрузки шрифта
    document.fonts?.load(`${font.weight} 40px "${font.family}"`).then(() => window.dispatchEvent(new Event("resize")));
    return () => {
      link.remove();
      root.style.removeProperty("--f-display");
      root.style.removeProperty("--f-display-weight");
      delete root.dataset.font;
    };
  }, [font]);

  if (!font) return null;

  return (
    <div className="fontbar" role="region" aria-label="Примерка шрифта заголовков">
      <span>Шрифт заголовков:</span>
      <select
        value={font.id}
        onChange={(e) => {
          const f = HEADING_FONTS.find((x) => x.id === e.target.value)!;
          try {
            sessionStorage.setItem(KEY, f.id);
          } catch {}
          setFont(f);
        }}
        aria-label="Выбрать шрифт"
      >
        {HEADING_FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <a href="/fonts">Все варианты</a>
      <button
        onClick={() => {
          try {
            sessionStorage.removeItem(KEY);
          } catch {}
          setFont(null);
        }}
      >
        Закрыть
      </button>
    </div>
  );
}

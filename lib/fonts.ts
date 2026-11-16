/** Варианты шрифта для заголовков (все с кириллицей, Google Fonts). */
export const HEADING_FONTS = [
  {
    id: "inter-tight",
    name: "Inter Tight",
    family: "Inter Tight",
    weights: "700;800;900",
    weight: 900,
    note: "Текущий. Плотный нейтральный гротеск.",
  },
  {
    id: "unbounded",
    name: "Unbounded",
    family: "Unbounded",
    weights: "700;800;900",
    weight: 800,
    note: "Широкий, дерзкий, «технологичный». Сильный характер в Hero.",
  },
  {
    id: "onest",
    name: "Onest",
    family: "Onest",
    weights: "700;800;900",
    weight: 800,
    note: "Современный гротеск, создан под кириллицу. Спокойнее и чище.",
  },
  {
    id: "geologica",
    name: "Geologica",
    family: "Geologica",
    weights: "700;800;900",
    weight: 900,
    note: "Геометричный, с мягкими формами. Хорошо держит крупный кегль.",
  },
  {
    id: "montserrat",
    name: "Montserrat",
    family: "Montserrat",
    weights: "700;800;900",
    weight: 900,
    note: "Классика для логистики и B2B. Широкий, узнаваемый.",
  },
  {
    id: "dela-gothic",
    name: "Dela Gothic One",
    family: "Dela Gothic One",
    weights: "",
    weight: 400,
    note: "Очень жирный акцидентный. Максимально «громко», только для заголовков.",
  },
  {
    id: "russo-one",
    name: "Russo One",
    family: "Russo One",
    weights: "",
    weight: 400,
    note: "Квадратные формы, «спортивно-транспортный» характер.",
  },
] as const;

export type HeadingFont = (typeof HEADING_FONTS)[number];

export function googleFontsUrl(fonts: readonly HeadingFont[]) {
  const fam = fonts
    .map((f) => `family=${encodeURIComponent(f.family).replace(/%20/g, "+")}${f.weights ? `:wght@${f.weights}` : ""}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${fam}&display=swap`;
}

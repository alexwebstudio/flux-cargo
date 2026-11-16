/**
 * Источник статусов — только сервер (здесь телефоны клиентов).
 * Если заданы переменные Google-таблицы — читаем её (lib/sheets.server.ts),
 * иначе — демо-данные ниже. Инструкция: docs/TRACKING.md.
 */
import { STAGES, normalizeCode, type Shipment, type PublicShipment } from "./tracking";
import { sheetConfigured, findInSheet } from "./sheets.server";

/* ---------- демо-данные (относительные даты, чтобы демо всегда выглядело «живым») ---------- */
const day = 86_400_000;
const iso = (offsetDays: number, h = 12) => {
  const d = new Date(Date.now() + offsetDays * day);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const DEMO_SHIPMENTS: Shipment[] = [
  {
    code: "FC-240117",
    phone: "+77075551234",
    mode: "auto",
    from: "Иу",
    to: "Астана",
    weight: 46.5,
    places: 3,
    goods: "Одежда и обувь",
    eta: iso(5),
    manager: "Айгерим",
    photos: ["photo-1587293852726-70cdb56c2866", "photo-1553413077-190dd305871c"],
    events: [
      { stage: "created", date: iso(-9, 10), place: "Астана", note: "Расчёт подтверждён, 3 позиции с 1688" },
      { stage: "bought", date: iso(-8, 15), place: "Иу" },
      { stage: "checked", date: iso(-6, 11), place: "Склад Иу", note: "Брака нет, размеры совпадают. Фотоотчёт ниже" },
      { stage: "warehouse", date: iso(-5, 17), place: "Склад Иу", note: "Упаковано в 3 места, 46,5 кг" },
      { stage: "transit", date: iso(-3, 9), place: "Иу → Хоргос", note: "Фура FLX-112" },
    ],
  },
  {
    code: "FC-240245",
    phone: "+77011112233",
    mode: "air",
    from: "Гуанчжоу",
    to: "Алматы",
    weight: 4.2,
    places: 1,
    goods: "Электроника",
    eta: iso(-1),
    manager: "Данияр",
    events: [
      { stage: "created", date: iso(-7, 11), place: "Алматы" },
      { stage: "bought", date: iso(-6, 14), place: "Гуанчжоу" },
      { stage: "checked", date: iso(-5, 12), place: "Склад Гуанчжоу", note: "Проверили включение и комплектацию" },
      { stage: "warehouse", date: iso(-5, 18), place: "Склад Гуанчжоу" },
      { stage: "transit", date: iso(-4, 7), place: "Рейс CAN → ALA" },
      { stage: "border", date: iso(-3, 13), place: "Аэропорт Алматы", note: "Таможня пройдена" },
      { stage: "arrived", date: iso(-2, 10), place: "Филиал Алматы" },
      { stage: "delivered", date: iso(-1, 16), place: "Филиал Алматы", note: "Выдано получателю" },
    ],
  },
  {
    code: "FC-240388",
    phone: "+77770009900",
    mode: "rail",
    from: "Сиань",
    to: "Караганда",
    weight: 312,
    places: 8,
    goods: "Запчасти",
    eta: iso(14),
    manager: "Ерлан",
    photos: ["photo-1759419281419-b04552b2691a"],
    events: [
      { stage: "created", date: iso(-3, 9), place: "Караганда" },
      { stage: "bought", date: iso(-2, 16), place: "Сиань" },
      { stage: "checked", date: iso(-1, 12), place: "Склад Сиань", note: "Артикулы сверены, 2 позиции заменены поставщиком" },
    ],
  },
];

/* ---------- источник ---------- */
/** Таблица не подключена → работаем на демо-данных. */
export const isDemo = () => !sheetConfigured();

export async function getShipment(code: string): Promise<Shipment | null> {
  if (sheetConfigured()) return findInSheet(code);
  return DEMO_SHIPMENTS.find((s) => s.code === normalizeCode(code)) ?? null;
}

export function toPublic(s: Shipment): PublicShipment {
  const { phone: _phone, ...rest } = s;
  void _phone;
  const events = [...s.events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const last = events[events.length - 1]?.stage ?? "created";
  const idx = STAGES.findIndex((x) => x.id === last);
  return { ...rest, events, stage: last, progress: idx / (STAGES.length - 1) };
}

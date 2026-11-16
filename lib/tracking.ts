/**
 * Трекинг грузов: общая часть (этапы, типы) — можно импортировать и на клиенте.
 * Данные и источник статусов — только на сервере: lib/tracking.server.ts.
 *
 * Сейчас источник — демо-данные (DEMO_SHIPMENTS). Чтобы подключить реальные грузы,
 * замените тело getShipment(): например, запрос в amoCRM / Bitrix24 по номеру сделки
 * или чтение Google-таблицы. Остальной код (API, страница) менять не нужно.
 *
 * TODO(клиент): выбрать источник статусов (CRM / таблица / своя админка).
 */

export const STAGES = [
  { id: "created", label: "Заявка принята", hint: "Менеджер закреплён за грузом" },
  { id: "bought", label: "Выкуплен", hint: "Оплатили товар поставщику" },
  { id: "checked", label: "Проверен", hint: "Фото- и видеоотчёт готов" },
  { id: "warehouse", label: "На складе в Китае", hint: "Упакован и объединён в партию" },
  { id: "transit", label: "В пути", hint: "Груз отправлен" },
  { id: "border", label: "Таможня", hint: "Проходит границу Китай — Казахстан" },
  { id: "arrived", label: "Прибыл в город", hint: "Ждёт вас в филиале" },
  { id: "delivered", label: "Выдан", hint: "Груз получен" },
] as const;

export type StageId = (typeof STAGES)[number]["id"];

export type TrackEvent = { stage: StageId; date: string; place: string; note?: string };

export type Shipment = {
  code: string;
  phone: string; // полный номер хранится только на сервере
  mode: "air" | "auto" | "rail" | "sea";
  from: string;
  to: string;
  weight: number;
  places: number;
  goods: string;
  eta: string; // ISO-дата
  events: TrackEvent[];
  photos?: string[];
  manager: string;
};

/** Ответ клиенту — без телефона и прочих внутренних полей. */
export type PublicShipment = Omit<Shipment, "phone"> & { stage: StageId; progress: number };

export const MODE_LABEL: Record<Shipment["mode"], string> = {
  air: "Авиа",
  auto: "Авто",
  rail: "Ж/Д",
  sea: "Море + Ж/Д",
};

/** «fc 240117», «FC240117», «240117» → «FC-240117» */
export const normalizeCode = (s: string) => {
  const c = s.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.startsWith("FC")) return `FC-${c.slice(2)}`;
  return /^\d+$/.test(c) ? `FC-${c}` : c;
};

/** Подсказка для демо на странице трекинга. TODO: убрать, когда подключат реальный источник. */
export const DEMO_HINT = { code: "FC-240117", phone4: "1234" };

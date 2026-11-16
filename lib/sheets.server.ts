/**
 * Источник статусов: Google-таблица. Один груз = одна строка, менеджер ставит дату
 * в колонке этапа, когда этап пройден. Сайт читает таблицу (кэш 60 с) и строит историю.
 *
 * Подключение — переменные окружения (см. docs/TRACKING.md):
 *   ВАРИАНТ 1 (рекомендуется, таблица остаётся закрытой):
 *     GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE (по умолчанию «Грузы»),
 *     GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY
 *   ВАРИАНТ 2 (быстрый старт, но таблица публикуется по ссылке):
 *     GOOGLE_SHEET_CSV_URL — «Файл → Опубликовать в интернете → CSV»
 */
import crypto from "node:crypto";
import { STAGES, normalizeCode, type Shipment, type StageId, type TrackEvent } from "./tracking";

const env = process.env;

export const sheetConfigured = () =>
  Boolean(env.GOOGLE_SHEET_CSV_URL || (env.GOOGLE_SHEET_ID && env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_PRIVATE_KEY));

/* ---------- чтение таблицы ---------- */
let cache: { at: number; rows: string[][] } | null = null;
const TTL = 60_000;

async function readRows(): Promise<string[][]> {
  if (cache && Date.now() - cache.at < TTL) return cache.rows;
  const rows = env.GOOGLE_SHEET_CSV_URL ? await readCsv(env.GOOGLE_SHEET_CSV_URL) : await readApi();
  cache = { at: Date.now(), rows };
  return rows;
}

async function readCsv(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`CSV ${r.status}`);
  return parseCsv(await r.text());
}

let token: { value: string; exp: number } | null = null;
async function accessToken() {
  if (token && Date.now() < token.exp - 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const key = (env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
  });
  if (!r.ok) throw new Error(`Google token ${r.status}`);
  const j = (await r.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return token.value;
}

async function readApi() {
  const range = encodeURIComponent(env.GOOGLE_SHEET_RANGE || "Грузы");
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${range}?valueRenderOption=FORMATTED_VALUE`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: "no-store" });
  if (!r.ok) throw new Error(`Google Sheets ${r.status}`);
  const j = (await r.json()) as { values?: string[][] };
  return j.values ?? [];
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/* ---------- разбор строки ---------- */
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]/g, "");

/** Колонки ищем по названию в шапке — порядок в таблице может быть любым. */
const COLS = {
  code: ["трекномер", "трек", "номер"],
  phone: ["телефон"],
  mode: ["способ", "доставка"],
  from: ["откуда"],
  to: ["куда"],
  goods: ["груз", "товар"],
  weight: ["весkg", "вескг", "вес"],
  places: ["мест", "местa", "места"],
  eta: ["ожидаем", "eta", "датаприбытия"],
  manager: ["менеджер"],
  now: ["гдесейчас", "местоположение"],
  note: ["комментарий"],
  photos: ["фото", "фотоотчет"],
} as const;

/** Колонки этапов: в ячейке — дата, когда этап пройден. */
const STAGE_COLS: Record<StageId, string[]> = {
  created: ["заявка", "заявкапринята"],
  bought: ["выкуплен"],
  checked: ["проверен"],
  warehouse: ["насклад", "наскладе", "наскладевкитае", "склад"],
  transit: ["впути", "отправлен"],
  border: ["таможня", "граница"],
  arrived: ["прибыл", "прибылвгород"],
  delivered: ["выдан"],
};

const MODES: Record<string, Shipment["mode"]> = { авиа: "air", авто: "auto", жд: "rail", море: "sea", моремжд: "sea", морежд: "sea" };

/** «12.11.2026 14:00», «12.11.2026», «2026-11-12» → ISO (время Казахстана, UTC+5) */
export function parseDate(s: string): string | null {
  const t = s.trim();
  if (!t) return null;
  let m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:[ ,T]+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const hh = m[4] ? m[4].padStart(2, "0") : "12";
    const mm = m[5] ?? "00";
    return new Date(`${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}T${hh}:${mm}:00+05:00`).toISOString();
  }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (m) return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4] ?? "12"}:${m[5] ?? "00"}:00+05:00`).toISOString();
  const d = new Date(t);
  return isNaN(+d) ? null : d.toISOString();
}

function rowToShipment(get: (k: keyof typeof COLS) => string, stageDate: (s: StageId) => string): Shipment {
  const from = get("from"), to = get("to");
  const events: TrackEvent[] = [];
  for (const st of STAGES) {
    const date = parseDate(stageDate(st.id));
    if (!date) continue;
    const place =
      st.id === "created" ? to
      : st.id === "transit" ? `${from} → ${to}`
      : st.id === "border" ? "Граница Китай — Казахстан"
      : st.id === "arrived" || st.id === "delivered" ? `Филиал ${to}`
      : `Склад ${from}`;
    events.push({ stage: st.id, date, place });
  }
  if (!events.length) events.push({ stage: "created", date: new Date().toISOString(), place: to });
  // «Где сейчас» и «Комментарий» относятся к последнему пройденному этапу
  const last = events[events.length - 1];
  if (get("now")) last.place = get("now");
  if (get("note")) last.note = get("note");

  const num = (s: string) => Number(s.replace(",", ".").replace(/[^\d.]/g, "")) || 0;
  return {
    code: normalizeCode(get("code")),
    phone: get("phone"),
    mode: MODES[norm(get("mode"))] ?? "auto",
    from,
    to,
    goods: get("goods") || "Груз",
    weight: num(get("weight")),
    places: num(get("places")) || 1,
    eta: parseDate(get("eta")) ?? last.date,
    manager: get("manager") || "ваш менеджер",
    photos: get("photos").split(/[\s,;]+/).filter((u) => /^https?:\/\//.test(u)),
    events,
  };
}

export async function findInSheet(code: string): Promise<Shipment | null> {
  const rows = await readRows();
  if (rows.length < 2) return null;
  const head = rows[0].map(norm);
  const col = (names: readonly string[]) => head.findIndex((h) => names.includes(h));
  const idx = Object.fromEntries(Object.entries(COLS).map(([k, v]) => [k, col(v)])) as Record<keyof typeof COLS, number>;
  const sIdx = Object.fromEntries(STAGES.map((s) => [s.id, col(STAGE_COLS[s.id])])) as Record<StageId, number>;
  if (idx.code < 0 || idx.phone < 0) throw new Error("В таблице нет колонок «Трек-номер» и «Телефон»");

  const want = normalizeCode(code);
  const row = rows.slice(1).find((r) => normalizeCode(r[idx.code] ?? "") === want);
  if (!row) return null;
  const cell = (i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");
  return rowToShipment(
    (k) => cell(idx[k]),
    (s) => cell(sIdx[s]),
  );
}

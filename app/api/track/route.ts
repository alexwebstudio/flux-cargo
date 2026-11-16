import { NextResponse } from "next/server";
import { normalizeCode } from "@/lib/tracking";
import { getShipment, toPublic } from "@/lib/tracking.server";

/**
 * POST /api/track  { code: "FC-240117", phone4: "1234" }
 *
 * Статус отдаём только если совпали трек-номер И последние 4 цифры телефона —
 * так чужие номера нельзя перебрать. На любую ошибку — один и тот же ответ «не найден».
 */

// простое ограничение частоты: 10 запросов в минуту с одного IP (в памяти процесса)
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n++;
  return h.n > 10;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте через минуту." }, { status: 429 });
  }

  let body: { code?: unknown; phone4?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? normalizeCode(body.code) : "";
  const phone4 = typeof body.phone4 === "string" ? body.phone4.replace(/\D/g, "") : "";
  if (!code || phone4.length !== 4) {
    return NextResponse.json({ error: "Укажите трек-номер и 4 последние цифры телефона" }, { status: 400 });
  }

  let s;
  try {
    s = await getShipment(code);
  } catch (e) {
    console.error("[track] источник статусов недоступен:", e);
    return NextResponse.json({ error: "Трекинг временно недоступен. Позвоните менеджеру — подскажем статус." }, { status: 503 });
  }
  if (!s || !s.phone.replace(/\D/g, "").endsWith(phone4)) {
    return NextResponse.json({ error: "Груз не найден. Проверьте трек-номер и телефон." }, { status: 404 });
  }

  return NextResponse.json({ shipment: toPublic(s) }, { headers: { "Cache-Control": "no-store" } });
}

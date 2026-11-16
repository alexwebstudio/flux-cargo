import type { Metadata } from "next";
import Tracker from "@/components/Tracker";
import { isDemo } from "@/lib/tracking.server";

export const metadata: Metadata = {
  title: "Трекинг груза — Flux Cargo",
  description: "Узнайте, где ваш груз из Китая: статус, этапы доставки, история и фотоотчёт по трек-номеру.",
};

// режим (демо / таблица) зависит от переменных окружения — считаем на каждый запрос
export const dynamic = "force-dynamic";

export default function TrackPage() {
  return (
    <main className="trk">
      <Tracker demo={isDemo()} />
    </main>
  );
}

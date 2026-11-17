"use client";

import { useSyncExternalStore } from "react";
import { FROM_CITIES, GOODS, TO_CITIES, type TariffMode } from "./data";

/**
 * Общее состояние калькулятора. Калькулятор на главной и калькулятор в поп-апе
 * читают и пишут одно и то же: заполнили на странице → нажали «Рассчитать» →
 * в поп-апе уже те же город, товар, способ и вес.
 */
export type CalcState = {
  from: string;
  to: string;
  goods: string;
  /** если выбран тип «Другое» — что за товар, клиент пишет сам */
  goodsText: string;
  mode: TariffMode;
  kg: number;
  name: string;
  phone: string;
  sent: boolean;
};

const initial: CalcState = {
  from: FROM_CITIES[0],
  to: TO_CITIES[0],
  goods: GOODS[1].id,
  goodsText: "",
  mode: "auto",
  kg: 25,
  name: "",
  phone: "",
  sent: false,
};

let state = initial;
const listeners = new Set<() => void>();

export function setCalc(patch: Partial<CalcState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCalc() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

/** Пресет из data-атрибутов кнопки: data-calc-mode, data-calc-goods. */
export function applyPreset(el: HTMLElement) {
  const patch: Partial<CalcState> = {};
  const mode = el.dataset.calcMode as TariffMode | undefined;
  const goods = el.dataset.calcGoods;
  if (mode && ["air", "auto", "rail"].includes(mode)) patch.mode = mode;
  if (goods && GOODS.some((g) => g.id === goods)) patch.goods = goods;
  if (Object.keys(patch).length) setCalc(patch);
}

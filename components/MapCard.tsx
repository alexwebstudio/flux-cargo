"use client";

import { useState } from "react";
import { CONTACTS } from "@/lib/data";
import { Arrow } from "./ui";

// TODO(клиент): уточнить точку офиса (сейчас — геокод «Сыганак 47, Астана»)
const LAT = 51.122844;
const LON = 71.434638;
const SRC = `https://yandex.ru/map-widget/v1/?ll=${LON}%2C${LAT}&z=16&pt=${LON}%2C${LAT}%2Cpm2rdm&lang=ru_RU`;
const ROUTE = `https://yandex.kz/maps/?rtext=~${LAT}%2C${LON}&rtt=auto`;

/**
 * Большая карточка с картой под контактами.
 * Карта не перехватывает прокрутку страницы, пока по ней не кликнули.
 */
export default function MapCard() {
  const [active, setActive] = useState(false);
  return (
    <div className={`mapcard ${active ? "is-active" : ""}`} data-fx="fade-up" onMouseLeave={() => setActive(false)}>
      <iframe src={SRC} title="Офис Flux Cargo на карте" loading="lazy" allowFullScreen />
      {!active && (
        <button className="mapcard__shield" onClick={() => setActive(true)} aria-label="Активировать карту">
          <span>Нажмите, чтобы двигать карту</span>
        </button>
      )}
      <div className="mapcard__info">
        <span className="ccard__label">Офис в Астане</span>
        <b>{CONTACTS.address}</b>
        <a href={ROUTE} target="_blank" rel="noopener" className="btn btn--accent btn--sm">
          <span>Построить маршрут</span>
          <Arrow />
        </a>
      </div>
    </div>
  );
}

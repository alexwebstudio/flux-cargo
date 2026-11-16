"use client";

import { useEffect } from "react";
import { READY_EVENT } from "@/lib/gsap";

/** На страницах без прелоадера (категории) сразу сообщаем «сайт готов». */
export default function SiteReady() {
  useEffect(() => {
    if (document.querySelector(".pl") || document.documentElement.dataset.ready === "1") return;
    const t = setTimeout(() => {
      document.documentElement.dataset.ready = "1";
      window.dispatchEvent(new Event(READY_EVENT));
    }, 0);
    return () => clearTimeout(t);
  }, []);
  return null;
}

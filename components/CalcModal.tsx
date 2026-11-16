"use client";

import { useEffect, useRef, useState } from "react";
import { applyPreset } from "@/lib/calcStore";
import { CalcForm } from "./Calculator";
import { Modal } from "./Modal";

/**
 * Один поп-ап для всех кнопок «Рассчитать» (атрибут data-open-calc).
 * Калькулятор связан с калькулятором на главной (общий стор), а кнопка может
 * дополнительно подставить способ/тип товара: data-calc-mode, data-calc-goods.
 */
export default function CalcModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-open-calc]");
      if (!t) return;
      e.preventDefault();
      opener.current = t;
      applyPreset(t);
      document.documentElement.classList.remove("menu-open");
      window.dispatchEvent(new Event("flux:close-modals"));
      setMounted(true);
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        opener.current?.focus({ preventScroll: true });
      }}
      title={
        <>
          Рассчитать <em>доставку</em>
        </>
      }
      id="calc-modal"
    >
      {mounted && <CalcForm inModal />}
    </Modal>
  );
}

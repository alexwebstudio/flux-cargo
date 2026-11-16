"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Общая оболочка поп-апа: оверлей, Esc, блокировка скролла, фокус на «закрыть». */
export function Modal({
  open,
  onClose,
  title,
  id,
  wide = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  id: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("modal-open");
    // после закрытия мобильного меню (оно само запускает скролл) — останавливаем снова
    const t1 = setTimeout(() => window.__lenis?.stop(), 0);
    const t2 = setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    // другой поп-ап открывается — этот закрываем
    const onOther = () => onCloseRef.current();
    window.addEventListener("keydown", onKey);
    window.addEventListener("flux:close-modals", onOther);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("flux:close-modals", onOther);
      if (!document.querySelector(".modal.is-open:not(#" + id + ")")) {
        document.documentElement.classList.remove("modal-open");
        window.__lenis?.start();
      }
    };
  }, [open, id]);

  return (
    <div
      id={id}
      className={`modal ${open ? "is-open" : ""} ${wide ? "" : "modal--narrow"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-hidden={!open}
    >
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__panel" data-lenis-prevent>
        <div className="modal__head">
          <h2 className="modal__title" id={`${id}-title`}>
            {title}
          </h2>
          <button className="modal__close" ref={closeBtn} onClick={onClose} aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

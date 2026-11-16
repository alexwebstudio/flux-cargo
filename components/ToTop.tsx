"use client";

/** «Наверх» — плавно через Lenis, на любой странице. */
export default function ToTop({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
    >
      Наверх ↑
    </button>
  );
}

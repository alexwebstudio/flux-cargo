import type { ReactNode } from "react";

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg className={`arrow ${className}`} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

/** Заголовок секции: «/ лейбл» (Scramble) + h2 (Mask Reveal) с курсив-акцентами. */
export function SectionHead({
  label,
  index,
  children,
  aside,
  id,
}: {
  label: string;
  index?: string;
  children: ReactNode;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className="shead">
      <div className="shead__top">
        <span className="shead__label" data-fx="scramble">
          / {label}
        </span>
        {index && <span className="shead__idx">{index}</span>}
      </div>
      <div className="shead__row">
        <h2 className="shead__title" data-fx="mask" id={id}>
          {children}
        </h2>
        {aside && (
          <div className="shead__aside" data-fx="fade-up">
            {aside}
          </div>
        )}
      </div>
    </div>
  );
}

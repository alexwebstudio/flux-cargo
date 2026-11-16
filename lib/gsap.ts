"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);
}

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Событие, которое прелоадер шлёт, когда сайт «открылся». */
export const READY_EVENT = "flux:ready";

export function onSiteReady(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  if (document.documentElement.dataset.ready === "1") {
    cb();
    return () => {};
  }
  const h = () => cb();
  window.addEventListener(READY_EVENT, h, { once: true });
  return () => window.removeEventListener(READY_EVENT, h);
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

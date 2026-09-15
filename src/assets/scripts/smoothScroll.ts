/**
 * Lenis smooth scrolling, kept in sync with GSAP's ScrollTrigger so scroll-
 * driven animations use the smoothed position. Loaded once by MainLayout.
 * `<body data-scroll="slow">` (the 404 page) dampens the wheel for a slower
 * feel. Under `prefers-reduced-motion` native scrolling is left alone.
 */
import Lenis from "lenis";
import { gsap, reducedMotion, ScrollTrigger } from "./motion";

if (!reducedMotion) {
  const slow = document.body.dataset.scroll === "slow";
  const lenis = new Lenis(slow ? { wheelMultiplier: 0.35 } : {});
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

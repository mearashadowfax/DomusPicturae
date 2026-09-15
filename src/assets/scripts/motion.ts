/**
 * The motion module: GSAP set up once, plus the few animation recipes the
 * pages share. View scripts import from here instead of registering plugins
 * and re-implementing reveals themselves.
 *
 * Honours `prefers-reduced-motion`: every recipe then applies its final
 * state immediately and creates no tween, so content is never hidden.
 */
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });

/** The house easing curve, registered once under this name. */
export const EASE = "custom";
CustomEase.create(EASE, "M0,0 C0,0.55 0.45,1 1,1");

export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
export const desktop = window.matchMedia("(min-width: 601px)");

export { gsap, ScrollTrigger, SplitText };

export type Cleanup = () => void;
const noop: Cleanup = () => {};

interface TriggerOptions {
  start?: string;
  /** Play once (default) or replay as the trigger scrolls in and out. */
  once?: boolean;
}

function triggerFor(
  trigger: string,
  { start = "top 80%", once = true }: TriggerOptions,
): ScrollTrigger.Vars {
  return once
    ? { trigger, start, once: true }
    : { trigger, start, toggleActions: "restart pause resume reverse" };
}

/** Split text into lines that rise into view as `trigger` scrolls in. */
export function revealLines(
  selector: string,
  trigger: string,
  options: TriggerOptions = {},
): Cleanup {
  if (reducedMotion) {
    gsap.set(selector, { opacity: 1 });
    return noop;
  }
  gsap.set(selector, { opacity: 1 });
  const triggers: ScrollTrigger[] = [];
  const split = SplitText.create(selector, {
    type: "lines",
    linesClass: "line",
    autoSplit: true,
    mask: "lines",
    // The default ("auto") puts aria-label on the target, which is invalid on
    // a <p>. Line splits keep the text readable, so no ARIA fix-up is needed.
    aria: "none",
    onSplit: (self) => {
      const tween = gsap.from(self.lines, {
        duration: 1,
        delay: 0.1,
        yPercent: 250,
        opacity: 0,
        stagger: 0.1,
        ease: EASE,
        scrollTrigger: triggerFor(trigger, options),
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      return tween;
    },
  });
  return () => {
    triggers.forEach((t) => t.kill());
    split.revert();
  };
}

/** Draw a horizontal rule from left to right as `trigger` scrolls in. */
export function drawRule(
  selector: string,
  trigger: string,
  options: TriggerOptions = {},
): Cleanup {
  if (reducedMotion) {
    gsap.set(selector, { scaleX: 1 });
    return noop;
  }
  const tween = gsap.to(selector, {
    duration: 1.5,
    scaleX: 1,
    ease: EASE,
    scrollTrigger: triggerFor(trigger, options),
  });
  return () => tween.scrollTrigger?.kill();
}

/** Slide an image container in from the left while its image slides in from the right. */
export function slideIn(containers: string): Cleanup {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(containers),
  );
  if (reducedMotion) {
    gsap.set(elements, { autoAlpha: 1 });
    return noop;
  }
  const timelines = elements.map((container) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        toggleActions: "restart none none reset",
      },
    });
    tl.set(container, { autoAlpha: 1 });
    tl.from(container, { duration: 1.5, xPercent: -100, ease: "power2.out" });
    tl.from(container.querySelector("img"), {
      duration: 1.5,
      xPercent: 100,
      scale: 1.3,
      delay: -1.5,
      ease: "power2.out",
    });
    return tl;
  });
  return () => timelines.forEach((tl) => tl.scrollTrigger?.kill());
}

/**
 * Run `init` once fonts are ready and whenever the desktop breakpoint is
 * crossed, cleaning up the previous run first. Returns nothing on phones.
 */
export function onDesktop(init: () => Cleanup): void {
  let cleanup: Cleanup = noop;
  const run = () => {
    cleanup();
    cleanup = desktop.matches ? init() : noop;
    ScrollTrigger.refresh();
  };
  document.fonts.ready.then(() => {
    run();
    desktop.addEventListener("change", run);
    let timer: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
  });
}

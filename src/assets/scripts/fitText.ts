/**
 * Shrink a single-line wordmark until it fits its container.
 *
 * The gallery name is editor-controlled, so no fixed font-size is right for
 * every name on every screen: "Picturae" at 25vw is wider than a phone. The
 * stylesheet's size stays the ceiling (and the no-JS fallback); this only
 * scales it down, so a name that already fits is left exactly as designed.
 *
 * Measures the text itself (a Range, not the block box) so it works on an
 * `<h1>` whose letters have been split into spans for a reveal.
 */
export function fitText(
  element: HTMLElement,
  {
    container = element.parentElement!,
    fill = 1,
  }: { container?: HTMLElement; fill?: number } = {},
): () => void {
  const range = document.createRange();

  const fit = () => {
    element.style.fontSize = "";
    range.selectNodeContents(element);
    const width = range.getBoundingClientRect().width;
    if (!width) return;
    const box = getComputedStyle(container);
    const available =
      (container.getBoundingClientRect().width -
        parseFloat(box.paddingLeft) -
        parseFloat(box.paddingRight)) *
      fill;
    const base = parseFloat(getComputedStyle(element).fontSize);
    if (width > available) {
      element.style.fontSize = `${(base * available) / width}px`;
    }
  };

  document.fonts.ready.then(fit);
  const observer = new ResizeObserver(fit);
  observer.observe(container);
  return () => {
    observer.disconnect();
    element.style.fontSize = "";
  };
}

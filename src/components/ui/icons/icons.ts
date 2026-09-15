/**
 * Inline SVG icons (Heroicons outline, MIT). Add an entry here and render it
 * with `<Icon name="…" />`; the `Icon` component types `name` from these keys.
 */
export interface IconDefinition {
  paths: { d: string; class?: string }[];
  viewBox: string;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: string;
  strokeLinecap?: "round" | "butt" | "square";
  strokeLinejoin?: "round" | "miter" | "bevel";
  clipRule?: "evenodd" | "nonzero";
  fillRule?: "evenodd" | "nonzero";
  class?: string;
}

const outline = {
  height: 24,
  width: 24,
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: "1.5",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: "currentColor",
} as const;

export const Icons = {
  play: {
    ...outline,
    paths: [
      {
        d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z",
      },
    ],
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof Icons;

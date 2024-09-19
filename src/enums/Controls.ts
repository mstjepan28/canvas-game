export const Controls = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  SHIFT: "Shift",
  SPACE: " ",
  A: "a",
  D: "d",
} as const;

export type TControls = (typeof Controls)[keyof typeof Controls];

import { useEffect, useState } from "react";
import { Controls } from "../enums/Controls";

export type THeldKey = "arrowLeft" | "arrowRight" | "space" | "shift";

export const useControlKeys = () => {
  const [heldKeys, setHeldKeys] = useState<Record<THeldKey, boolean>>({
    arrowLeft: false,
    arrowRight: false,
    space: false,
    shift: false,
  });

  const toggleKeyState = (key: THeldKey, state: boolean) => {
    setHeldKeys((prevHeldKeys) => ({
      ...prevHeldKeys,
      [key]: state,
    }));
  };

  const onKeyDown = ({ key }: KeyboardEvent) => {
    if (key === Controls.ARROW_LEFT || key === Controls.A) {
      toggleKeyState("arrowLeft", true);
    } else if (key === Controls.ARROW_RIGHT || key === Controls.D) {
      toggleKeyState("arrowRight", true);
    } else if (key === Controls.SPACE) {
      setHeldKeys((prev) => {
        return { ...prev, space: true, shift: false };
      });
    }
  };

  const onKeyUp = ({ key }: KeyboardEvent) => {
    if (key === Controls.ARROW_LEFT || key === Controls.A) {
      toggleKeyState("arrowLeft", false);
    } else if (key === Controls.ARROW_RIGHT || key === Controls.D) {
      toggleKeyState("arrowRight", false);
    } else if (key === Controls.SPACE) {
      toggleKeyState("space", false);
    } else if (key === Controls.SHIFT) {
      setHeldKeys((prev) => {
        return { ...prev, shift: !prev.shift };
      });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return { heldKeys };
};

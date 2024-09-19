import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAccelerometer } from "../hooks/useAccelerometer";
import { useControlKeys } from "../hooks/useControlKeys";
import { clampValue } from "../utils/clampValue";
import { CANVAS_SIZE, MAX_SPEED, RADIUS, SPEED } from "../utils/constants";
import { roundNumber } from "../utils/roundNumber";

type CanvasData = {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  size: {
    width: number;
    height: number;
  };
};

const GRAVITY_PULL = 0.5;

export const MainCanvas = () => {
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);

  const yPosRef = useRef(window.innerHeight / 2);
  const xPosRef = useRef(window.innerWidth / 2);

  const gravityRef = useRef(GRAVITY_PULL);
  const speedRef = useRef(SPEED);

  const { heldKeys } = useControlKeys();

  const formatDebugData = () => {
    const accData = accelerometer.isEnabled
      ? {
          accX: roundNumber(accelerometer.accData.x),
          accY: roundNumber(accelerometer.accData.y),
        }
      : {};

    return JSON.stringify(
      {
        ...accData,
        speedX: Math.abs(roundNumber(speedRef.current.x)),
        speedY: Math.abs(roundNumber(speedRef.current.y)),
        heldKeys: heldKeys,
      },
      null,
      2,
    );
  };

  const getCanvasData = () => {
    if (!canvasData) {
      throw new Error("Canvas data is not initialized");
    }

    return canvasData;
  };

  const drawSquare = () => {
    const canvasData = getCanvasData();
    const { width, height } = canvasData.size;

    const x = xPosRef.current;
    const y = yPosRef.current;

    canvasData.context.clearRect(0, 0, width, height);
    canvasData.context.fillStyle = "red";

    canvasData.context.beginPath();
    canvasData.context.arc(x, y, RADIUS, 0, 360);
    canvasData.context.fill();
  };

  const update = () => {
    const canvasData = getCanvasData();
    const { width, height } = canvasData.size;

    xPosRef.current += speedRef.current.x;
    yPosRef.current += speedRef.current.y;

    // ----- LEFT EDGE ------
    if (xPosRef.current + RADIUS > width) {
      speedRef.current.x = calculateDeflectionSpeed(speedRef.current.x);
      xPosRef.current = width - RADIUS;
    }

    // ----- RIGHT EDGE -----
    if (xPosRef.current - RADIUS < 0) {
      speedRef.current.x = calculateDeflectionSpeed(speedRef.current.x);
      xPosRef.current = RADIUS;
    }

    // ----- BOTTOM EDGE ----
    if (yPosRef.current + RADIUS > height) {
      speedRef.current.y = calculateDeflectionSpeed(speedRef.current.y);
      yPosRef.current = height - RADIUS;
    }

    // ----- TOP EDGE -------
    if (yPosRef.current - RADIUS < 0) {
      speedRef.current.y = calculateDeflectionSpeed(speedRef.current.y);
      yPosRef.current = RADIUS;
    }

    slowDownObject();
    drawSquare();

    frameCountRef.current += 1;
    frameCountRef.current %= 64;

    requestAnimationFrame(update);
  };

  const slowDownObject = () => {
    if (accelerometer.isEnabled) {
      return;
    }

    const CHANGE = 0.05;
    if (frameCountRef.current % 16 !== 0) {
      return;
    }
    if (Math.abs(speedRef.current.x) < CHANGE) {
      speedRef.current.x = 0;
    }
    if (speedRef.current.x !== 0) {
      const change = speedRef.current.x > 0 ? -CHANGE : CHANGE;
      speedRef.current.x = roundNumber(speedRef.current.x + change);
    }

    speedRef.current.y = roundNumber(speedRef.current.y + gravityRef.current);
    formatDebugData();
  };

  const calculateDeflectionSpeed = (speed: number) => {
    const deflection = roundNumber((speed / 1.5) * -1, 4);
    if (Math.abs(deflection) <= gravityRef.current) {
      return 0;
    }

    return deflection;
  };

  const lerp = (start: number, end: number, amount: number) => {
    return roundNumber(start + (end - start) * amount);
  };

  const accelerometer = useAccelerometer(({ x, y }) => {
    const LERP_AMOUNT = 0.25;

    speedRef.current.x = lerp(speedRef.current.x, x * -1, LERP_AMOUNT);
    speedRef.current.y = lerp(speedRef.current.y, y, LERP_AMOUNT);
  });

  useEffect(() => {
    const CHANGE_BY = 0.5;

    if (heldKeys.arrowLeft && heldKeys.arrowRight) {
      speedRef.current.x = 0;
    } else if (heldKeys.arrowLeft) {
      const newDx = roundNumber(speedRef.current.x - CHANGE_BY);
      speedRef.current.x = clampValue(newDx, { max: MAX_SPEED.x });
    } else if (heldKeys.arrowRight) {
      const newDx = roundNumber(speedRef.current.x + CHANGE_BY);
      speedRef.current.x = clampValue(newDx, { min: MAX_SPEED.x * -1 });
    }

    if (heldKeys.shift) {
      gravityRef.current = 0;
      speedRef.current.y = 0;
    } else {
      gravityRef.current = GRAVITY_PULL;
    }

    if (heldKeys.space) {
      const upwardsSpeed = GRAVITY_PULL * 1.5;
      const newDy = roundNumber(speedRef.current.y - upwardsSpeed);
      speedRef.current.y = clampValue(newDy, { max: MAX_SPEED.y });
    }
  }, [heldKeys]);

  useEffect(() => {
    if (!canvasData) {
      return;
    }

    /**
     * Prevent triggering multiple update loops when saving the file
     */
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    update();
  }, [canvasData]);

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      throw new Error("Failed to get canvas element");
    }

    const canvasContext = canvasElement.getContext("2d");
    if (!canvasContext) {
      throw new Error("Failed to get canvas context");
    }

    setCanvasData({
      element: canvasElement,
      context: canvasContext,
      size: {
        width: canvasElement.width,
        height: canvasElement.height,
      },
    });
  }, []);

  return (
    <>
      <pre className="fixed top-0 left-0 px-4 py-2">{formatDebugData()}</pre>
      <canvas ref={canvasRef} className="bg-blue-100" width={CANVAS_SIZE.WIDTH} height={CANVAS_SIZE.HEIGHT} />
    </>
  );
};

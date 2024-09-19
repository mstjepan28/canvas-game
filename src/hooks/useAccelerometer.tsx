import { useEffect, useState } from "react";
import { roundNumber } from "../utils/roundNumber";
export { debounce, throttle } from "throttle-debounce";

type TAccelerometerData = {
  x: number;
  y: number;
};

export const useAccelerometer = (onDataChange: (data: TAccelerometerData) => void) => {
  const [accData, setAccData] = useState<TAccelerometerData>({ x: 0, y: 0 });
  const [debugData, setDebugData] = useState<string>("");
  const isEnabled = false;

  const normalizeOrientation = (value: number | null) => {
    const deg90 = (value || 0) % 90;
    return roundNumber(deg90);
  };

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const x = normalizeOrientation(event.gamma) * -1;
      const y = normalizeOrientation(event.beta);

      const data = { x, y };

      setDebugData(JSON.stringify(data, null, 2));
      onDataChange(data);
      setAccData(data);
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return { debugData, accData, isEnabled };
};

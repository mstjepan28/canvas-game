import { useEffect, useState } from "react";
import { roundNumber } from "../utils/roundNumber";
export { debounce, throttle } from "throttle-debounce";

type TAccelerometerData = {
  x: number;
  y: number;
};

export const useAccelerometer = (onDataChange: (data: TAccelerometerData) => void) => {
  const [accData, setAccData] = useState<TAccelerometerData>({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [debugData, setDebugData] = useState<string>("");

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const data = {
      x: roundNumber(event.beta || 0), // In degree in the range [-180,180]
      y: roundNumber(event.gamma || 0), // In degree in the range [-90,90]
    };

    console.log(data);

    setDebugData(JSON.stringify(data, null, 2));
    setAccData(data);

    onDataChange(data);
  };

  const askForPermission = async () => {
    // @ts-ignore
    const orientationPermission = DeviceOrientationEvent.requestPermission as () => Promise<PermissionState>;
    if (typeof orientationPermission !== "function") {
      return;
    }

    try {
      const permissionState = await orientationPermission();
      if (permissionState !== "granted") {
        setDebugData("Permission denied for Device Orientation");
        setIsEnabled(false);
      }

      window.addEventListener("deviceorientation", handleOrientation);
      setIsEnabled(true);
    } catch (error) {
      setDebugData(`Error requesting permission: ${error}`);
      setIsEnabled(false);
    }
  };

  useEffect(() => {
    askForPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return { debugData, accData, isEnabled };
};

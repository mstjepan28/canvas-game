import { MainCanvas } from "./components/MainCanvas";
import "./index.css";

export const App = () => {
  return (
    <div className="w-full h-dvh flex items-center justify-center bg-white">
      <MainCanvas />
    </div>
  );
};

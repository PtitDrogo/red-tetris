import { useEffect, useState } from "react";

export function ControlsHelp() {
  const [isMobileTouch, setIsMobileTouch] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 767px) and (pointer: coarse)",
    );
    setIsMobileTouch(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsMobileTouch(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Mobile layout
  if (isMobileTouch) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-gray-400 font-sans mt-4 opacity-90 max-w-xs mx-auto text-center">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-700/60 rounded text-gray-200 text-[11px] font-medium tracking-wide">
            Swipe ↔
          </span>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-700/60 rounded text-gray-200 text-[11px] font-medium tracking-wide">
            Tap
          </span>
          <span>Rotate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-700/60 rounded text-gray-200 text-[11px] font-medium tracking-wide">
            Drag ↓
          </span>
          <span>Drop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-700/60 rounded text-gray-200 text-[11px] font-medium tracking-wide">
            Flick ↓
          </span>
          <span>Slam</span>
        </div>
      </div>
    );
  }

  // Desktop/Keyboard layout
  return (
    <div className="bg-gray-800 rounded-xl p-4 flex gap-2.5 text-[13px] text-gray-400 font-sans mt-2 opacity-90">
      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
          →
        </kbd>
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
          ←
        </kbd>
        <span>Move</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
          ↑
        </kbd>
        <span>Rotate</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
          ↓
        </kbd>
        <span>Drop</span>
      </div>

      <div className="flex items-center gap-2">
        <kbd className="px-2 py-0.5 bg-gray-700 rounded text-gray-200 text-[10.5px] uppercase tracking-wide font-medium">
          Space
        </kbd>
        <span>Hard Drop</span>
      </div>
    </div>
  );
}

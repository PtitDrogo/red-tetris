import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { GameInput } from "../../../shared/types";


//Claude attempt at game gestures !
export function useGameGestures(isEnabled: boolean) {
  const dispatch = useDispatch();

  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const startTime = useRef<number>(0);

  const gridAnchorX = useRef<number>(0);
  const lastY = useRef<number>(0);

  const isTracking = useRef<boolean>(false);

  const CELL_WIDTH = 24;
  const FLICK_TIME_THRESHOLD = 200;
  const FLICK_DISTANCE_THRESHOLD = 50;

  useEffect(() => {
    if (!isEnabled) return;

    const emitInput = (input: GameInput) => {
      dispatch({
        type: "socket/emit",
        payload: { event: "i", data: input },
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("label");

      if (isInteractive) {
        isTracking.current = false;
        return;
      }

      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      gridAnchorX.current = touch.clientX;
      lastY.current = touch.clientY;
      startTime.current = Date.now();
      isTracking.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTracking.current) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaY = currentY - lastY.current;

      // 1. Horizontal Tracking (Left / Right grid updates)
      if (Math.abs(currentX - gridAnchorX.current) >= CELL_WIDTH) {
        if (currentX - gridAnchorX.current > 0) {
          emitInput(GameInput.RIGHT);
        } else {
          emitInput(GameInput.LEFT);
        }
        gridAnchorX.current = currentX;
      }

      // 2. Continuous Vertical Tracking (Soft Drop)
      if (deltaY > 8) {
        emitInput(GameInput.DOWN);
        lastY.current = currentY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTracking.current) return;
      isTracking.current = false;

      const duration = Date.now() - startTime.current;
      const finalY = e.changedTouches[0].clientY;
      const finalX = e.changedTouches[0].clientX;
      // Measured from the ORIGINAL start, not the grid anchor
      const totalDeltaX = Math.abs(finalX - startX.current);
      const totalDeltaY = finalY - startY.current;

      // 3. Fast Flick Down -> Hard Drop (Slam)
      if (
        duration < FLICK_TIME_THRESHOLD &&
        totalDeltaY > FLICK_DISTANCE_THRESHOLD
      ) {
        emitInput(GameInput.SPACE);
        return;
      }

      // 4. Clean Tap -> Rotate
      if (duration < 250 && totalDeltaX < 15 && Math.abs(totalDeltaY) < 15) {
        emitInput(GameInput.ROTATE);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dispatch, isEnabled]);
}
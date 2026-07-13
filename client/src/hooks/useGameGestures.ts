import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { GameInput } from "../../../shared/types";

//Vibe coded but it works, nice !
export function useGameGestures(isEnabled: boolean) {
  const dispatch = useDispatch();

  // Track coordinates and timing
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const lastX = useRef<number>(0);
  const lastY = useRef<number>(0);
  const startTime = useRef<number>(0);

  // Configuration thresholds
  const CELL_WIDTH = 24; // Drag distance in px to register 1 grid-space movement
  const FLICK_TIME_THRESHOLD = 200; // ms to qualify as a fast flick
  const FLICK_DISTANCE_THRESHOLD = 50; // px to qualify as a hard drop slam

  useEffect(() => {
    if (!isEnabled) return;

    const emitInput = (input: GameInput) => {
      dispatch({
        type: "socket/emit",
        payload: { event: "i", data: input },
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Prevent zooming/scrolling behavior on mobile browsers
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("button") ||
        target.closest("input") ||
        target.closest("a") ||
        target.closest("label");

      if (isInteractive) {
        // Return early and do absolutely nothing.
        // This allows the browser's default click/tap behavior to process normally.
        return;
      }
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      lastX.current = touch.clientX;
      lastY.current = touch.clientY;
      startTime.current = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;

      const deltaX = currentX - lastX.current;
      const deltaY = currentY - lastY.current;

      // 1. Horizontal Tracking (Left / Right grid updates)
      if (Math.abs(currentX - startX.current) >= CELL_WIDTH) {
        if (deltaX > 0) {
          emitInput(GameInput.RIGHT);
        } else {
          emitInput(GameInput.LEFT);
        }
        // Reset anchor point to allow subsequent grid steps while dragging
        startX.current = currentX;
      }

      // 2. Continuous Vertical Tracking (Soft Drop)
      if (deltaY > 8) {
        // 8px threshold to avoid hyper-sensitivity
        emitInput(GameInput.DOWN);
        lastY.current = currentY;
      }

      lastX.current = currentX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const duration = Date.now() - startTime.current;
      const finalY = e.changedTouches[0].clientY;
      const finalX = e.changedTouches[0].clientX;

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
      // Verifies the user didn't significantly drag horizontally or vertically
      if (duration < 250 && totalDeltaX < 15 && Math.abs(totalDeltaY) < 15) {
        emitInput(GameInput.ROTATE);
      }
    };

    // Attach to window to capture gestures safely even if dragging out of boundaries
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

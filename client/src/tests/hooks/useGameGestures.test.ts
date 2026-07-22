import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameGestures } from "../../hooks/useGameGestures";
import { GameInput } from "../../../../shared/types";

const mockDispatch = vi.fn();
vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

describe("useGameGestures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const createTouchEvent = (
    type: string,
    x: number,
    y: number,
    target: HTMLElement = document.createElement("div")
  ) => {
    const touch = { clientX: x, clientY: y } as Touch;
    const event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
    }) as unknown as TouchEvent;

    Object.defineProperty(event, "touches", {
      value: type === "touchend" ? [] : [touch],
    });
    Object.defineProperty(event, "changedTouches", {
      value: [touch],
    });
    Object.defineProperty(event, "target", {
      value: target,
    });

    return event;
  };

  it("does nothing if isEnabled is false", () => {
    renderHook(() => useGameGestures(false));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 130, 100));

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("ignores gestures triggered on a button", () => {
    renderHook(() => useGameGestures(true));

    const button = document.createElement("button");
    document.body.appendChild(button);

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100, button));
    window.dispatchEvent(createTouchEvent("touchmove", 130, 100, button));

    expect(mockDispatch).not.toHaveBeenCalled();
    document.body.removeChild(button);
  });

  it("emits GameInput.RIGHT if the swipe exceeds CELL_WIDTH to the right", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 125, 100));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.RIGHT },
    });
  });

  it("emits GameInput.LEFT if the swipe exceeds CELL_WIDTH to the left", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 75, 100));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.LEFT },
    });
  });

  it("emits GameInput.DOWN if vertical movement exceeds 8px downward", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 100, 110));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.DOWN },
    });
  });

  it("emits GameInput.SPACE during a fast downward flick", () => {
    renderHook(() => useGameGestures(true));

    vi.spyOn(Date, "now").mockReturnValue(1000);
    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));

    vi.spyOn(Date, "now").mockReturnValue(1100);
    window.dispatchEvent(createTouchEvent("touchend", 100, 160));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.SPACE },
    });
  });

  it("emits GameInput.ROTATE during a simple fast tap without movement", () => {
    renderHook(() => useGameGestures(true));

    vi.spyOn(Date, "now").mockReturnValue(1000);
    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));

    vi.spyOn(Date, "now").mockReturnValue(1100);
    window.dispatchEvent(createTouchEvent("touchend", 102, 102));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.ROTATE },
    });
  });

  it("cleans up window listeners on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useGameGestures(true));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchend",
      expect.any(Function)
    );
  });
});
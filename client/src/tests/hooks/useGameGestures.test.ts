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

  it("ne fait rien si isEnabled est à false", () => {
    renderHook(() => useGameGestures(false));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 130, 100));

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("ignore les gestes déclenchés sur un bouton", () => {
    renderHook(() => useGameGestures(true));

    const button = document.createElement("button");
    document.body.appendChild(button);

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100, button));
    window.dispatchEvent(createTouchEvent("touchmove", 130, 100, button));

    expect(mockDispatch).not.toHaveBeenCalled();
    document.body.removeChild(button);
  });

  it("émet GameInput.RIGHT si le swipe dépasse CELL_WIDTH vers la droite", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 125, 100));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.RIGHT },
    });
  });

  it("émet GameInput.LEFT si le swipe dépasse CELL_WIDTH vers la gauche", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 75, 100));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.LEFT },
    });
  });

  it("émet GameInput.DOWN si le mouvement vertical dépasse 8px vers le bas", () => {
    renderHook(() => useGameGestures(true));

    window.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    window.dispatchEvent(createTouchEvent("touchmove", 100, 110));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "socket/emit",
      payload: { event: "i", data: GameInput.DOWN },
    });
  });

  it("émet GameInput.SPACE lors d'un flick rapide vers le bas", () => {
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

  it("émet GameInput.ROTATE lors d'un simple tap rapide sans mouvement", () => {
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

  it("nettoie les listeners window au démontage", () => {
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
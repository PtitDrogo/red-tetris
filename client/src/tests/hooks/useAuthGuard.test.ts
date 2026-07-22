import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
    useNavigate: vi.fn(),
}));

describe("useAuthGuard (100% Coverage)", () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    test("should redirect to '/' if the player name is empty", () => {
        vi.mocked(useSelector).mockImplementation((selectorFn: any) => {
            return selectorFn({ player: { name: "" } });
        });

        renderHook(() => useAuthGuard());

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("should not redirect if the player name is present", () => {
        vi.mocked(useSelector).mockImplementation((selectorFn: any) => {
            return selectorFn({ player: { name: "Alex" } });
        });

        const { rerender, unmount } = renderHook(() => useAuthGuard());

        rerender();
        unmount();

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
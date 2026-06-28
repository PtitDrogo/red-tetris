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

    test("devrait rediriger vers '/' si le nom du joueur est vide", () => {
        vi.mocked(useSelector).mockImplementation((selectorFn: any) => {
            return selectorFn({ player: { name: "" } });
        });

        renderHook(() => useAuthGuard());

        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("ne devrait pas rediriger si le nom du joueur est présent", () => {
        vi.mocked(useSelector).mockImplementation((selectorFn: any) => {
            return selectorFn({ player: { name: "Alex" } });
        });

        const { rerender, unmount } = renderHook(() => useAuthGuard());

        rerender();
        unmount();

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});

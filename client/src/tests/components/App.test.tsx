// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import App from "../../App";

vi.mock("../../components/Home", () => ({
    default: () => <div>Home Page</div>,
}));
vi.mock("../../components/LobbyList", () => ({
    default: () => <div>Lobby List Page</div>,
}));
vi.mock("../../components/Game", () => ({
    default: () => <div>Game Page</div>,
}));

function renderAtRoute(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <App />
        </MemoryRouter>,
    );
}

describe("App routing", () => {
    it("renders Home at the root path", () => {
        renderAtRoute("/");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("renders LobbyList at /lobbylist", () => {
        renderAtRoute("/lobbylist");
        expect(screen.getByText("Lobby List Page")).toBeInTheDocument();
    });

    it("renders Game at /:roomName/:playerName", () => {
        renderAtRoute("/myroom/john");
        expect(screen.getByText("Game Page")).toBeInTheDocument();
    });

    it("redirects an unmatched route back to Home", () => {
        renderAtRoute("/this/route/does/not/exist");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("does not match Game for a single-segment unknown path, and redirects to Home", () => {
        renderAtRoute("/randomsegment");
        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("applies the base layout classes to the wrapping container", () => {
        const { container } = renderAtRoute("/");
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass(
            "h-dvh",
            "bg-gray-900",
            "font-tetris",
            "text-white",
            "overflow-y-hidden"
        );
    });
});

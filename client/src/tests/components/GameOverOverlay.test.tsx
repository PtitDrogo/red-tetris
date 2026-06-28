import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import gameReducer, { clearGameOver } from "../../redux/gameSlice";
import playerReducer from "../../redux/playerSlice";
import GameOverOverlay from "../../components/GameOverOverlay";
import { GameOverRanking } from "../../../../shared/types";

vi.mock("../../redux/gameSlice", async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        clearGameOver: vi.fn(() => ({ type: "game/clearGameOver" })),
    };
});

const renderOverlayWithRedux = (
    playerName: string,
    gameOverOverlayState: any,
) => {
    const store = configureStore({
        reducer: {
            game: gameReducer,
            player: playerReducer,
        },
        preloadedState: {
            player: { name: playerName },
            game: {
                gameOver: gameOverOverlayState,
            } as any,
        },
    });

    return {
        store,
        ...render(
            <Provider store={store}>
                <GameOverOverlay />
            </Provider>,
        ),
    };
};

describe("GameOverOverlay Component", () => {
    const mockRanking : GameOverRanking[] = [
        { name: "Alex", points: 1200, level: 2 },
        { name: "Bob", points: 800, level: 1 },
    ];

    test("Branche Inactif : retourne null si active est false", () => {
        const { container } = renderOverlayWithRedux("Alex", {
            active: false,
            ranking: [],
        });
        expect(container.firstChild).toBeNull();
    });

    test("Branche Gagnant : affiche les félicitations et la couronne si le joueur est premier", () => {
        renderOverlayWithRedux("Alex", {
            active: true,
            ranking: mockRanking,
        });

        expect(screen.getByText(/Congratulations !/i)).toBeInTheDocument();

        const scoreElements = screen.getAllByText(/Score : 1200/i);
        expect(scoreElements.length).toBeGreaterThanOrEqual(1);

        expect(screen.getByText(/Level : 2/i)).toBeInTheDocument();
    });

    test("Branche Perdant : affiche 'You lost...' si un autre joueur a gagné", () => {
        renderOverlayWithRedux("Bob", {
            active: true,
            ranking: mockRanking,
        });

        expect(screen.getByText(/You lost.../i)).toBeInTheDocument();
        expect(screen.getByText(/Winner : Alex/i)).toBeInTheDocument();
    });

    test("Clic sur Continue déclenche le dispatch de clearGameOver", () => {
        renderOverlayWithRedux("Alex", {
            active: true,
            ranking: mockRanking,
        });

        const button = screen.getByRole("button", { name: /continue/i });
        fireEvent.click(button);

        expect(clearGameOver).toHaveBeenCalled();
    });

    test("Branche de secours (Fallbacks) : gère le classement vide ou partiel", () => {
        renderOverlayWithRedux("Alex", {
            active: true,
            ranking: [{ name: "Alex", points: 100, level: 0}, undefined, {}],
        });

        const containerText = document.body.textContent;

        expect(containerText).toContain("Empty");
        expect(containerText).toContain("0");
    });
});

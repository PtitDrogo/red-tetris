import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../../redux/gameSlice";
import playerReducer from "../../redux/playerSlice";
import Game from "../../components/Game";
import { GRID_STATES } from "../../../../shared/types";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useAuthGuard", () => ({
    useAuthGuard: vi.fn(),
}));

const renderGameWithRedux = (customGameState = {}) => {
    const emptyGrid = Array.from({ length: 20 }, () =>
        Array(10).fill(GRID_STATES.EMPTY),
    );

    const store = configureStore({
        reducer: {
            game: gameReducer,
            player: playerReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
        preloadedState: {
            player: { name: "Alex" },
            game: {
                grids: [],
                myGrid: {
                    name: "Alex",
                    board: emptyGrid,
                    score: 450,
                    level: 2,
                    status: "PLAYING",
                    nextPiece: "I",
                },
                owner: "Alex",
                status: "PLAYING",
                ownerId: "some-id",
                gameOver: {
                    active: false,
                    level: 1,
                    ranking: [],
                },
                ...customGameState,
            } as any,
        },
    });

    return {
        store,
        ...render(
            <Provider store={store}>
                <Game />
            </Provider>,
        ),
    };
};

describe("Game Component", () => {
    test("Rendu initial stable : affiche le joueur, le score et le bouton Quit", () => {
        renderGameWithRedux();
        expect(screen.getByText("Alex")).toBeInTheDocument();
        expect(screen.getByText("Score: 450")).toBeInTheDocument();

        const quitButton = screen.getByRole("button", { name: /quit/i });
        expect(quitButton).toBeInTheDocument();
    });

    test("Prend en compte les pressions de touches de clavier pour le Tetris", () => {
        renderGameWithRedux();

        fireEvent.keyDown(window, { key: "ArrowLeft" });
        fireEvent.keyDown(window, { key: "ArrowRight" });
        fireEvent.keyDown(window, { key: "ArrowUp" });
        fireEvent.keyDown(window, { key: "ArrowDown" });
        fireEvent.keyDown(window, { key: " " });

        expect(screen.getByText("Alex")).toBeInTheDocument();
    });

    test("Branche Adversaires : Affiche 'Empty' s'il n'y a pas assez d'adversaires", () => {
        renderGameWithRedux();

        const emptyLabels = screen.getAllByText("Empty");
        expect(emptyLabels.length).toBeGreaterThanOrEqual(3);
    });

    test("Clic sur le bouton Quit redirige vers la liste des salons", async () => {
        renderGameWithRedux();

        const quitButton = screen.getByRole("button", { name: /quit/i });
        fireEvent.click(quitButton);

        expect(mockNavigate).toHaveBeenCalledWith("/lobbylist");
    });
});

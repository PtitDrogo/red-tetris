import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("Game Component - Effet de secousse (shake)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const emptyGrid = Array.from({ length: 20 }, () =>
        Array(10).fill(GRID_STATES.EMPTY),
    );

    const baseMyGrid = {
        name: "Alex",
        board: emptyGrid,
        score: 450,
        level: 2,
        status: "PLAYING",
        nextPiece: "I",
    };

    test("Applique la classe de secousse correspondant au nombre de lignes effacées", () => {
        const { container } = renderGameWithRedux({
            myGrid: { ...baseMyGrid, clearedLinesIndexes: [3, 7] },
        });
        expect(container.querySelector(".animate-shake-2")).toBeInTheDocument();
    });

    test.each([
        [1, "animate-shake-1"],
        [2, "animate-shake-2"],
        [3, "animate-shake-3"],
        [4, "animate-shake-4"],
    ])(
        "Associe %i ligne(s) effacée(s) à la classe %s",
        (count, expectedClass) => {
            const { container } = renderGameWithRedux({
                myGrid: {
                    ...baseMyGrid,
                    clearedLinesIndexes: Array.from(
                        { length: count },
                        (_, i) => i,
                    ),
                },
            });
            expect(
                container.querySelector(`.${expectedClass}`),
            ).toBeInTheDocument();
        },
    );

    test("Ne secoue pas la grille quand aucune ligne n'est effacée", () => {
        const { container } = renderGameWithRedux({
            myGrid: { ...baseMyGrid, clearedLinesIndexes: [] },
        });
        ["animate-shake-1", "animate-shake-2", "animate-shake-3", "animate-shake-4"].forEach(
            (cls) => {
                expect(container.querySelector(`.${cls}`)).not.toBeInTheDocument();
            },
        );
    });

    test("Retire la classe de secousse après 300ms", async () => {
        const { container } = renderGameWithRedux({
            myGrid: { ...baseMyGrid, clearedLinesIndexes: [1, 2, 3] },
        });
        expect(container.querySelector(".animate-shake-3")).toBeInTheDocument();

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        expect(container.querySelector(".animate-shake-3")).not.toBeInTheDocument();
    });
});
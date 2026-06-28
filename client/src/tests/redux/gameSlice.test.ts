import { describe, test, expect } from "vitest";
import gameReducer, {
    setMyGrid,
    setGrids,
    setOwner,
    setStatus,
    setGameOver,
    clearGameOver,
    PlayerGrid,
} from "../../redux/gameSlice";

import {
    GameStatus,
    GameOverRanking,
    PieceType,
} from "../../../../shared/types";

describe("gameSlice", () => {
    const mockPlayerGrid: PlayerGrid = {
        name: "Alex",
        id: "socket-123",
        score: 500,
        board: [
            [0, 0],
            [0, 0],
        ],
        isAlive: true,
        level: 2,
        nextPiece: PieceType.I,
    };

    test("devrait retourner l'état initial par défaut", () => {
        const state = gameReducer(undefined, { type: "@@INIT" });

        expect(state.status).toBe(GameStatus.WAITING);
        expect(state.ownerId).toBe("None");
        expect(state.myGrid.name).toBe("Empty");
        expect(state.gameOver.active).toBe(false);
    });

    test("devrait gérer setMyGrid", () => {
        const state = gameReducer(undefined, setMyGrid(mockPlayerGrid));
        expect(state.myGrid).toEqual(mockPlayerGrid);
        expect(state.myGrid.name).toBe("Alex");
    });

    test("devrait gérer setGrids", () => {
        const mockGrids = [
            mockPlayerGrid,
            { ...mockPlayerGrid, name: "Bob", id: "socket-456" },
        ];
        const state = gameReducer(undefined, setGrids(mockGrids));

        expect(state.grids).toHaveLength(2);
        expect(state.grids[1].name).toBe("Bob");
    });

    test("devrait gérer setOwner", () => {
        const state = gameReducer(undefined, setOwner("owner-uuid-999"));
        expect(state.ownerId).toBe("owner-uuid-999");
    });

    test("devrait gérer setStatus", () => {
        const state = gameReducer(undefined, setStatus(GameStatus.ONGOING));
        expect(state.status).toBe(GameStatus.ONGOING);
    });

    test("devrait gérer setGameOver et forcer le status à WAITING", () => {
        const mockRanking: GameOverRanking[] = [
            { name: "Alex", points: 1500, level: 2 },
            { name: "Bob", points: 900, level: 1 },
        ];

        const initialStateWithOngoing = gameReducer(
            undefined,
            setStatus(GameStatus.ONGOING),
        );

        const state = gameReducer(
            initialStateWithOngoing,
            setGameOver({ ranking: mockRanking }),
        );

        expect(state.gameOver.active).toBe(true);
        expect(state.gameOver.ranking).toEqual(mockRanking);

        expect(state.status).toBe(GameStatus.WAITING);
    });

    test("devrait gérer clearGameOver", () => {
        const mockRanking: GameOverRanking[] = [
            { name: "Alex", points: 100, level: 0 },
        ];
        const stateWithGameOver = gameReducer(
            undefined,
            setGameOver({ ranking: mockRanking }),
        );
        expect(stateWithGameOver.gameOver.active).toBe(true);

        const cleanState = gameReducer(stateWithGameOver, clearGameOver());

        expect(cleanState.gameOver.active).toBe(false);
        expect(cleanState.gameOver.ranking).toHaveLength(0);
    });
});

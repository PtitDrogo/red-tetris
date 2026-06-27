import { describe, test, expect, vi } from "vitest";
import { store } from "../../redux/index";
import { GameStatus } from "../../../../shared/types";

vi.mock("../../redux/middleware/middleware", () => {
    return {
        default: () => (next: any) => (action: any) => {
            return next(action);
        },
    };
});

describe("Redux Store Configuration", () => {
    test("devrait initialiser le store avec la structure d'état correcte (RootState)", () => {
        const state = store.getState();

        expect(state).toHaveProperty("player");
        expect(state.player).toHaveProperty("name");

        expect(state).toHaveProperty("lobbies");
        expect(state.lobbies).toHaveProperty("list");
        expect(Array.isArray(state.lobbies.list)).toBe(true);

        expect(state).toHaveProperty("game");
        expect(state.game.status).toBe(GameStatus.WAITING);
        expect(state.game.gameOver.active).toBe(false);
    });

    test("devrait intégrer le middleware et accepter le dispatch d'actions", () => {
        expect(store.dispatch).toBeTypeOf("function");

        store.dispatch({ type: "game/clearGameOver" });
        const state = store.getState();
        expect(state.game.gameOver.active).toBe(false);
    });
});

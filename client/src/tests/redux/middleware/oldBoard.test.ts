import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServerMessage } from "../../../../../shared/types";
import { initGame } from "../../../redux/middleware/initializers";
import { socket } from "../../../socket";

vi.mock("../../../socket", () => ({
    socket: {
        on: vi.fn(),
        off: vi.fn(),
        id: "my-socket-id",
    },
}));

describe("initGame - oldBoard display logic", () => {
    let mockStore: any;
    let mockDispatch: any;
    let gameStateHandler: any;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockDispatch = vi.fn();
        mockStore = {
            dispatch: mockDispatch,
            getState: vi.fn(() => ({ player: { name: "Player1" } })),
        };

        initGame(mockStore);

        const calls = (socket.on as any).mock.calls;

        const gameStateCall = calls.find(
            ([event]: [string]) => event === ServerMessage.GAME_STATE,
        );
        gameStateHandler = gameStateCall?.[1];
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should display oldBoard immediately and clear it after MIN_OLD_BOARD_DISPLAY_MS", () => {
        expect(gameStateHandler).toBeDefined();

        const payload = {
            players: [
                {
                    id: "my-socket-id",
                    oldBoard: [
                        [1, 1],
                        [1, 1],
                    ],
                    board: [[0, 0]],
                },
                { id: "opp1" },
            ],
            playWithBlessed: false,
        };

        gameStateHandler(payload);

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: "game/setMyGrid" }),
        );

        vi.advanceTimersByTime(150);

        const setMyGridCount = mockDispatch.mock.calls.filter(
            (c: any) => c[0].type === "game/setMyGrid",
        ).length;
        expect(setMyGridCount).toBeGreaterThan(1);
    });

    it("should ignore new oldBoard while one is displayed", () => {
        gameStateHandler({
            players: [{ id: "my-socket-id", oldBoard: [[5]] }],
        });
        mockDispatch.mockClear();
        gameStateHandler({
            players: [{ id: "my-socket-id", oldBoard: [[9]] }],
        });
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});

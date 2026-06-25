import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameInput, PieceType } from "../../../shared/types.js";
import { Board } from "../game/Board.js";
import { Player, STARTING_SPEED } from "../game/Player.js";

describe("Player Class Mechanics", () => {
    let dummyBoard: Board;
    let initialPlayer: Player;
    const mockSocketId = "socket_abc123";
    const mockName = "BlockMaster";

    beforeEach(() => {
        dummyBoard = new Board(42, Object.values(PieceType));
        vi.restoreAllMocks();

        initialPlayer = new Player(
            mockSocketId,
            dummyBoard,
            1000,
            0,
            STARTING_SPEED,
            mockName,
        );
    });

    describe("Constructor, Getters, & Copy Fallbacks", () => {
        it("should successfully initialize all fields via constructor and expose them via getters", () => {
            expect(initialPlayer.getSocketId()).toBe(mockSocketId);
            expect(initialPlayer.getBoard()).toBe(dummyBoard);
            expect(initialPlayer.getLastDownTime()).toBe(1000);
            expect(initialPlayer.getPoints()).toBe(0);
            expect(initialPlayer.getSpeed()).toBe(STARTING_SPEED);
            expect(initialPlayer.getName()).toBe(mockName);
        });

        it("should use fallback data from the original player instance when overrides parameter fields are omitted", () => {
            const clonedPlayer = Player.copy(initialPlayer);

            expect(clonedPlayer.getSocketId()).toBe(
                initialPlayer.getSocketId(),
            );
            expect(clonedPlayer.getBoard()).toBe(initialPlayer.getBoard());
            expect(clonedPlayer.getLastDownTime()).toBe(
                initialPlayer.getLastDownTime(),
            );
            expect(clonedPlayer.getPoints()).toBe(initialPlayer.getPoints());
            expect(clonedPlayer.getSpeed()).toBe(initialPlayer.getSpeed());
            expect(clonedPlayer.getName()).toBe(initialPlayer.getName());
        });

        it("should substitute completely new values when overrides object parameters are explicitly passed", () => {
            // FIX: Provided Object.values(PieceType) instead of an empty array []
            const alternateBoard = new Board(2, Object.values(PieceType));
            const customOverridePlayer = Player.copy(initialPlayer, {
                socketId: "new_socket",
                board: alternateBoard,
                lastDowntime: 5000,
                points: 999,
                speed: 400,
                name: "NewName",
            });

            expect(customOverridePlayer.getSocketId()).toBe("new_socket");
            expect(customOverridePlayer.getBoard()).toBe(alternateBoard);
            expect(customOverridePlayer.getLastDownTime()).toBe(5000);
            expect(customOverridePlayer.getPoints()).toBe(999);
            expect(customOverridePlayer.getSpeed()).toBe(400);
            expect(customOverridePlayer.getName()).toBe("NewName");
        });
    });

    describe("Player State Modifications", () => {
        it("should mark a player as dead by modifying its nested board structure", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(true);

            const deadPlayer = Player.killPlayer(initialPlayer);

            expect(deadPlayer.getBoard().getIsAlive()).toBe(false);
        });

        it("should immediately return the original player object when adding zero block lines", () => {
            const resultPlayer = Player.addBlockLines(0, initialPlayer);

            expect(resultPlayer).toBe(initialPlayer);
        });

        it("should pass line addition handling forward to the board when rows are greater than zero", () => {
            const addLinesSpy = vi
                .spyOn(Board, "addBlockLines")
                .mockReturnValue(dummyBoard);

            Player.addBlockLines(3, initialPlayer);

            expect(addLinesSpy).toHaveBeenCalledWith(3, dummyBoard);
        });
    });

    describe("Input Processing & Temporal Loops", () => {
        it("should refuse processing and return the player immediately if the board is dead", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(false);
            const inputSpy = vi.spyOn(Board, "handleGameInput");

            const outputPlayer = Player.handleInput(
                initialPlayer,
                GameInput.LEFT,
                2000,
            );

            expect(outputPlayer).toBe(initialPlayer);
            expect(inputSpy).not.toHaveBeenCalled();
        });

        it("should preserve original lastDowntime stamps when actions other than DOWN are supplied", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(true);
            vi.spyOn(Board, "handleGameInput").mockReturnValue({
                board: dummyBoard,
                seed: 1,
                bag: [],
            });

            const outputPlayer = Player.handleInput(
                initialPlayer,
                GameInput.LEFT,
                2500,
            );

            expect(outputPlayer.getLastDownTime()).toBe(1000);
        });

        it("should update lastDowntime stamps to the current loop run-time when a DOWN input is recorded", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(true);
            vi.spyOn(Board, "handleGameInput").mockReturnValue({
                board: dummyBoard,
                seed: 1,
                bag: [],
            });

            const outputPlayer = Player.handleInput(
                initialPlayer,
                GameInput.DOWN,
                3000,
            );

            expect(outputPlayer.getLastDownTime()).toBe(3000);
        });
    });

    describe("Scoring & Progressive Velocity Acceleration Formulas", () => {
        it("should calculate correct points accumulation metrics and adjust speed rates proportionally", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(true);

            const clearBoardMock = new Board(1, Object.values(PieceType));
            vi.spyOn(clearBoardMock, "getClearedLines").mockReturnValue(1);

            vi.spyOn(Board, "handleGameInput").mockReturnValue({
                board: clearBoardMock,
                seed: 1,
                bag: [],
            });

            const intermediatePlayer = Player.handleInput(
                initialPlayer,
                GameInput.SPACE,
                4000,
            );
            expect(intermediatePlayer.getPoints()).toBe(360);
            expect(intermediatePlayer.getSpeed()).toBe(1200);

            vi.spyOn(clearBoardMock, "getClearedLines").mockReturnValue(4);

            const advancedPlayer = Player.handleInput(
                intermediatePlayer,
                GameInput.SPACE,
                5000,
            );
            expect(advancedPlayer.getPoints()).toBe(2520);
            expect(advancedPlayer.getSpeed()).toBe(700);
        });

        it("should clamp player downward speed ticks to a mandatory minimum floor of 100ms", () => {
            vi.spyOn(dummyBoard, "getIsAlive").mockReturnValue(true);

            const highScoresPlayer = new Player(
                mockSocketId,
                dummyBoard,
                1000,
                10000,
                1200,
                mockName,
            );

            const clearBoardMock = new Board(1, Object.values(PieceType));
            vi.spyOn(clearBoardMock, "getClearedLines").mockReturnValue(1);

            vi.spyOn(Board, "handleGameInput").mockReturnValue({
                board: clearBoardMock,
                seed: 1,
                bag: [],
            });

            const ultraFastPlayer = Player.handleInput(
                highScoresPlayer,
                GameInput.SPACE,
                6000,
            );

            expect(ultraFastPlayer.getPoints()).toBeGreaterThan(6000);
            expect(ultraFastPlayer.getSpeed()).toBe(100);
        });
    });
});

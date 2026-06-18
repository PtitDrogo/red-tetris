import { describe, it, expect, beforeEach, vi } from "vitest";
import { Game } from "../game/Game.js";

describe("GameService Singleton", () => {
    let gameService: typeof import("../services/GameService.js").gameService;

    beforeEach(async () => {
        vi.resetModules();

        const module = await import("../services/GameService.js");
        gameService = module.gameService;
    });

    describe("findGame", () => {
        it("should return the game when a player's socket ID matches", () => {
            const mockPlayer = { getSocketId: () => "socket-123" };
            const mockGame = {
                getPlayers: () => [mockPlayer],
            } as unknown as Game;

            gameService.addGame(mockGame);

            expect(gameService.findGame("socket-123")).toBe(mockGame);
        });

        it("should return undefined if no players match the socket ID", () => {
            const mockPlayer = { getSocketId: () => "socket-456" };
            const mockGame = {
                getPlayers: () => [mockPlayer],
            } as unknown as Game;

            gameService.addGame(mockGame);

            expect(gameService.findGame("socket-123")).toBeUndefined();
        });

        it("should return undefined if the game has no players", () => {
            const mockGame = { getPlayers: () => [] } as unknown as Game;

            gameService.addGame(mockGame);

            expect(gameService.findGame("socket-123")).toBeUndefined();
        });
    });

    describe("addGame", () => {
        it("should successfully add a game to the service", () => {
            const mockPlayer = { getSocketId: () => "socket-789" };
            const mockGame = {
                getPlayers: () => [mockPlayer],
            } as unknown as Game;

            gameService.addGame(mockGame);

            expect(gameService.findGame("socket-789")).toBe(mockGame);
        });
    });

    describe("removeGame", () => {
        it("should remove the correct game from the service", () => {
            const mockPlayer = { getSocketId: () => "socket-999" };
            const mockGame = {
                getPlayers: () => [mockPlayer],
            } as unknown as Game;

            gameService.addGame(mockGame);
            gameService.removeGame(mockGame);

            expect(gameService.findGame("socket-999")).toBeUndefined();
        });

        it("should not affect other games when a different game is removed", () => {
            const mockPlayer1 = { getSocketId: () => "socket-aaa" };
            const mockGame1 = {
                getPlayers: () => [mockPlayer1],
            } as unknown as Game;

            const mockPlayer2 = { getSocketId: () => "socket-bbb" };
            const mockGame2 = {
                getPlayers: () => [mockPlayer2],
            } as unknown as Game;

            gameService.addGame(mockGame1);
            gameService.addGame(mockGame2);

            gameService.removeGame(mockGame2);

            expect(gameService.findGame("socket-bbb")).toBeUndefined();
            expect(gameService.findGame("socket-aaa")).toBe(mockGame1);
        });
    });
});

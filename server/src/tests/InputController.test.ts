import { describe, it, expect, vi, beforeEach } from "vitest";
import { SocketType } from "../types/types.js";
import { Game } from "../game/Game.js";
import { GameInput } from "../../../shared/types.js";

describe("InputController - handleInput", () => {
    // 1. Move both variables to the top scope so they are accessible in the tests
    let gameService: typeof import("../services/GameService.js").gameService;
    let InputController: typeof import("./../controllers/InputController.js").InputController;

    const mockSocket = { id: "player-123" } as SocketType;
    const validGameInput = GameInput.SPACE;

    beforeEach(async () => {
        vi.resetModules();
        vi.restoreAllMocks();

        const serviceModule = await import("../services/GameService.js");
        gameService = serviceModule.gameService;

        const controllerModule =
            await import("./../controllers/InputController.js");
        InputController = controllerModule.InputController;
    });

    it("should throw an error if the input is invalid", () => {
        expect(() => {
            InputController.handleInput(mockSocket, "invalid-string-input");
        }).toThrow("Given game input is not valid.");
    });

    it("should throw an error if the game cannot be found", () => {
        expect(() => {
            InputController.handleInput(mockSocket, validGameInput);
        }).toThrow("Could not find the game");
    });

    it("should successfully pass input to the game if validations pass", () => {
        const mockGame = {
            getPlayers: () => [{ getSocketId: () => "player-123" }],
            handleGameInput: vi.fn(),
        } as unknown as Game;

        gameService.addGame(mockGame);

        expect(() => {
            InputController.handleInput(mockSocket, validGameInput);
        }).not.toThrow();

        expect(mockGame.handleGameInput).toHaveBeenCalledWith(
            validGameInput,
            "player-123",
        );
    });
});

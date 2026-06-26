import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { Server } from "socket.io";
import { Game } from "../game/Game.js";
import { gameService } from "../services/GameService.js";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { GameInput, GameStatus, Room, PieceType } from "../../../shared/types.js";
import { Board } from "../game/Board.js";
import { Player } from "../game/Player.js";

vi.mock("../services/GameService.js", () => ({
    gameService: {
        addGame: vi.fn(),
        removeGame: vi.fn(),
    },
}));

vi.mock("../services/RoomManager.js", () => ({
    roomManager: {
        get: vi.fn(),
    },
}));

vi.mock("../services/UpdatesManager.js", () => ({
    UpdateManager: {
        gameUpdate: vi.fn(),
        updateGameOver: vi.fn(),
        updateLobby: vi.fn(),
        updateRoom: vi.fn(),
    },
}));

describe("Game Class", () => {
    let ioMock: Server;
    let mockRoom: Room;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        
        ioMock = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn(),
        } as unknown as Server;

        mockRoom = {
            id: "room1",
            players: [],
            gameInfo: { status: GameStatus.WAITING },
        };

        (roomManager.get as Mock).mockReturnValue(mockRoom);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const createPlayer = (id: string, name: string) => {
        const board = new Board(12345, [PieceType.I]);
        return new Player(id, board, Date.now(), 0, 1000, name);
    };

    describe("Initialization & Basics", () => {
        it("should create a game and add it to gameService", () => {
            const p1 = createPlayer("1", "P1");
            const game = Game.createGame([p1], ioMock, mockRoom);

            expect(game.getPlayers().length).toBe(1);
            expect(gameService.addGame).toHaveBeenCalledWith(game);
        });

        it("should throw an error if starting a game with 0 players", () => {
            const game = new Game([], ioMock, "room1");
            expect(() => game.start()).toThrow("Cannot start a game with no players");
        });

        it("should cleanly return if stopping a game that hasn't started loops", () => {
            const game = new Game([createPlayer("1", "P1")], ioMock, "room1");
            
            game.stopGame(); 
            expect(gameService.removeGame).not.toHaveBeenCalled();
        });
    });

    describe("Game Loop & Stopping", () => {
        it("should handle start, broadcast data, interval loops, and clean stop", () => {
            const p1 = createPlayer("1", "P1");
            const game = Game.createGame([p1], ioMock, mockRoom);

            game.start();
            expect(UpdateManager.gameUpdate).toHaveBeenCalled(); // Initial broadcast

            vi.advanceTimersByTime(100);
            expect(UpdateManager.gameUpdate).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(1000);
            expect(UpdateManager.gameUpdate).toHaveBeenCalledTimes(2);

            game.stopGame();
            expect(gameService.removeGame).toHaveBeenCalledWith(game);
            expect(mockRoom.gameInfo.status).toBe(GameStatus.WAITING);

            (gameService.removeGame as Mock).mockClear();
            game.stopGame();
            expect(gameService.removeGame).not.toHaveBeenCalled();
        });

        it("should log and handle room not found in stopGame", () => {
            const game = Game.createGame([createPlayer("1", "P1")], ioMock, mockRoom);
            game.start();

            (roomManager.get as Mock).mockReturnValue(undefined);
            const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

            game.stopGame();
            expect(consoleSpy).toHaveBeenCalledWith("Game somehow isnt in a room, cant find its way back to the lobby.");
            
            consoleSpy.mockRestore();
        });
    });

    describe("Player Input & Interactions", () => {
        it("should kill a player successfully", () => {
            const p1 = createPlayer("1", "P1");
            const game = new Game([p1], ioMock, "room1");
            
            game.killPlayer("1");
            
            const updatedPlayer = game.getPlayers()[0];
            expect(updatedPlayer.getBoard().getIsAlive()).toBe(false);
        });

        it("should handle game input and broadcast new state", () => {
            const game = new Game([createPlayer("1", "P1")], ioMock, "room1");
            const handleInputSpy = vi.spyOn(Player, "handleInput");

            game.handleGameInput(GameInput.LEFT, "1");

            expect(handleInputSpy).toHaveBeenCalled();
            expect(UpdateManager.gameUpdate).toHaveBeenCalled();
        });

        it("handleClearedLines: should add block lines to opponents when a player clears rows", () => {
            const p1 = createPlayer("1", "P1");
            const p2 = createPlayer("2", "P2");
            const game = new Game([p1, p2], ioMock, "room1");

            vi.spyOn(Player, "handleInput").mockImplementation((player) => {
                if (player.getSocketId() === "1") {
                    const boardWithClears = Board.copy(player.getBoard(), { clearedLines: 2 });
                    return Player.copy(player, { board: boardWithClears });
                }
                return player;
            });

            const addBlockLinesSpy = vi.spyOn(Player, "addBlockLines");

            game.handleGameInput(GameInput.LEFT, "1");

            expect(addBlockLinesSpy).toHaveBeenCalledWith(2, expect.objectContaining({ socketId: "2" }));
        });
    });

    describe("Meta Loop - Game Over Mechanics", () => {
        it("solo game: triggers Game Over when the only player dies", () => {
            const game = new Game([createPlayer("1", "P1")], ioMock, "room1");
            game.start();

            game.killPlayer("1");
            vi.advanceTimersByTime(1000); 

            expect(UpdateManager.updateGameOver).toHaveBeenCalled();
            expect(UpdateManager.updateLobby).toHaveBeenCalled();
            expect(UpdateManager.updateRoom).toHaveBeenCalledWith(mockRoom, ioMock);
        });

        it("solo game: gracefully handles a missing room during Game Over updates", () => {
            const game = new Game([createPlayer("1", "P1")], ioMock, "room1");
            game.start();
            game.killPlayer("1");

            (roomManager.get as Mock)
                .mockReturnValueOnce(mockRoom)
                .mockReturnValueOnce(undefined);

            vi.advanceTimersByTime(1000);

            expect(UpdateManager.updateGameOver).toHaveBeenCalled();
            expect(UpdateManager.updateRoom).not.toHaveBeenCalled(); 
        });

        it("solo game: does NOT trigger Game Over while player is alive", () => {
            const game = new Game([createPlayer("1", "P1")], ioMock, "room1");
            game.start();

            vi.advanceTimersByTime(1000);

            expect(UpdateManager.updateGameOver).not.toHaveBeenCalled();
        });

        it("multiplayer game: does NOT trigger Game Over if the remaining alive player has fewer points than the dead player", () => {
            const p1 = createPlayer("1", "P1"); 
            const p2 = Player.copy(createPlayer("2", "P2"), { points: 5000 }); 
            
            const game = new Game([p1, p2], ioMock, "room1");
            game.start();
            game.killPlayer("2"); 

            vi.advanceTimersByTime(1000);

            expect(UpdateManager.updateGameOver).not.toHaveBeenCalled();
        });

        it("multiplayer game: does NOT trigger Game Over when multiple players are alive", () => {
            const game = new Game([createPlayer("1", "P1"), createPlayer("2", "P2")], ioMock, "room1");
            game.start();

            vi.advanceTimersByTime(1000);

            expect(UpdateManager.updateGameOver).not.toHaveBeenCalled();
        });
    });
});
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { gameService } from "../services/GameService.js";
import { Game } from "../game/Game.js";
import { Player } from "../game/Player.js";
import { Board } from "../game/Board.js";
import { randomUUID, randomBytes } from "crypto";
import { NavigationController } from "../controllers/NavigationController.js"

vi.mock("../services/RoomManager.js", () => ({
    roomManager: {
        getRoomBySocketId: vi.fn(),
        deletePlayer: vi.fn(),
        create: vi.fn(),
        get: vi.fn(),
    },
}));

vi.mock("../services/UpdatesManager.js", () => ({
    UpdateManager: {
        updateRoomAndLobby: vi.fn(),
    },
}));

vi.mock("../services/GameService.js", () => ({
    gameService: {
        findGame: vi.fn(),
    },
}));

vi.mock("../game/Game.js", () => ({
    Game: {
        createGame: vi.fn(),
    },
}));

vi.mock("../game/Player.js", () => ({
    Player: vi.fn(),
    STARTING_SPEED: 1200,
}));

vi.mock("../game/Board.js", () => ({
    Board: vi.fn(),
}));

vi.mock("crypto", () => ({
    randomUUID: vi.fn(),
    randomBytes: vi.fn(),
}));

vi.mock("../../../shared/types.js", () => ({
    GameStatus: {
        WAITING: "Waiting",
        ONGOING: "Ongoing",
        OVER: "Over",
    },
    PieceType: {
        I: "I", J: "J", L: "L", O: "O", S: "S", T: "T", Z: "Z"
    },
    ServerMessage: {
        LEAVE_ROOM: "lr",
        JOIN_ROOM: "jr",
    },
}));

vi.mock("../../../shared/constants.js", () => ({
    MAX_ROOM_PLAYERS: 5,
}));

describe("NavigationController", () => {
    let mockSocket: any;
    let mockIo: any;
    let consoleLogSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        
        mockSocket = {
            id: "socket-123",
            leave: vi.fn(),
            emit: vi.fn(),
            join: vi.fn(),
        };
        mockIo = {
            to: vi.fn().mockReturnThis(),
            emit: vi.fn(),
        };
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe("leave", () => {
        it("should throw an error if the user is not found in any room", () => {
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);

            expect(() => NavigationController.leave(mockSocket, mockIo)).toThrow(
                "Didn't find the user in any Room, so he cant leave"
            );
        });

        it("should kill the player if a game is found and remove player from room", () => {
            const mockRoom = { id: "room-123" };
            const mockGame = { killPlayer: vi.fn() };
            const mockUpdatedRoom = { id: "room-123", players: [] };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);
            vi.mocked(gameService.findGame).mockReturnValue(mockGame as any);
            vi.mocked(roomManager.deletePlayer).mockReturnValue(mockUpdatedRoom as any);

            NavigationController.leave(mockSocket, mockIo);

            expect(gameService.findGame).toHaveBeenCalledWith(mockSocket.id);
            expect(mockGame.killPlayer).toHaveBeenCalledWith(mockSocket.id);
            expect(roomManager.deletePlayer).toHaveBeenCalledWith(mockSocket.id);
            expect(mockSocket.leave).toHaveBeenCalledWith(mockRoom.id);
            expect(mockSocket.emit).toHaveBeenCalledWith("lr");
            expect(UpdateManager.updateRoomAndLobby).toHaveBeenCalledWith(mockUpdatedRoom, mockIo);
        });

        it("should handle leaving cleanly when no game is active (covers optional chaining fallback)", () => {
            const mockRoom = { id: "room-123" };
            const mockUpdatedRoom = { id: "room-123", players: [] };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);
            vi.mocked(gameService.findGame).mockReturnValue(undefined);
            vi.mocked(roomManager.deletePlayer).mockReturnValue(mockUpdatedRoom as any);

            NavigationController.leave(mockSocket, mockIo);

            expect(gameService.findGame).toHaveBeenCalledWith(mockSocket.id);
            expect(roomManager.deletePlayer).toHaveBeenCalledWith(mockSocket.id);
            expect(mockSocket.leave).toHaveBeenCalledWith(mockRoom.id);
            expect(mockSocket.emit).toHaveBeenCalledWith("lr");
            expect(UpdateManager.updateRoomAndLobby).toHaveBeenCalledWith(mockUpdatedRoom, mockIo);
        });
    });

    describe("create", () => {
        it("should throw an error if the user is already in a room", () => {
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue({ id: "existing-room" } as any);

            expect(() => NavigationController.create(mockSocket, "Player1", mockIo)).toThrow(
                "User is already in a room"
            );
        });

        it("should create a room and join it successfully", () => {
            const mockRoomId = "new-room-uuid-test-test";
            const mockRoom = { id: mockRoomId, players: [] as any[] };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);
            vi.mocked(randomUUID).mockReturnValue(mockRoomId);
            vi.mocked(roomManager.create).mockReturnValue(mockRoom as any);
            vi.mocked(roomManager.get).mockReturnValue(mockRoom as any);

            NavigationController.create(mockSocket, "Player1", mockIo);

            expect(roomManager.create).toHaveBeenCalledWith(mockRoomId);
            expect(mockSocket.join).toHaveBeenCalledWith(mockRoomId);
            expect(mockSocket.emit).toHaveBeenCalledWith("jr", mockRoomId);
            expect(UpdateManager.updateRoomAndLobby).toHaveBeenCalledWith(mockRoom, mockIo);
        });
    });

    describe("join", () => {
        it("should throw an error if the user is already in a room", () => {
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue({ id: "existing-room" } as any);

            expect(() => NavigationController.join(mockSocket, "room-id", "Player1", mockIo)).toThrow(
                "User is already in a room"
            );
        });

        it("should throw an error if the room is not found", () => {
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);
            vi.mocked(roomManager.get).mockReturnValue(undefined);

            expect(() => NavigationController.join(mockSocket, "invalid-room", "Player1", mockIo)).toThrow(
                "Could not find the room user is trying to join."
            );
        });

        it("should throw an error if the room is full", () => {
            const mockRoom = {
                id: "full-room",
                players: new Array(5).fill({ name: "User", socketId: "other-socket" }),
            };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);
            vi.mocked(roomManager.get).mockReturnValue(mockRoom as any);

            expect(() => NavigationController.join(mockSocket, "full-room", "Player1", mockIo)).toThrow(
                "You cannot join this room, it's full."
            );
        });

        it("should join the room successfully if not full", () => {
            const mockRoom = {
                id: "joinable-room",
                players: [{ name: "Host", socketId: "host-socket" }],
            };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);
            vi.mocked(roomManager.get).mockReturnValue(mockRoom as any);

            NavigationController.join(mockSocket, "joinable-room", "Player2", mockIo);

            expect(mockRoom.players).toContainEqual({
                name: "Player2",
                socketId: mockSocket.id,
            });
            expect(mockSocket.join).toHaveBeenCalledWith("joinable-room");
            expect(mockSocket.emit).toHaveBeenCalledWith("jr", "joinable-room");
            expect(UpdateManager.updateRoomAndLobby).toHaveBeenCalledWith(mockRoom, mockIo);
        });
    });

    describe("start", () => {
        it("should throw an error if the room is not found", () => {
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(undefined);

            expect(() => NavigationController.start(mockSocket, mockIo)).toThrow(
                "Could not find the room user is trying to start the game in."
            );
        });

        it("should throw an error if the room has no players (covers host validation falsy check)", () => {
            const mockRoom = {
                id: "empty-room",
                players: [],
                gameInfo: { status: "Waiting" },
            };
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);

            expect(() => NavigationController.start(mockSocket, mockIo)).toThrow(
                "Can't start game, player isnt host of his room"
            );
        });

        it("should throw an error if the requesting player is not the host", () => {
            const mockRoom = {
                id: "room-123",
                players: [{ name: "Host", socketId: "host-socket" }],
                gameInfo: { status: "Waiting" },
            };
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);

            expect(() => NavigationController.start(mockSocket, mockIo)).toThrow(
                "Can't start game, player isnt host of his room"
            );
        });

        it("should throw an error if the game has already started", () => {
            const mockRoom = {
                id: "room-123",
                players: [{ name: "Host", socketId: mockSocket.id }],
                gameInfo: { status: "Ongoing" },
            };
            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);

            expect(() => NavigationController.start(mockSocket, mockIo)).toThrow(
                "This game already started"
            );
        });

        it("should initialize players, create and start the game successfully", () => {
            const mockRoom = {
                id: "room-123",
                players: [
                    { name: "Host", socketId: mockSocket.id },
                    { name: "Player2", socketId: "socket-456" },
                ],
                gameInfo: { status: "Waiting" },
            };

            const mockBuffer = {
                readUInt32BE: vi.fn().mockReturnValue(987654),
            };

            const mockGameInstance = {
                start: vi.fn(),
            };

            vi.mocked(roomManager.getRoomBySocketId).mockReturnValue(mockRoom as any);
            vi.mocked(randomBytes).mockReturnValue(mockBuffer as any);
            vi.mocked(Game.createGame).mockReturnValue(mockGameInstance as any);

            NavigationController.start(mockSocket, mockIo);

            expect(mockRoom.gameInfo.status).toBe("Ongoing");
            expect(randomBytes).toHaveBeenCalledWith(4);
            expect(mockBuffer.readUInt32BE).toHaveBeenCalledWith(0);
            
            expect(Player).toHaveBeenCalledTimes(2);
            expect(Board).toHaveBeenCalledTimes(2);

            expect(Game.createGame).toHaveBeenCalledWith(expect.any(Array), mockIo, mockRoom);
            expect(UpdateManager.updateRoomAndLobby).toHaveBeenCalledWith(mockRoom, mockIo);
            expect(mockGameInstance.start).toHaveBeenCalled();
        });
    });
});
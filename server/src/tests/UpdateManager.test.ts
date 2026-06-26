import { describe, it, expect, vi, beforeEach } from "vitest";
import { ServerMessage, GameStatus, type Room, GameOverData } from "../../../shared/types.js";
import type { Server } from "socket.io";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";

describe("UpdateManager", () => {
    let mockEmit: any;
    let mockTo: any;
    let mockIo: Server;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();

        mockEmit = vi.fn();
        mockTo = vi.fn().mockImplementation(() => {
            return { emit: mockEmit };
        });

        mockIo = {
            emit: mockEmit,
            to: mockTo,
        } as unknown as Server;
    });

    describe("updateGameOver", () => {
        it("should emit GAME_OVER with ranking data to the specific room channel", () => {
            const dummyRoomId = "test-room-id";
            const dummyGameOverData: GameOverData = {
                ranking: [
                    { name: "Alice", points: 1200 },
                    { name: "Bob", points: 800 },
                ],
            };

            UpdateManager.updateGameOver(mockIo, dummyRoomId, dummyGameOverData);

            expect(mockTo).toHaveBeenCalledWith(dummyRoomId);
            expect(mockEmit).toHaveBeenCalledWith(
                ServerMessage.GAME_OVER,
                dummyGameOverData,
            );
        });
    });

    describe("gameUpdate", () => {
        it("should emit GAME_STATE with the live game state to the specific room channel", () => {
            const dummyRoomId = "test-room-id";
            const dummyGameUpdate = {
                players: [
                    {
                        name: "Alice",
                        score: 300,
                        isAlive: true,
                        board: [[0, 0], [1, 1]],
                    },
                ],
            };

            UpdateManager.gameUpdate(mockIo, dummyRoomId, dummyGameUpdate);

            expect(mockTo).toHaveBeenCalledWith(dummyRoomId);
            expect(mockEmit).toHaveBeenCalledWith(
                ServerMessage.GAME_STATE,
                dummyGameUpdate,
            );
        });
    });

    describe("updateRoom", () => {
        it("should emit ROOM_STATE to the specific room room channel", () => {
            const dummyRoom: Room = {
                id: "test-room",
                players: [],
                gameInfo: { status: GameStatus.WAITING },
            };

            UpdateManager.updateRoom(dummyRoom, mockIo);

            expect(mockTo).toHaveBeenCalledWith("test-room");
            expect(mockEmit).toHaveBeenCalledWith(
                ServerMessage.ROOM_STATE,
                dummyRoom,
            );
        });
    });

    describe("updateLobby", () => {
        it("should emit LOBBY_STATE globally with available rooms data", () => {
            const dummyLobbies = [{ id: "room-1", players: ["Alice"] }];

            const getAvailableRoomsSpy = vi
                .spyOn(roomManager, "getAvailableRooms")
                .mockReturnValue(dummyLobbies);

            UpdateManager.updateLobby(mockIo);

            expect(getAvailableRoomsSpy).toHaveBeenCalled();
            expect(mockEmit).toHaveBeenCalledWith(
                ServerMessage.LOBBY_STATE,
                dummyLobbies,
            );
        });
    });

    describe("updateRoomAndLobby", () => {
        it("should update lobby, but skip room update if room is null", () => {
            const spyLobby = vi
                .spyOn(UpdateManager, "updateLobby")
                .mockImplementation(() => {});
            const spyRoom = vi
                .spyOn(UpdateManager, "updateRoom")
                .mockImplementation(() => {});

            UpdateManager.updateRoomAndLobby(null, mockIo);

            expect(spyLobby).toHaveBeenCalledWith(mockIo);
            expect(spyRoom).not.toHaveBeenCalled();
        });

        it("should update both lobby and room if room is provided", () => {
            const dummyRoom: Room = {
                id: "test-room",
                players: [],
                gameInfo: { status: GameStatus.WAITING },
            };

            const spyLobby = vi
                .spyOn(UpdateManager, "updateLobby")
                .mockImplementation(() => {});
            const spyRoom = vi
                .spyOn(UpdateManager, "updateRoom")
                .mockImplementation(() => {});

            UpdateManager.updateRoomAndLobby(dummyRoom, mockIo);

            expect(spyLobby).toHaveBeenCalledWith(mockIo);
            expect(spyRoom).toHaveBeenCalledWith(dummyRoom, mockIo);
        });
    });
});

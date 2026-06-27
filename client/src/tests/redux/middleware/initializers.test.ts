import { describe, test, expect, vi, beforeEach } from "vitest";
import { initGame, initLobbies } from "../../../redux/middleware/initializers";
import { GameStatus, ServerMessage } from "../../../../../shared/types";

vi.mock("../../../socket", () => {
    const mockSocketInstance = {
        id: "my-socket-id",
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
    };
    return {
        socket: mockSocketInstance,
    };
});

import { socket as exportedMockSocket } from "../../../socket";
const mockSocket = exportedMockSocket as any;

describe("initializers", () => {
    const createMockStore = (playerName = "Alex") => ({
        dispatch: vi.fn(),
        getState: vi.fn(() => ({
            player: { name: playerName },
        })),
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("initGame", () => {
        test("devrait nettoyer les anciens écouteurs et configurer les nouveaux", () => {
            const store = createMockStore();
            initGame(store);

            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.ROOM_STATE,
            );
            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.GAME_STATE,
            );
            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.GAME_OVER,
            );

            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.ROOM_STATE,
                expect.any(Function),
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.GAME_STATE,
                expect.any(Function),
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.GAME_OVER,
                expect.any(Function),
            );
        });

        test("ROOM_STATE (initGame) : devrait dispatch les grilles si le statut est WAITING", () => {
            const store = createMockStore("Alex");
            initGame(store);

            const roomStateCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.ROOM_STATE,
            )[1];

            const mockPayload = {
                gameInfo: { status: GameStatus.WAITING },
                players: [
                    { name: "Bob", socketId: "socket-bob" },
                    { name: "Alex", socketId: "my-socket-id" },
                ],
            };

            roomStateCallback(mockPayload);

            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "game/setMyGrid" }),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "game/setGrids" }),
            );
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setOwner",
                payload: "socket-bob",
            });
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setStatus",
                payload: GameStatus.WAITING,
            });
        });

        test("ROOM_STATE (initGame) : ne doit pas réinitialiser les grilles si le jeu est déjà ONGOING", () => {
            const store = createMockStore("Alex");
            initGame(store);

            const roomStateCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.ROOM_STATE,
            )[1];

            const mockPayload = {
                gameInfo: { status: GameStatus.ONGOING },
                players: [{ name: "Bob", socketId: "socket-bob" }],
            };

            roomStateCallback(mockPayload);

            expect(store.dispatch).not.toHaveBeenCalledWith(
                expect.objectContaining({ type: "game/setMyGrid" }),
            );
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setOwner",
                payload: "socket-bob",
            });
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setStatus",
                payload: GameStatus.ONGOING,
            });
        });

        test("GAME_STATE : devrait synchroniser l'état global en temps réel", () => {
            const store = createMockStore();
            initGame(store);

            const gameStateCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.GAME_STATE,
            )[1];

            const mockPayload = {
                players: [
                    { id: "my-socket-id", name: "Alex", board: [] },
                    { id: "socket-bob", name: "Bob", board: [] },
                ],
            };

            gameStateCallback(mockPayload);

            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setMyGrid",
                payload: { id: "my-socket-id", name: "Alex", board: [] },
            });
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setGrids",
                payload: [{ id: "socket-bob", name: "Bob", board: [] }],
            });
        });

        test("GAME_OVER : devrait enregistrer le classement de fin de partie", () => {
            const store = createMockStore();
            initGame(store);

            const gameOverCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.GAME_OVER,
            )[1];
            const mockPayload = {
                level: 4,
                ranking: [{ name: "Alex", points: 1000 }],
            };

            gameOverCallback(mockPayload);

            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setGameOver",
                payload: mockPayload,
            });
        });
    });

    describe("initLobbies", () => {
        const mockNavigate = vi.fn();
        const mockAction = { payload: { navigate: mockNavigate } };

        test("devrait nettoyer les anciens écouteurs et lier la navigation de salon", () => {
            const store = createMockStore();
            initLobbies(store, mockAction);

            expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.ERROR);
            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.LOBBY_STATE,
            );
            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.JOIN_ROOM,
            );
            expect(mockSocket.off).toHaveBeenCalledWith(
                ServerMessage.ROOM_STATE,
            );

            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.ROOM_STATE,
                expect.any(Function),
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.JOIN_ROOM,
                expect.any(Function),
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.ERROR,
                expect.any(Function),
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                ServerMessage.LOBBY_STATE,
                expect.any(Function),
            );
        });

        test("ROOM_STATE (initLobbies) : devrait initialiser les salons d'attente", () => {
            const store = createMockStore("Alex");
            initLobbies(store, mockAction);

            const roomStateCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.ROOM_STATE,
            )[1];
            const mockPayload = {
                players: [
                    { name: "Charlie", socketId: "socket-charlie" },
                    { name: "Alex", socketId: "my-socket-id" },
                ],
            };

            roomStateCallback(mockPayload);

            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "game/setMyGrid" }),
            );
            expect(store.dispatch).toHaveBeenCalledWith(
                expect.objectContaining({ type: "game/setGrids" }),
            );
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "game/setOwner",
                payload: "socket-charlie",
            });
        });

        test("JOIN_ROOM : devrait rediriger vers la route de la partie", () => {
            const store = createMockStore("Alex");
            initLobbies(store, mockAction);

            const joinRoomCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.JOIN_ROOM,
            )[1];

            joinRoomCallback("room-xyz");

            expect(mockNavigate).toHaveBeenCalledWith("/room-xyz/Alex");
        });

        test("ERROR et LOBBY_STATE : devraient logguer et dispatch la liste des salons", () => {
            const store = createMockStore();
            const consoleSpy = vi
                .spyOn(console, "log")
                .mockImplementation(() => {});
            initLobbies(store, mockAction);

            const errorCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.ERROR,
            )[1];
            const lobbyCallback = mockSocket.on.mock.calls.find(
                (call: any) => call[0] === ServerMessage.LOBBY_STATE,
            )[1];

            errorCallback("Une erreur socket s'est produite");
            expect(consoleSpy).toHaveBeenCalledWith(
                "Une erreur socket s'est produite",
            );

            const mockLobbies = [{ id: "room-1", players: [] }];
            lobbyCallback(mockLobbies);
            expect(store.dispatch).toHaveBeenCalledWith({
                type: "lobbies/setLobbies",
                payload: mockLobbies,
            });

            consoleSpy.mockRestore();
        });
    });
});

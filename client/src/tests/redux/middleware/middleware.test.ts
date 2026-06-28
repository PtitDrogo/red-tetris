import { describe, test, expect, vi, beforeEach } from "vitest";
import socketMiddleware from "../../../redux/middleware/middleware";
import { ClientMessage, ServerMessage } from "../../../../../shared/types";

vi.mock("../../../socket", () => {
    const mockSocketInstance = {
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        connect: vi.fn(),
        disconnect: vi.fn(),
    };
    return {
        socket: mockSocketInstance,
    };
});

import { socket as exportedMockSocket } from "../../../socket";
const mockSocket = exportedMockSocket as any;

const mockInitLobbies = vi.fn();
const mockInitGame = vi.fn();
vi.mock("../../../redux/middleware/initializers", () => ({
    initLobbies: (store: any, action: any) => mockInitLobbies(store, action),
    initGame: (store: any) => mockInitGame(store),
}));

describe("socketMiddleware", () => {
    const createMockStore = () => {
        const store = {
            dispatch: vi.fn(),
            getState: vi.fn(() => ({
                player: { name: "Alex" },
                lobbies: { list: [] },
                game: {},
            })),
        };
        const next = vi.fn();
        const invoke = (action: any) =>
            socketMiddleware(store as any)(next)(action);
        return { store, next, invoke };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("devrait propager toutes les actions au middleware suivant (default case)", () => {
        const { next, invoke } = createMockStore();
        const action = { type: "UNKNOWN_ACTION", payload: {} };

        invoke(action);

        expect(next).toHaveBeenCalledWith(action);
    });

    test("case socket/emit : devrait émettre l'événement requis au serveur", () => {
        const { invoke } = createMockStore();
        const action = {
            type: "socket/emit",
            payload: { event: ClientMessage.CREATE_ROOM, data: "Alex" },
        };

        invoke(action);

        expect(mockSocket.emit).toHaveBeenCalledWith(
            ClientMessage.CREATE_ROOM,
            "Alex",
        );
    });

    test("case socket/cleanupLobby : devrait nettoyer les écouteurs de salons", () => {
        const { invoke } = createMockStore();
        invoke({ type: "socket/cleanupLobby" });

        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.ROOM_STATE);
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.ERROR);
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.LOBBY_STATE);
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.JOIN_ROOM);
    });

    test("case socket/initLobby : devrait déléguer à initLobbies", () => {
        const { store, invoke } = createMockStore();
        const action = { type: "socket/initLobby", payload: {} };

        invoke(action);

        expect(mockInitLobbies).toHaveBeenCalledWith(store, action);
    });

    test("case socket/initGame : devrait déléguer à initGame", () => {
        const { store, invoke } = createMockStore();
        invoke({ type: "socket/initGame" });

        expect(mockInitGame).toHaveBeenCalledWith(store);
    });

    test("case socket/cleanupGame : devrait nettoyer les écouteurs du jeu et émettre l'abandon", () => {
        const { invoke } = createMockStore();
        invoke({ type: "socket/cleanupGame" });

        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.ROOM_STATE);
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.GAME_STATE);
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.GAME_OVER);
        expect(mockSocket.emit).toHaveBeenCalledWith(ClientMessage.LEAVE_ROOM);
    });

    test("case socket/initHome : devrait déconnecter, nettoyer et enregistrer l'écouteur de liste", () => {
        const { store, invoke } = createMockStore();
        invoke({ type: "socket/initHome" });

        expect(mockSocket.disconnect).toHaveBeenCalled();
        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.LOBBY_STATE);
        expect(mockSocket.on).toHaveBeenCalledWith(
            ServerMessage.LOBBY_STATE,
            expect.any(Function),
        );

        const callback = mockSocket.on.mock.calls.find(
            (call: any) => call[0] === ServerMessage.LOBBY_STATE,
        )[1];
        const dummyPayload = [{ id: "room1", players: [] }];
        callback(dummyPayload);

        expect(store.dispatch).toHaveBeenCalledWith({
            type: "lobbies/setLobbies",
            payload: dummyPayload,
        });
    });

    test("case socket/connectPlayer : devrait s'abonner aux événements d'état de connexion et appeler connect", () => {
        const { store, invoke } = createMockStore();
        const mockNavigate = vi.fn();
        invoke({
            type: "socket/connectPlayer",
            payload: { navigate: mockNavigate },
        });

        expect(mockSocket.off).toHaveBeenCalledWith("connect");
        expect(mockSocket.on).toHaveBeenCalledWith(
            "connect",
            expect.any(Function),
        );
        expect(mockSocket.connect).toHaveBeenCalled();
        expect(mockSocket.off).toHaveBeenCalledWith("disconnect");
        expect(mockSocket.on).toHaveBeenCalledWith(
            "disconnect",
            expect.any(Function),
        );

        const connectCallback = mockSocket.on.mock.calls.find(
            (call: any) => call[0] === "connect",
        )[1];
        connectCallback();
        expect(mockNavigate).toHaveBeenCalledWith("/lobbylist");

        const disconnectCallback = mockSocket.on.mock.calls.find(
            (call: any) => call[0] === "disconnect",
        )[1];
        disconnectCallback();
        expect(store.dispatch).toHaveBeenCalledWith({
            type: "player/setPlayerName",
            payload: "",
        });
    });

    test("case socket/cleanupHome : devrait nettoyer l'écouteur de salon et de connexion", () => {
        const { invoke } = createMockStore();
        invoke({ type: "socket/cleanupHome" });

        expect(mockSocket.off).toHaveBeenCalledWith(ServerMessage.LOBBY_STATE);
        expect(mockSocket.off).toHaveBeenCalledWith("connect");
    });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Server } from "socket.io";
import { NavigationController } from "../controllers/NavigationController.js";
import { InputController } from "../controllers/InputController.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { ClientMessage, ServerMessage } from "../../../shared/types.js";
import { SocketRouter } from "../routers/SocketRouter.js";

// Mock out the Controller handlers and Managers to isolate SocketRouter
vi.mock("../controllers/NavigationController.js", () => ({
    NavigationController: {
        leave: vi.fn(),
        create: vi.fn(),
        join: vi.fn(),
        start: vi.fn(),
    },
}));

vi.mock("../controllers/InputController.js", () => ({
    InputController: {
        handleInput: vi.fn(),
    },
}));

vi.mock("../services/UpdatesManager.js", () => ({
    UpdateManager: {
        updateLobby: vi.fn(),
    },
}));

describe("SocketRouter", () => {
    let mockIo: any;
    let mockSocket: any;
    let registeredEvents: Record<string, Function>;
    let consoleLogSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        registeredEvents = {};

        mockSocket = {
            id: "socket-xyz-789",
            on: vi.fn((event: string, callback: Function) => {
                registeredEvents[event] = callback;
            }),
            emit: vi.fn(),
        };

        mockIo = {
            on: vi.fn((event: string, callback: Function) => {
                if (event === "connection") {
                    callback(mockSocket);
                }
            }),
        };
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it("should handle initialization, log user connection, and update the lobby", () => {
        const router = new SocketRouter(mockIo as unknown as Server);
        router.init();

        expect(mockIo.on).toHaveBeenCalledWith(
            "connection",
            expect.any(Function),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "user connected:",
            mockSocket.id,
        );
        expect(UpdateManager.updateLobby).toHaveBeenCalledWith(mockIo);

        expect(mockSocket.on).toHaveBeenCalledWith(
            "disconnect",
            expect.any(Function),
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
            ClientMessage.CREATE_ROOM,
            expect.any(Function),
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
            ClientMessage.JOIN_ROOM,
            expect.any(Function),
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
            ClientMessage.LEAVE_ROOM,
            expect.any(Function),
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
            ClientMessage.START_GAME,
            expect.any(Function),
        );
        expect(mockSocket.on).toHaveBeenCalledWith(
            ClientMessage.PLAYER_INPUT,
            expect.any(Function),
        );
    });

    describe("Event Handlers Execution Paths", () => {
        beforeEach(() => {
            const router = new SocketRouter(mockIo as unknown as Server);
            router.init();
        });

        describe("disconnect event", () => {
            it("should invoke NavigationController.leave on disconnect successfully", () => {
                registeredEvents["disconnect"]();
                expect(consoleLogSpy).toHaveBeenCalledWith(
                    "user disconnected:",
                    mockSocket.id,
                );
                expect(NavigationController.leave).toHaveBeenCalledWith(
                    mockSocket,
                    mockIo,
                );
            });

            it("should catch errors thrown during disconnect and emit error string back to client", () => {
                vi.mocked(NavigationController.leave).mockImplementation(() => {
                    throw new Error("Failed to disconnect cleanup room");
                });

                registeredEvents["disconnect"]();
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "Failed to disconnect cleanup room",
                );
            });

            it("should catch non-Error objects and stringify them in getErrorMessage fallback", () => {
                vi.mocked(NavigationController.leave).mockImplementation(() => {
                    throw "Primitive string error thrown";
                });

                registeredEvents["disconnect"]();
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "Primitive string error thrown",
                );
            });
        });

        describe("CREATE_ROOM event", () => {
            it("should invoke NavigationController.create successfully", () => {
                registeredEvents[ClientMessage.CREATE_ROOM]("Alice");
                expect(NavigationController.create).toHaveBeenCalledWith(
                    mockSocket,
                    "Alice",
                    mockIo,
                );
            });

            it("should catch errors thrown during create room and emit error message to client", () => {
                vi.mocked(NavigationController.create).mockImplementation(
                    () => {
                        throw new Error("User is already in a room");
                    },
                );

                registeredEvents[ClientMessage.CREATE_ROOM]("Alice");
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "User is already in a room",
                );
            });
        });

        describe("JOIN_ROOM event", () => {
            it("should invoke NavigationController.join successfully", () => {
                const payload = { roomID: "room-abc", playerName: "Bob" };
                registeredEvents[ClientMessage.JOIN_ROOM](payload);

                expect(consoleLogSpy).toHaveBeenCalledWith(
                    "Player try : ",
                    "room-abc",
                );
                expect(NavigationController.join).toHaveBeenCalledWith(
                    mockSocket,
                    "room-abc",
                    "Bob",
                    mockIo,
                );
            });

            it("should catch errors thrown during join room and emit error message to client", () => {
                vi.mocked(NavigationController.join).mockImplementation(() => {
                    throw new Error("You cannot join this room, it's full.");
                });

                const payload = { roomID: "room-abc", playerName: "Bob" };
                registeredEvents[ClientMessage.JOIN_ROOM](payload);

                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "You cannot join this room, it's full.",
                );
            });
        });

        describe("LEAVE_ROOM event", () => {
            it("should invoke NavigationController.leave successfully", () => {
                registeredEvents[ClientMessage.LEAVE_ROOM]();
                expect(NavigationController.leave).toHaveBeenCalledWith(
                    mockSocket,
                    mockIo,
                );
            });

            it("should catch errors thrown during leave room and emit error message to client", () => {
                vi.mocked(NavigationController.leave).mockImplementation(() => {
                    throw new Error("Didn't find the user in any Room");
                });

                registeredEvents[ClientMessage.LEAVE_ROOM]();
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "Didn't find the user in any Room",
                );
            });
        });

        describe("START_GAME event", () => {
            it("should invoke NavigationController.start successfully", () => {
                registeredEvents[ClientMessage.START_GAME]();
                expect(NavigationController.start).toHaveBeenCalledWith(
                    mockSocket,
                    mockIo,
                );
            });

            it("should catch errors thrown during start game and emit error message to client", () => {
                vi.mocked(NavigationController.start).mockImplementation(() => {
                    throw new Error("Can't start game, player isnt host");
                });

                registeredEvents[ClientMessage.START_GAME]();
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "Can't start game, player isnt host",
                );
            });
        });

        describe("PLAYER_INPUT event", () => {
            it("should invoke InputController.handleInput successfully", () => {
                const mockInput = 2;
                registeredEvents[ClientMessage.PLAYER_INPUT](mockInput);

                expect(InputController.handleInput).toHaveBeenCalledWith(
                    mockSocket,
                    mockInput,
                );
            });

            it("should catch errors thrown during player input and emit error message to client", () => {
                vi.mocked(InputController.handleInput).mockImplementation(
                    () => {
                        throw new Error("Given game input is not valid.");
                    },
                );

                registeredEvents[ClientMessage.PLAYER_INPUT](
                    "invalid_input_type",
                );
                expect(mockSocket.emit).toHaveBeenCalledWith(
                    ServerMessage.ERROR,
                    "Given game input is not valid.",
                );
            });
        });
    });
});

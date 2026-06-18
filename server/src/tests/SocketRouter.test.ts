import { createServer } from "http";
import { AddressInfo } from "net";
import { Server } from "socket.io";
import { io as ClientIO, type Socket as ClientSocket } from "socket.io-client";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { ClientMessage, ServerMessage } from "../../../shared/types.js";
import { InputController } from "../controllers/InputController.js";
import { NavigationController } from "../controllers/NavigationController.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { SocketRouter } from "../routers/SocketRouter.js";

// 1. Mock the heavy controllers
vi.mock("../controllers/NavigationController.js", () => ({
    NavigationController: {
        create: vi.fn(),
        join: vi.fn(),
        leave: vi.fn(),
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
    let ioServer: Server;
    let clientSocket: ClientSocket;
    let port: number;

    beforeEach(() => {
        return new Promise<void>((resolve) => {
            // 2. Set up an in-memory HTTP and Socket.IO server
            const httpServer = createServer();
            ioServer = new Server(httpServer);

            // Initialize your router
            const router = new SocketRouter(ioServer);
            router.init();

            httpServer.listen(() => {
                port = (httpServer.address() as AddressInfo).port;

                // 3. Connect a real client instance to our local test server
                clientSocket = ClientIO(`http://localhost:${port}`);
                clientSocket.on("connect", () => resolve());
            });
        });
    });

    afterEach(() => {
        // 4. Clean up connections and reset mocks
        ioServer.close();
        clientSocket.close();
        vi.clearAllMocks();
    });

    // --- THE TESTS ---

    it("should trigger UpdateManager.updateLobby on connection", () => {
        expect(UpdateManager.updateLobby).toHaveBeenCalledWith(ioServer);
    });

    it("should route CREATE_ROOM to NavigationController.create", () => {
        const playerName = "Sora";

        clientSocket.emit(ClientMessage.CREATE_ROOM, playerName);

        // Use vi.waitFor because socket events are asynchronous
        vi.waitFor(() => {
            expect(NavigationController.create).toHaveBeenCalledWith(
                expect.any(Object), // The server-side socket instance
                playerName,
                ioServer,
            );
        });
    });

    it("should route JOIN_ROOM to NavigationController.join with correct payload", () => {
        const payload = { roomID: "room-123", playerName: "Riku" };

        clientSocket.emit(ClientMessage.JOIN_ROOM, payload);

        vi.waitFor(() => {
            expect(NavigationController.join).toHaveBeenCalledWith(
                expect.any(Object),
                payload.roomID,
                payload.playerName,
                ioServer,
            );
        });
    });

    it("should handle errors gracefully and emit an ERROR message back to client", () => {
        // Force the controller to throw an error when called
        vi.mocked(NavigationController.start).mockImplementationOnce(() => {
            throw new Error("Failed to start game");
        });

        return new Promise<void>((resolve) => {
            // Listen for the error back on the client side
            clientSocket.on(ServerMessage.ERROR, (errorMessage) => {
                expect(errorMessage).toBe("Failed to start game");
                resolve();
            });

            // Trigger the event that causes the error
            clientSocket.emit(ClientMessage.START_GAME);
        });
    });
});

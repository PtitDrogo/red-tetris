import { Server } from "socket.io";
import { ClientMessage, ServerMessage } from "../../../shared/types.js";
import { getErrorMessage } from "../../../shared/utils.js";
import { InputController } from "../controllers/InputController.js";
import { NavigationController } from "../controllers/NavigationController.js";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";

export class SocketRouter {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    init() {
        this.io.on("connection", (socket) => {
            console.log("user connected:", socket.id);
            UpdateManager.updateLobby(this.io);
            
            socket.on("disconnect", () => {
                console.log("user disconnected:", socket.id);
                try {
                    NavigationController.leave(socket, this.io);
                } catch (error) {
                    socket.emit(ServerMessage.ERROR, getErrorMessage(error));
                }
            });

            socket.on(ClientMessage.CREATE_ROOM, (playerName: string) => {
                try {
                    NavigationController.create(socket, playerName, this.io);
                } catch (error) {
                    socket.emit(ServerMessage.ERROR, getErrorMessage(error));
                }
            });

            socket.on(
                ClientMessage.JOIN_ROOM,
                (payload: { roomID: string; playerName: string }) => {
                    try {
                        console.log("Player try : ", payload.roomID);
                        NavigationController.join(
                            socket,
                            payload.roomID,
                            payload.playerName,
                            this.io,
                        );
                    } catch (error) {
                        socket.emit(
                            ServerMessage.ERROR,
                            getErrorMessage(error),
                        );
                    }
                },
            );

            socket.on(ClientMessage.LEAVE_ROOM, () => {
                try {
                    NavigationController.leave(socket, this.io);
                } catch (error) {
                    socket.emit(ServerMessage.ERROR, getErrorMessage(error));
                }
            });

            socket.on(ClientMessage.START_GAME, () => {
                NavigationController.start(socket, this.io);
            });

            socket.on(ClientMessage.PLAYER_INPUT, (input) => {
                try {
                    InputController.handleInput(socket, input);
                } catch (error) {
                    socket.emit(ServerMessage.ERROR, getErrorMessage(error));
                }
            });
        });
    }
}

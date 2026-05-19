import { Server } from "socket.io";
import { ClientMessage, ServerMessage } from "../../../shared/types";
import { getErrorMessage } from "../../../shared/utils";
import { NavigationController } from "../controllers/NavigationController";
import { roomManager } from "../services/RoomManager";
import { InputController } from "../controllers/InputController";

export class SocketRouter {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    init() {
        this.io.on("connection", (socket) => {
            console.log("user connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("user disconnected:", socket.id);
                try {
                    roomManager.deletePlayer(socket.id);
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
                (roomID: string, playerName: string) => {
                    try {
                        NavigationController.join(
                            socket,
                            roomID,
                            playerName,
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
                console.log(`User is trying to do the input ${input}`);
                try {
                    
                    InputController.handleInput(socket, input);
                } catch (error) {
                    socket.emit(ServerMessage.ERROR, getErrorMessage(error));
                }
            });
        });
    }
}

import { Server } from "socket.io";
import { ClientMessage, Room, ServerMessage } from "../../../shared/types";
import { roomManager } from "../services/RoomManager";
import { NavigationController } from "../controllers/NavigationController";

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
                    console.log("Could not leave the game.");
                }
            });

            socket.on(ClientMessage.CREATE_ROOM, (playerName: string) => {
                const room = NavigationController.create(socket.id, playerName);
                this.updateRoomAndLobby(room);
            });

            socket.on(
                ClientMessage.JOIN_ROOM,
                (roomID: string, playerName: string) => {
                    const room = NavigationController.join(
                        socket.id,
                        roomID,
                        playerName,
                    );
                    socket.join(roomID);
                    this.updateRoomAndLobby(room);
                },
            );

            socket.on(ClientMessage.LEAVE_ROOM, () => {
                try {
                    const room = NavigationController.leave(socket.id);
                    this.updateRoomAndLobby(room);
                } catch (error) {
                    console.log(`Could not leave the game`);
                }
            });

            socket.on(ClientMessage.START_GAME, () => {
                const room = NavigationController.start(socket.id);
                this.updateRoomAndLobby(room);
            });

            socket.on(ClientMessage.PLAYER_INPUT, (input) => {
                console.log(`User is trying to do the input ${input}`);
            });
        });
    }

    private updateRoom(room: Room) {
        this.io.to(room.id).emit(ServerMessage.ROOM_STATE, room);
    }

    private updateLobby() {
        this.io.emit(
            ServerMessage.LOBBY_STATE,
            roomManager.getAvailableRooms(),
        );
    }

    private updateRoomAndLobby(room: Room | null) {
        this.updateLobby();
        if (!room) return;
        this.updateRoom(room);
    }
}

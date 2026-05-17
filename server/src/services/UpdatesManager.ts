import { Server } from "socket.io";
import { Room, ServerMessage } from "../../../shared/types";
import { roomManager } from "./RoomManager";

export class UpdateManager {
    static updateRoom(room: Room, io: Server) {
        io.to(room.id).emit(ServerMessage.ROOM_STATE, room);
    }

    static updateLobby(io: Server) {
        io.emit(ServerMessage.LOBBY_STATE, roomManager.getAvailableRooms());
    }

    static updateRoomAndLobby(room: Room | null, io: Server) {
        this.updateLobby(io);
        if (!room) return;
        this.updateRoom(room, io);
    }
}

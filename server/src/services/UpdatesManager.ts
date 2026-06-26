import { Server } from "socket.io";
import { GameOverData, Room, ServerMessage } from "../../../shared/types.js";
import { roomManager } from "./RoomManager.js";

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

    static updateGameOver(io: Server, roomId: string, playersData: GameOverData) {
        io.to(roomId).emit(ServerMessage.GAME_OVER, playersData);
    }
    
    static gameUpdate(io: Server, roomId: string, gameUpdate: any) {
        io.to(roomId).emit(ServerMessage.GAME_STATE, gameUpdate);
    }
}

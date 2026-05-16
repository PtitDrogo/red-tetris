import { GameStatus, Room } from "../../../shared/types";

class RoomManager {
    private rooms: Map<string, Room> = new Map();

    create(roomId: string) {
        const newRoom: Room = {
            id: roomId,
            players: [],
            game: {
                status: GameStatus.WAITING,
            },
        };
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }

    get(roomId: string) {
        return this.rooms.get(roomId);
    }

    delete(roomId: string) {
        this.rooms.delete(roomId);
    }

    deletePlayer(socketId: string) {
        const room = this.getRoomBySocketId(socketId);
        if (!room) {
            throw new Error(
                "Didn't find the user in any Room, so he cant leave",
            );
        }

        const updatedPlayers = room.players.filter(
            (player) => player.socketId !== socketId,
        );
        if (updatedPlayers.length === 0) {
            this.delete(room.id);
            return null;
        }

        room.players = updatedPlayers;
        return room;
    }

    getRoomBySocketId(socketId: string) {
        const playerRoom = this.list().find((room) =>
            room.players.some((player) => player.socketId === socketId),
        );
        return playerRoom;
    }

    list() {
        return [...this.rooms.values()];
    }

    getAvailableRooms() {
        const allRooms = this.list();
        return allRooms.filter(
            (room) => room.game.status === GameStatus.WAITING,
        );
    }
}

export const roomManager = new RoomManager();

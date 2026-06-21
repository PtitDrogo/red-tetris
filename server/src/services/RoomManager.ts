import {
    GameStatus,
    type Room,
    type LobbyState,
} from "../../../shared/types.js";

export class RoomManager {
    private rooms: Map<string, Room> = new Map();

    create(roomId: string) {
        if (this.rooms.has(roomId)) {
            throw new Error(`Room "${roomId}" already exists`);
        }
        const newRoom: Room = {
            id: roomId,
            players: [],
            gameInfo: {
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
        const playerRoom = this.getAllRooms().find((room) =>
            room.players.some((player) => player.socketId === socketId),
        );
        return playerRoom;
    }

    getAllRooms() {
        return [...this.rooms.values()];
    }

    //This function is notoriously not typed, so far its only used to send infos to the frontend.
    //I need to check this with garivo because Im a bit confused where we stand right now on what we send.
    //to me this is just for Rooms/lobbies and player creating/joining/leaving thems
    getAvailableRooms() {
        const allWaitingRooms = this.getAllRooms().filter(
            (room) => room.gameInfo.status === GameStatus.WAITING,
        );
        const LobbiesState = allWaitingRooms.map((room) => ({
            id: room.id,
            players: room.players.map((player) => player.name),
        }));
        return LobbiesState;
    }
}

export const roomManager = new RoomManager();

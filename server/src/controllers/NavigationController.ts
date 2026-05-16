import { GameStatus } from "../../../shared/types";
import { roomManager } from "../services/RoomManager";

export class NavigationController {
    static leave(socketId: string) {
        const room = roomManager.get(socketId);
        if (!room) {
            throw new Error(
                "Didn't find the user in any Room, so he cant leave",
            );
        }
        const updatedRoom = roomManager.deletePlayer(socketId);
        return updatedRoom;
    }

    static create(socketID: string, playerName: string) {
        const roomID = "IAmAGameID" + Date.now(); //lazy way of generating an ID. Ideally I would like a word ! Then a timestamp maybe.
        const room = roomManager.create(roomID);
        this.join(socketID, roomID, playerName);
        return room;
    }

    static join(socketID: string, roomID: string, playerName: string) {
        const room = roomManager.get(roomID);
        if (!room) {
            throw new Error("Could not find the room user is trying to join.");
        }
        room.players.push({
            name: playerName,
            socketId: socketID,
        });
        return room
    }

    static start(socketID: string) {
        const room = roomManager.getRoomBySocketId(socketID);
        if (!room) {
            throw new Error(
                "Could not find the room user is trying to start the game in.",
            );
        }
        const isSocketHost =
            room.players.length && room.players[0].socketId === socketID;

        if (!isSocketHost) {
            throw new Error("Can't start game, player isnt host of his room");
        }

        room.game.status = GameStatus.ONGOING;
        //Add rest of Starting game procedure.
        return room;
    }
}

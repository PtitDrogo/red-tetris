import { Server } from "socket.io";
import { GameStatus, Room } from "../../../shared/types";
import { roomManager } from "../services/RoomManager";
import { UpdateManager } from "../services/UpdatesManager";
import { SocketType } from "../types/types";
import { gameService } from "../services/GameService";
import { Game } from "../game/Game";
import { Player } from "../game/Player";
import { Board } from "../game/Board";
import { PieceType } from "../game/Piece";

export class NavigationController {
    static leave(socket: SocketType, io: Server) {
        const room = roomManager.getRoomBySocketId(socket.id);
        if (!room) {
            throw new Error(
                "Didn't find the user in any Room, so he cant leave",
            );
        }
        const updatedRoom = roomManager.deletePlayer(socket.id);
        socket.leave(room.id);
        UpdateManager.updateRoomAndLobby(updatedRoom, io);
    }

    static create(socket: SocketType, playerName: string, io: Server) {
        if (roomManager.getRoomBySocketId(socket.id)) {
            throw new Error("User is already in a room");
        }

        const roomID = "IAmAGameID" + Date.now(); //lazy way of generating an ID. Ideally I would like a word ! Then a timestamp maybe.
        const room = roomManager.create(roomID);
        this.join(socket, roomID, playerName, io);

        console.log(`Created Room with roomId ${room.id}`);
    }

    static join(
        socket: SocketType,
        roomID: string,
        playerName: string,
        io: Server,
    ) {
        if (roomManager.getRoomBySocketId(socket.id)) {
            throw new Error("User is already in a room");
        }
        const room = roomManager.get(roomID);
        if (!room) {
            throw new Error("Could not find the room user is trying to join.");
        }
        room.players.push({
            name: playerName,
            socketId: socket.id,
        });

        socket.join(roomID);
        UpdateManager.updateRoomAndLobby(room, io);
    }

    static start(socket: SocketType, io: Server) {
        const room = roomManager.getRoomBySocketId(socket.id);
        if (!room) {
            throw new Error(
                "Could not find the room user is trying to start the game in.",
            );
        }
        const isSocketHost =
            room.players.length && room.players[0].socketId === socket.id;

        if (!isSocketHost) {
            throw new Error("Can't start game, player isnt host of his room");
        }
        if (room.game.status !== GameStatus.WAITING) {
            throw new Error("This game already started");
        }

        room.game.status = GameStatus.ONGOING;

        const seed = Math.random();
        const players = room.players.map((player) => {
            return new Player(
                player.socketId,
                new Board(seed, Object.values(PieceType)),
                0,
                0,
            );
        });
        const newGame = Game.createGame(players, io, room);

        UpdateManager.updateRoomAndLobby(room, io);
        newGame.start();
    }
}

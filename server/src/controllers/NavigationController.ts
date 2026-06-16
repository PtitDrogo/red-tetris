import { DefaultEventsMap, Server, Socket } from "socket.io";
import { GameStatus, ServerMessage } from "../../../shared/types.js";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { SocketType } from "../types/types.js";
import { gameService } from "../services/GameService.js";
import { Game } from "../game/Game.js";
import { Player, STARTING_SPEED } from "../game/Player.js";
import { Board } from "../game/Board.js";
import { PieceType } from "../game/Piece.js";

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
        socket.emit(ServerMessage.LEAVE_ROOM); //Je sais pas ce que c'est ca
        UpdateManager.updateRoomAndLobby(updatedRoom, io);
        //I need to look for if that guy was in a game and tell the game hes dead now.
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
        socket.emit(ServerMessage.JOIN_ROOM, roomID); //je sais pas ce que c'est ca
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
        if (room.gameInfo.status !== GameStatus.WAITING) {
            throw new Error("This game already started");
        }

        room.gameInfo.status = GameStatus.ONGOING;

        const seed = Math.random();
        const players = room.players.map((player) => {
            return new Player(
                player.socketId,
                new Board(seed, Object.values(PieceType)),
                0,
                0,
                STARTING_SPEED,
            );
        });
        const newGame = Game.createGame(players, io, room);

        UpdateManager.updateRoomAndLobby(room, io);
        newGame.start();
    }
}

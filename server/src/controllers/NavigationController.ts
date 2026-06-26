import { Server } from "socket.io";
import { GameStatus, PieceType, ServerMessage } from "../../../shared/types.js";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { SocketType } from "../types/types.js";
import { gameService } from "../services/GameService.js";
import { Game } from "../game/Game.js";
import { Player, STARTING_SPEED } from "../game/Player.js";
import { Board } from "../game/Board.js";
import { randomUUID, randomBytes } from "crypto";
import { MAX_ROOM_PLAYERS } from "../../../shared/constants.js";

export class NavigationController {
    static leave(socket: SocketType, io: Server) {
        const room = roomManager.getRoomBySocketId(socket.id);
        if (!room) {
            throw new Error(
                "Didn't find the user in any Room, so he cant leave",
            );
        }
        gameService.findGame(socket.id)?.killPlayer(socket.id);
        const updatedRoom = roomManager.deletePlayer(socket.id);
        socket.leave(room.id);
        socket.emit(ServerMessage.LEAVE_ROOM);
        UpdateManager.updateRoomAndLobby(updatedRoom, io);
    }

    static create(socket: SocketType, playerName: string, io: Server) {
        if (roomManager.getRoomBySocketId(socket.id)) {
            throw new Error("User is already in a room");
        }

        const roomID = randomUUID();
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

        if (room.players.length >= MAX_ROOM_PLAYERS) {
            throw new Error("You cannot join this room, it's full.");
        }

        room.players.push({
            name: playerName,
            socketId: socket.id,
        });
        socket.join(roomID);
        socket.emit(ServerMessage.JOIN_ROOM, roomID);
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

        const buffer = randomBytes(4);
        const seed = buffer.readUInt32BE(0);

        const players = room.players.map((player) => {
            return new Player(
                player.socketId,
                new Board(seed, Object.values(PieceType)),
                0,
                0,
                STARTING_SPEED,
                player.name,
            );
        });
        const newGame = Game.createGame(players, io, room);

        UpdateManager.updateRoomAndLobby(room, io);
        newGame.start();
    }
}

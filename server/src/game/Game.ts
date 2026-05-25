import seedrandom, { PRNG } from "seedrandom";
import {
    GameInput,
    GameState,
    Room,
    ServerMessage,
} from "../../../shared/types";
import { Player } from "./Player";
import { Server } from "socket.io";
import { clearInterval, clearTimeout } from "node:timers";
import { gameService } from "../services/GameService";

const UPDATE_DELAY_MS = 100;

export class Game {
    private players: Player[];
    private seed: PRNG;
    private io: Server;
    private roomId: string;
    private gameLoop: NodeJS.Timeout | undefined;

    constructor(players: Player[], seed: string, io: Server, roomId: string) {
        this.players = players;
        this.seed = seedrandom(seed);
        this.io = io;
        this.roomId = roomId;
    }

    getPlayers() {
        return this.players;
    }

    handleGameInput(newInput: GameInput, socketId: string) {
        this.players = this.players.map((player) =>
            player.getSocketId() === socketId
                ? Player.handleInput(player, newInput)
                : player,
        );

        console.log(
            "Handle game input now has players:",
            JSON.stringify(this.players, null, 2),
        );
    }

    static createGame(players: Player[], io: Server, room: Room) {
        const newGame = new Game(players, "RandomString", io, room.id);
        const gameManager = gameService.addGame(newGame);
        return newGame;
    }

    start() {
        //End goal, Sending updates to a bunch of sockets.
        //Presumabely with the same update method ->
        /*
            static updateRoom(room: Room, io: Server) {
                io.to(room.id).emit(ServerMessage.ROOM_STATE, room /data);
            }
        */
        //I technically only need the RoomId and the Server.

        this.gameLoop = setInterval(() => {
            const playersData = this.players.map((player) => {
                return {
                    name: "PlayerTest",
                    score: "ScoreTest",
                    board: player.getBoard().getFullGrid(),
                };
            });
            const gameUpdate: GameState = {
                players: playersData,
            };

            this.io.to(this.roomId).emit(ServerMessage.GAME_STATE, gameUpdate);
        }, UPDATE_DELAY_MS);
    }
}

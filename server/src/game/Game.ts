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
    private speed: number = 1200; //Make this dynamic later //This the time between each down press by the game Loop. big = easy, low = hard.
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

    getSpeed() {
        return this.speed;
    }

    private sendDataToPlayers() {
        const playersData = this.players.map((player) => {
            return {
                name: "PlayerTest",
                score: "ScoreTest",
                board: player.getBoard().getFullGrid(),
                isAlive: player.getBoard().getIsAlive(),
            };
        });
        const gameUpdate: GameState = {
            players: playersData,
        };
        this.io.to(this.roomId).emit(ServerMessage.GAME_STATE, gameUpdate);
    }

    handleGameInput(newInput: GameInput, socketId: string) {
        const currTime = Date.now();
        this.players = this.players.map((player) =>
            player.getSocketId() === socketId
                ? Player.handleInput(player, newInput, currTime)
                : player,
        );

        this.sendDataToPlayers();
    }

    static createGame(players: Player[], io: Server, room: Room) {
        const newGame = new Game(players, "RandomString", io, room.id);
        gameService.addGame(newGame);
        return newGame;
    }

    start() {
        if (this.players.length === 0) {
            throw new Error("Cannot start a game with no players");
        }

        this.sendDataToPlayers();

        //Put this in an INIT Function later if it gets too long
        this.players.forEach((player) => {
            const currTime = Date.now();
            player.setLastDownTime(currTime);
        });

        this.gameLoop = setInterval(() => {
            const currTime = Date.now();
            let didUpdate = false;

            this.players = this.players.map((player) => {
                if (currTime - player.getLastDownTime() > this.getSpeed()) {
                    didUpdate = true;
                    return Player.handleInput(player, GameInput.DOWN, currTime);
                }
                return player;
            });

            if (didUpdate) {
                console.log("Im updating !");
                this.sendDataToPlayers();
            }
        }, UPDATE_DELAY_MS);
    }
}

import {
    GameInput,
    GameState,
    Room,
    ServerMessage,
} from "../../../shared/types.js";
import { Player, SPEED_STEP, STARTING_SPEED } from "./Player.js";
import { Server } from "socket.io";
import { gameService } from "../services/GameService.js";

const UPDATE_DELAY_MS = 100;

export class Game {
    private players: Player[];
    private io: Server;
    private roomId: string;
    private gameLoop: NodeJS.Timeout | undefined;

    constructor(players: Player[], io: Server, roomId: string) {
        this.players = players;
        this.io = io;
        this.roomId = roomId;
    }

    getPlayers() {
        return this.players;
    }

    stopGame() {
        if (!this.gameLoop) return;
        clearInterval(this.gameLoop);
        this.gameLoop = undefined;
    }

    private sendDataToPlayers() {
        const playersData = this.players.map((player) => {
            return {
                name: "PlayerTest",
                score: player.getPoints(),
                board: player.getBoard().getFullGrid(),
                isAlive: player.getBoard().getIsAlive(),
                level: Math.floor(player.getPoints() / 500),
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
        const newGame = new Game(players, io, room.id);
        gameService.addGame(newGame);
        return newGame;
    }

    start() {
        if (this.players.length === 0) {
            throw new Error("Cannot start a game with no players");
        }

        this.sendDataToPlayers();

        this.players.forEach((player) => {
            const currTime = Date.now();
            player.setLastDownTime(currTime);
        });

        this.gameLoop = setInterval(() => {
            const currTime = Date.now();
            let didUpdate = false;

            this.players = this.players.map((player) => {
                if (currTime - player.getLastDownTime() > player.getSpeed()) {
                    didUpdate = true;
                    return Player.handleInput(player, GameInput.DOWN, currTime);
                }
                return player;
            });

            if (didUpdate) {
                this.players = Game.handleClearedLines(this.players);
                this.sendDataToPlayers();
            }
        }, UPDATE_DELAY_MS);
    }

    private static handleClearedLines(players: Player[]): Player[] {
        let to_add: number[] = Array(players.length).fill(0);

        players.forEach((player, index) => {
            const linesCleared = player.getBoard().getClearedLines();
            if (linesCleared) {
                to_add = to_add.map((n, i) => {
                    return i === index ? n : n + linesCleared;
                });
            }
        });

        const newPlayers: Player[] = players.map((p, i) =>
            Player.addBlockLines(to_add[i], p),
        );

        return newPlayers;
    }
}

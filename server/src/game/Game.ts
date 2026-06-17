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
const META_UPDATE_DELAY_MS = 1000;
export class Game {
    private players: Player[];
    private io: Server;
    private roomId: string;
    private gameLoop: NodeJS.Timeout | undefined;
    private metaLoop: NodeJS.Timeout | undefined;

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

        if (!this.metaLoop) return;
        clearInterval(this.metaLoop);
        this.metaLoop = undefined;

        gameService.removeGame(this);
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

    killPlayer(socketId: string) {
        this.players = this.players.map((p) =>
            p.getSocketId() === socketId ? Player.killPlayer(p) : p,
        );
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

        this.players = this.players.map((player) =>
            Player.copy(player, { lastDowntime: Date.now() }),
        );

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

        this.metaLoop = setInterval(() => {
            if (this.players.length === 1) {
                if (this.players[0].getBoard().getIsAlive() === false) {
                    this.io.to(this.roomId).emit(ServerMessage.GAME_OVER, {
                        winner: "Bravo tu as gagner tu es trop fort",
                    });
                    this.stopGame();
                }
                return; //Game just keeps going if he is alone.
            }

            const alivePlayers = this.players.filter((player) =>
                player.getBoard().getIsAlive(),
            );

            if (alivePlayers.length === 1) {
                //We send a message on a new subscriptions, GAME_OVER
                const winner = alivePlayers[0];
                this.io.to(this.roomId).emit(ServerMessage.GAME_OVER, {
                    winnerData: winner,
                });
                this.stopGame();
            }
        }, META_UPDATE_DELAY_MS);
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

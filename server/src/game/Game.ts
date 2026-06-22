import {
    GameInput,
    GameOverData,
    GameOverRanking,
    GameState,
    GameStatus,
    Room,
} from "../../../shared/types.js";
import { Player } from "./Player.js";
import { Server } from "socket.io";
import { gameService } from "../services/GameService.js";
import { roomManager, RoomManager } from "../services/RoomManager.js";
import { Board } from "./Board.js";
import { UpdateManager } from "../services/UpdatesManager.js";

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
        //Room le statut de redevenir waiting dans le room
        const room = roomManager.get(this.roomId);
        if (!room) {
            console.log(
                "Game somehow isnt in a room, cant find its way back to the lobby.",
            );
            return;
        }
        room.gameInfo.status = GameStatus.WAITING;
    }

    private sendDataToPlayers() {
        const playersData = this.players.map((player) => {
            return {
                name: player.getName(),
                score: player.getPoints(),
                board: player.getBoard().getFullGrid(),
                isAlive: player.getBoard().getIsAlive(),
                level: Math.floor(player.getPoints() / 500),
            };
        });
        const gameUpdate: GameState = {
            players: playersData,
        };
        UpdateManager.gameUpdate(this.io, this.roomId, gameUpdate);
    }

    handleGameInput(newInput: GameInput, socketId: string) {
        const currTime = Date.now();
        this.players = this.players.map((player) =>
            player.getSocketId() === socketId
                ? Player.handleInput(player, newInput, currTime)
                : player,
        );
        this.players = Game.handleClearedLines(this.players);
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
            let hasMovedDown = false;

            this.players = this.players.map((player) => {
                if (currTime - player.getLastDownTime() > player.getSpeed()) {
                    hasMovedDown = true;
                    return Player.handleInput(player, GameInput.DOWN, currTime);
                }
                return player;
            });

            if (hasMovedDown) {
                this.sendDataToPlayers();
            }
        }, UPDATE_DELAY_MS);

        this.metaLoop = setInterval(() => {
            if (this.players.length === 1) {
                if (this.players[0].getBoard().getIsAlive()) return;
                const playerDAta: GameOverData = {
                    ranking: [
                        {
                            name: this.players[0].getName(),
                            points: this.players[0].getPoints(),
                        },
                    ],
                };
                this.stopGame();
                UpdateManager.updateGameOver(this.io, this.roomId, playerDAta);
                UpdateManager.updateLobby(this.io);
                const updatedRoom = roomManager.get(this.roomId);
                if (!updatedRoom) return;
                UpdateManager.updateRoom(updatedRoom, this.io); 
                return;
            }

            const alivePlayers = this.players.filter((player) =>
                player.getBoard().getIsAlive(),
            );

            if (alivePlayers.length === 1) {
                //We send a message on a new subscriptions, GAME_OVER
                const winner = alivePlayers[0];
                const playersData: GameOverData = {
                    ranking: Game.getRanking(this.players),
                };

                this.stopGame();
                UpdateManager.updateGameOver(this.io, this.roomId, playersData);
                UpdateManager.updateLobby(this.io);
                const updatedRoom = roomManager.get(this.roomId);
                if (!updatedRoom) return;
                UpdateManager.updateRoom(updatedRoom, this.io);
            }
        }, META_UPDATE_DELAY_MS);
    }

    private static getRanking(players: Player[]): GameOverRanking[] {
        const ranking: GameOverRanking[] = players.map((p) => {
            return { name: p.getName(), points: p.getPoints() };
        });

        return ranking.sort((a, b) => b.points - a.points);
    }

    private static handleClearedLines(players: Player[]): Player[] {
        if (players.length === 1) {
            return players;
        }
        let to_add: number[] = Array(players.length).fill(0);

        players.forEach((player, index) => {
            const linesCleared = player.getBoard().getClearedLines();
            if (linesCleared) {
                to_add = to_add.map((n, i) => {
                    return i === index ? n : n + linesCleared;
                });
            }
        });

        if (to_add.every((n) => n === 0)) return players;

        const newPlayers: Player[] = players
            .map((p, i) => Player.addBlockLines(to_add[i], p))
            .map((p) => {
                return Player.copy(p, {
                    board: Board.copy(p.getBoard(), { clearedLines: 0 }),
                });
            });

        return newPlayers;
    }
}

import { Server } from "socket.io";
import {
    GameInput,
    GameOverData,
    GameOverRanking,
    GameState,
    GameStatus,
    Room,
} from "../../../shared/types.js";
import { gameService } from "../services/GameService.js";
import { roomManager } from "../services/RoomManager.js";
import { UpdateManager } from "../services/UpdatesManager.js";
import { Board } from "./Board.js";
import { Player } from "./Player.js";

const UPDATE_DELAY_MS = 100;
const META_UPDATE_DELAY_MS = 1000;
export class Game {
    private players: Player[];
    private io: Server;
    private roomId: string;
    private gameLoop: NodeJS.Timeout | undefined;
    private metaLoop: NodeJS.Timeout | undefined;
    private playWithBlessedPiece: boolean;

    constructor(
        players: Player[],
        io: Server,
        roomId: string,
        playWithBlessed: boolean,
    ) {
        this.players = players;
        this.io = io;
        this.roomId = roomId;
        this.playWithBlessedPiece = playWithBlessed;
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
                id: player.getSocketId(),
                score: player.getPoints(),
                board: player.getBoard().getFullGrid(),
                isAlive: player.getBoard().getIsAlive(),
                level: Math.floor(player.getPoints() / 500),
                nextPiece: player.getBoard().getNextPiece(),
                clearedLinesIndexes: player.getBoard().getClearedLinesIndexes(),
            };
        });
        const gameUpdate: GameState = {
            players: playersData,
            playWithBlessed: this.playWithBlessedPiece,
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
        this.players = Game.handleClearedLines(
            this.players,
            this.playWithBlessedPiece,
        );
        this.sendDataToPlayers();
    }

    killPlayer(socketId: string) {
        this.players = this.players.map((p) =>
            p.getSocketId() === socketId ? Player.killPlayer(p) : p,
        );
    }

    static createGame(
        players: Player[],
        io: Server,
        room: Room,
        playWithBlessed: boolean,
    ) {
        const newGame = new Game(players, io, room.id, playWithBlessed);
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
                            level: Math.floor(
                                this.players[0].getPoints() / 500,
                            ),
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
                const potentialWinnerPoints = alivePlayers[0].getPoints();
                const isWinner = this.players.every(
                    (p) =>
                        p === alivePlayers[0] ||
                        p.getPoints() < potentialWinnerPoints,
                );

                if (!isWinner) return;
                this.stopGameAndUpdate();
            }

            //Yes this can happen
            if (alivePlayers.length === 0) {
                this.stopGameAndUpdate();
            }
        }, META_UPDATE_DELAY_MS);
    }

    private stopGameAndUpdate() {
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

    private static getRanking(players: Player[]): GameOverRanking[] {
        const ranking: GameOverRanking[] = players.map((p) => {
            return {
                name: p.getName(),
                points: p.getPoints(),
                level: Math.floor(p.getPoints() / 500),
            };
        });

        return ranking.sort((a, b) => b.points - a.points);
    }

    private static addBlessedPiece(player: Player, playWithBlessed: boolean) {
        return playWithBlessed ? Player.AddBlessedPiece(player) : player;
    }

    private static handleClearedLines(
        players: Player[],
        playWithBlessed: boolean,
    ): Player[] {
        if (players.length === 1) {
            return playWithBlessed
                ? players.map((p) => Player.AddBlessedPiece(p))
                : players;
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
            .map((p) => Game.addBlessedPiece(p, playWithBlessed))
            .map((p) => {
                return Player.copy(p, {
                    board: Board.copy(p.getBoard(), {
                        clearedLines: 0,
                        clearedLinesIndexes: [],
                    }),
                });
            });

        return newPlayers;
    }
}

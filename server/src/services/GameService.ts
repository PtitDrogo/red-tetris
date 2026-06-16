import { Game } from "../game/Game.js";

class GameService {
    private games: Game[];

    constructor() {
        this.games = [];
    }

    findGame(socketid: string) {
        return this.games.find((game) =>
            game
                .getPlayers()
                .some((player) => player.getSocketId() === socketid),
        );
    }

    addGame(game: Game) {
        this.games.push(game);
    }

    removeGame(game: Game) {
        game.stopGame();
        this.games = this.games.filter((g) => g !== game);
    }
}

export const gameService = new GameService();

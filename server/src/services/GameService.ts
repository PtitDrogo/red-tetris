import { Game } from "../game/Game";

class GameService {
    private games: Game[];

    findGame(socketid: string) {
        return this.games.find((game) =>
            game
                .getPlayers()
                .some((player) => player.getSocketId() === socketid),
        );
    }
}

export const gameService = new GameService();

import { Board } from "./Board";
import { Player } from "./Player";

export class Game {
    private players: Player[];

    private gameInterval: NodeJS.Timeout | undefined;

    constructor(players: Player[]) {
        this.players = players;
    }

    spawnNewPiece() {}

    getPlayers() {
        return this.players;
    }
}

import seedrandom, { PRNG } from "seedrandom";
import { gameInput } from "../../../shared/types";
import { Player } from "./Player";

export class Game {
    private players: Player[];
    private seed: PRNG;
    // private gameInterval: NodeJS.Timeout | undefined;

    constructor(players: Player[], seed: string) {
        this.players = players;
        this.seed = seedrandom(seed);
    }

    getPlayers() {
        return this.players;
    }

    handleGameInput(newInput: gameInput, socketId: string) {
        this.players = this.players.map((player) =>
            player.getSocketId() === socketId
                ? Player.handleInput(player, newInput)
                : player,
        );
    }

    //So now I just need to run a Loo
}

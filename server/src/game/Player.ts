import { GameInput } from "../../../shared/types";
import { Board } from "./Board";

export class Player {
    private socketId: string;
    private board: Board;
    private isDead: boolean;
    //Lots more data later here.

    constructor(isDead: boolean, socketId: string, board: Board) {
        this.isDead = isDead;
        this.socketId = socketId;
        this.board = board;
    }

    getSocketId() {
        return this.socketId;
    }

    getBoard() {
        return this.board;
    }

    getIsDead() {
        return this.isDead
    }

    static handleInput(player: Player, input: GameInput): Player {
        if (player.getIsDead()) {
            return player;
        }
        const newBoard = Board.handleGameInput(input, player.getBoard());
        return new Player(newBoard.getIsDead(), player.socketId, newBoard);
    }
}

import { gameInput } from "../../../shared/types";
import { Board } from "./Board";
import { Piece } from "./Piece";

export class Player {
    private socketId: string;
    private board: Board;
    //Lots more data later here.

    constructor(socketId: string, board: Board) {
        this.socketId = socketId;
        this.board = board;
    }

    getSocketId() {
        return this.socketId;
    }

    getBoard() {
        return this.board;
    }

    static handleInput(player: Player, input: gameInput): Player {
        const newBoard = Board.handleGameInput(input, player.getBoard());
        return new Player(player.socketId, newBoard);
    }
}

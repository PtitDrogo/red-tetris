import { GameInput } from "../../../shared/types";
import { Board } from "./Board";

export class Player {
    private socketId: string;
    private board: Board;
    //Lots more data later here.

    constructor(socketId: string, board: Board) {
        this.socketId = socketId;
        this.board = board;
        console.log(`Heres my board ${JSON.stringify(this.board, null, 2)}`);
    }

    getSocketId() {
        return this.socketId;
    }

    getBoard() {
        return this.board;
    }

    static handleInput(
        player: Player,
        input: GameInput,
        currTime: number,
    ): Player {
        if (!player.getBoard().getIsAlive()) {
            return player;
        }
        const newBoard = Board.handleGameInput(
            input,
            player.getBoard(),
            currTime,
        );
        return new Player(player.socketId, newBoard);
    }
}

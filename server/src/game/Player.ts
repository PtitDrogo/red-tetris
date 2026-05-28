import { GameInput } from "../../../shared/types";
import { Board, BoardTypeRng } from "./Board";

export class Player {
    private socketId: string;
    private board: Board;
    private lastDowntime: number;
    //Lots more data later here.

    constructor(socketId: string, board: Board, lastDownTime: number) {
        this.socketId = socketId;
        this.board = board;
        this.lastDowntime = lastDownTime;
        // console.log(`Heres my board ${JSON.stringify(this.board, null, 2)}`);
    }

    getSocketId() {
        return this.socketId;
    }

    getBoard() {
        return this.board;
    }

    getLastDownTime() {
        return this.lastDowntime;
    }

    setLastDownTime(newTime: number) {
        this.lastDowntime = newTime;
    }

    static handleInput(
        player: Player,
        input: GameInput,
        currTime: number,
    ): Player {
        if (!player.getBoard().getIsAlive()) {
            return player;
        }
        const oldBoard = player.getBoard();
        const oldBoardData: BoardTypeRng = {
            bag: oldBoard.getBag(),
            board: oldBoard,
            seed: oldBoard.getSeed(),
        };

        const newBoard = Board.handleGameInput(input, oldBoardData);
        const newPlayer = new Player(
            player.socketId,
            newBoard.board,
            player.getLastDownTime(),
        );
        if (input === GameInput.DOWN) {
            newPlayer.setLastDownTime(currTime);
        }
        return newPlayer;
    }
}

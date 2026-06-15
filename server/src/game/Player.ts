import { GameInput } from "../../../shared/types.js";
import { Board, BoardTypeRng } from "./Board.js";


export const STARTING_SPEED = 1200
export const SPEED_STEP = 500

export class Player {
    private socketId: string;
    private board: Board;
    private lastDowntime: number;
    private points: number;
    private speed: number;

    constructor(
        socketId: string,
        board: Board,
        lastDownTime: number,
        points: number,
        speed: number,
    ) {
        this.socketId = socketId;
        this.board = board;
        this.lastDowntime = lastDownTime;
        this.points = points;
        this.speed = speed;
    }

    getSocketId() {
        return this.socketId;
    }

    getSpeed() {
        return this.speed;
    }

    getBoard() {
        return this.board;
    }

    getPoints() {
        return this.points;
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
        const newPoints = Player.computePoints(
            newBoard.board.getClearedLines(),
            player.getSpeed(),
            player.getPoints(),
        );
        const newPlayer = new Player(
            player.socketId,
            newBoard.board,
            player.getLastDownTime(),
            newPoints,
            Player.computeSpeed(newPoints),
        );
        if (input === GameInput.DOWN) {
            newPlayer.setLastDownTime(currTime);
        }
        return newPlayer;
    }

    private static computePoints(
        clearedLines: number,
        speed: number,
        currPoints: number,
    ) {
        const rawPoints = 50 * clearedLines ** 2 + 250 * clearedLines;
        return rawPoints * (speed / 1000) + currPoints;
    }

    private static computeSpeed(points: number) {
        const steps = Math.floor(points / 500);
        console.log(Math.max(1200 - steps * 100, 100));
        return Math.max(1200 - steps * 100, 100);
    }
}

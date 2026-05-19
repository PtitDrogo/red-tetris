import { COLS, ROWS } from "../../../shared/constants";
import { Piece } from "./Piece";

export class Board {
    grid: number[][];

    constructor() {
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    handleNewPiece(board: Board, newPiece: Piece) {

    }
}

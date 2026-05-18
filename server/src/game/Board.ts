import { COLS, ROWS } from "../../../shared/constants";

class Board {
    grid: number[][];

    constructor() {
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
        
}

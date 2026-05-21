import { GRID_STATES } from "../../../shared/types";

export enum PieceType {
    I = "I",
    J = "J",
    L = "L",
    O = "O",
    S = "S",
    T = "T",
    Z = "Z",
}

export type Coordinate = {
    x: number;
    y: number;
};

const SPAWN_Y = 0;
const SPAWN_X = 5;

export const Shapes: Record<PieceType, { cells: Coordinate[] }> = {
    //□□□□
    [PieceType.I]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ],
    },

    // □□
    // □□
    [PieceType.O]: {
        cells: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },

    // □□□
    //   □
    [PieceType.J]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ],
    },

    // □□□
    // □
    [PieceType.L]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 1 },
        ],
    },

    //  □□
    // □□
    [PieceType.S]: {
        cells: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: 1 },
        ],
    },

    // □□
    //  □□
    [PieceType.Z]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },

    // □□□
    //  □
    [PieceType.T]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ],
    },
};

export class Piece {
    private type: PieceType;
    private pivot: Coordinate;
    private cells: Coordinate[];
    private color: GRID_STATES;

    constructor(piece: PieceType, pivot: Coordinate, cells?: Coordinate[]) {
        this.type = piece;
        this.pivot = pivot;
        this.cells = cells ?? Shapes[piece].cells;
        this.color = GRID_STATES.BLUE; //For now everything is blue Ill do a random thing here later.
    }

    getPivot() {
        return this.pivot;
    }

    getType() {
        return this.type;
    }

    getCells() {
        return this.cells;
    }

    getColor() {
        return this.color;
    }

    //This may be out of bound, as it doesnt know what board is.
    getComputedCoordinates() {
        const computedCoordinates: Coordinate[] = this.cells.map((cell) => {
            return {
                x: this.pivot.x + cell.x,
                y: this.pivot.y + cell.y,
            };
        });
        return computedCoordinates;
    }

    static rotate(piece: Piece): Piece {
        if (piece.type === PieceType.O) {
            return new Piece(piece.type, piece.pivot, piece.cells);
        }

        const newCells = piece.cells.map(({ x, y }) => ({
            x: y,
            y: -x,
        }));

        if (piece.type === PieceType.I) {
            const newCells = piece.cells.map(({ x, y }) => ({
                x: -y + 1,
                y: -x + 1,
            }));
            return new Piece(piece.type, piece.pivot, newCells);
        }

        return new Piece(piece.type, piece.pivot, newCells);
    }

    static down(piece: Piece): Piece {
        return new Piece(piece.type, {
            x: piece.pivot.x,
            y: piece.pivot.y + 1,
        });
    }

    static left(piece: Piece): Piece {
        return new Piece(piece.type, {
            x: piece.pivot.x - 1,
            y: piece.pivot.y,
        });
    }

    static right(piece: Piece): Piece {
        return new Piece(piece.type, {
            x: piece.pivot.x + 1,
            y: piece.pivot.y,
        });
    }

    static space(piece: Piece): Piece {
        
    }
}

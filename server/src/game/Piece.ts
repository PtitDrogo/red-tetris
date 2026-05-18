export enum PieceType {
    I = "I",
    J = "J",
    L = "L",
    O = "O",
    S = "S",
    T = "T",
    Z = "Z",
}

type Coordinate = {
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

    constructor(piece: PieceType, pivot: Coordinate, cells?: Coordinate[]) {
        this.type = piece;
        this.pivot = pivot;
        this.cells = cells ?? Shapes[piece].cells;
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

    static rotate(piece: Piece): Piece {
        const newCells = piece.cells.map(({ x, y }) => ({
            x: y,
            y: -x,
        }));

        return new Piece(piece.type, piece.pivot, newCells);
    }

    static down(piece: Piece): Piece {
        return new Piece(piece.type, {
            x: piece.pivot.x,
            y: piece.pivot.y - 1,
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
}

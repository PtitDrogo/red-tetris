import { GRID_STATES } from "../../../shared/types.js";

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

export const SPAWN_COOR: Coordinate = {
    x: 5,
    y: 1,
};

export const Shapes: Record<
    PieceType,
    { cells: Coordinate[]; color: GRID_STATES }
> = {
    //□□□□
    [PieceType.I]: {
        cells: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ],
        color: GRID_STATES.BLUE,
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
        color: GRID_STATES.GREEN,
    },

    // □
    // □□□

    [PieceType.J]: {
        cells: [
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
        color: GRID_STATES.ORANGE,
    },

    //   □
    // □□□

    [PieceType.L]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: +1, y: -1 },
        ],
        color: GRID_STATES.RED,
    },

    //  □□
    // □□
    [PieceType.S]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ],
        color: GRID_STATES.GREEN,
    },

    // □□
    //  □□
    [PieceType.Z]: {
        cells: [
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
        color: GRID_STATES.ORANGE,
    },

    //  □
    // □□□

    [PieceType.T]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
        ],
        color: GRID_STATES.GREEN,
    },
};

export class Piece {
    private type: PieceType;
    private pivot: Coordinate;
    private cells: Coordinate[];
    private color: GRID_STATES;

    constructor(piece: PieceType, pivot?: Coordinate, cells?: Coordinate[]) {
        this.type = piece;
        this.pivot = pivot ?? SPAWN_COOR;
        this.cells = cells ?? Shapes[piece].cells;
        this.color = Shapes[piece].color;
    }

    static copy(
        piece: Piece,
        overrides: Partial<{
            type: PieceType;
            pivot: Coordinate;
            cells: Coordinate[];
        }> = {},
    ): Piece {
        return new Piece(
            overrides.type ?? piece.type,
            overrides.pivot ?? piece.pivot,
            overrides.cells ?? piece.cells,
        );
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
    static getComputedCoordinates(
        piece: Piece,
        newPivot?: Coordinate,
        newCoordinates?: Coordinate[],
    ) {
        const coordinates = newCoordinates ?? piece.getCells();
        const pivot = newPivot ?? piece.getPivot();
        const computedCoordinates: Coordinate[] = coordinates.map(
            (coordinate) => {
                return {
                    x: pivot.x + coordinate.x,
                    y: pivot.y + coordinate.y,
                };
            },
        );
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
        return new Piece(
            piece.type,
            { x: piece.pivot.x, y: piece.pivot.y + 1 },
            piece.cells,
        );
    }

    static left(piece: Piece): Piece {
        return new Piece(
            piece.type,
            { x: piece.pivot.x - 1, y: piece.pivot.y },
            piece.cells,
        );
    }

    static right(piece: Piece): Piece {
        return new Piece(
            piece.type,
            { x: piece.pivot.x + 1, y: piece.pivot.y },
            piece.cells,
        );
    }
}

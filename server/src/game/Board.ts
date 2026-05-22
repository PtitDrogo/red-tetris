import { COLS, ROWS } from "../../../shared/constants";
import { gameInput, GRID_STATES } from "../../../shared/types";
import { Coordinate, Piece, PieceType, Shapes, SPAWN_COOR } from "./Piece";

export class Board {
    private grid: number[][];
    private activePiece: Piece;
    private ghostPiece: Piece;

    constructor(activePiece?: Piece, grid?: number[][]) {
        this.grid =
            grid ?? Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        this.activePiece = activePiece ?? new Piece(PieceType.T, SPAWN_COOR); //TODO Have an actual random Piece spawn.
        this.ghostPiece = Board.computeGhost(this.activePiece, this.grid);
    }

    getActivePiece() {
        return this.activePiece;
    }

    //This does a deep copy.
    getGrid() {
        return this.grid.map((row) => [...row]);
    }

    getGhostPiece() {
        return this.ghostPiece;
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(newInput: gameInput, board: Board): Board {
        const oldPiece = board.getActivePiece();
        const color = oldPiece.getColor();

        const moves: Record<gameInput, () => Piece> = {
            [gameInput.LEFT]: () => Piece.left(oldPiece),
            [gameInput.RIGHT]: () => Piece.right(oldPiece),
            [gameInput.DOWN]: () => Piece.down(oldPiece),
            [gameInput.ROTATE]: () => Piece.rotate(oldPiece),
            [gameInput.SPACE]: () => board.getGhostPiece(),
        };

        if (newInput === gameInput.SPACE) {
            const newGrid = board.getGrid();
            oldPiece.getComputedCoordinates().forEach(({ x, y }) => {
                newGrid[y][x] = color;
            });

            //WARNING - THIS SUCKS - BUT MAKING A PURE RANDOM GENERATOR FUNCTION IS BREAKING MY BRAIN
            const pieceTypes = Object.keys(Shapes) as PieceType[];
            const randomIndex = Math.floor(Math.random() * pieceTypes.length);
            const randomPieceType = pieceTypes[randomIndex];

            return new Board(new Piece(randomPieceType, SPAWN_COOR), newGrid);
        }

        const newPiece = moves[newInput]();

        //We remove the active piece from our check.
        const newGrid = board.getGrid();
        board
            .getActivePiece()
            .getComputedCoordinates()
            .forEach((coordinate) => {
                newGrid[coordinate.y][coordinate.x] = GRID_STATES.EMPTY;
            });
        const newCoordinates = newPiece.getComputedCoordinates();

        const isValid = newCoordinates.every(
            ({ x, y }) =>
                this.isCoordinateInBound({ x, y }) &&
                newGrid[y][x] === GRID_STATES.EMPTY,
        );

        if (!isValid) return board;

        newCoordinates.forEach(({ x, y }) => {
            newGrid[y][x] = color;
        });
        return new Board(newPiece, newGrid);
    }

    private static computeGhost(piece: Piece, grid: number[][]): Piece {
        let candidate = piece;
        while (true) {
            const next = Piece.down(candidate);
            const isValid = next
                .getComputedCoordinates()
                .every(
                    ({ x, y }) =>
                        this.isCoordinateInBound({ x, y }) &&
                        grid[y][x] === GRID_STATES.EMPTY,
                );
            if (!isValid) return candidate;
            candidate = next;
        }
    }

    private static isCoordinateInBound({ x, y }: Coordinate) {
        return x >= 0 && y >= 0 && x < COLS && y < ROWS;
    }
}

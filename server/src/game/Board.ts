import { COLS, ROWS } from "../../../shared/constants";
import { GameInput, GRID_STATES } from "../../../shared/types";
import { Coordinate, Piece, PieceType, Shapes, SPAWN_COOR } from "./Piece";

export class Board {
    private lockedGrid: number[][];
    private activePiece: Piece;
    private ghostPiece: Piece;

    constructor(activePiece?: Piece, grid?: number[][]) {
        this.lockedGrid =
            grid ??
            Array.from({ length: ROWS }, () =>
                Array(COLS).fill(GRID_STATES.EMPTY),
            );
        this.activePiece = activePiece ?? new Piece(PieceType.T, SPAWN_COOR); //TODO implement bag system
        this.ghostPiece = Board.computeGhost(this.activePiece, this.lockedGrid);
    }

    getActivePiece() {
        return this.activePiece;
    }

    getFullGrid(): number[][] {
        const display = this.lockedGrid.map((row) => [...row]);
        const color = this.activePiece.getColor();

        this.ghostPiece.getComputedCoordinates().forEach(({ x, y }) => {
            if (display[y][x] === GRID_STATES.EMPTY)
                display[y][x] = GRID_STATES.GHOST;
        });
        this.activePiece.getComputedCoordinates().forEach(({ x, y }) => {
            display[y][x] = color;
        });

        return display;
    }

    //Gets the grid (a copy) without the position of the active Piece and ghost Piece
    getLockedGrid(): number[][] {
        return this.lockedGrid.map((row) => [...row]);
    }

    getGhostPiece() {
        return this.ghostPiece;
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(newInput: GameInput, board: Board): Board {
        const oldPiece = board.getActivePiece();
        console.log("In HandleGameInput");
        console.log(`Game input with value ${newInput} is now compared to the value ${GameInput.SPACE}`)
        console.log(`${typeof newInput} is type of newInput - ${typeof GameInput.SPACE} is type of enum`)

        if (newInput === GameInput.SPACE) {
            console.log("In Space handler");
            const newLocked = board.getLockedGrid();
            board
                .getGhostPiece()
                .getComputedCoordinates()
                .forEach(({ x, y }) => {
                    newLocked[y][x] = oldPiece.getColor();
                });
            const pieceTypes = Object.keys(Shapes) as PieceType[];
            const randomPieceType =
                pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
            const newBoard = new Board(
                new Piece(randomPieceType, SPAWN_COOR),
                newLocked,
            );
            console.log("NewBoard full grid = ", newBoard.getFullGrid());
            console.log("Get locked grid = ", newBoard.getLockedGrid());
            console.log(
                "Active Piece Data",
                JSON.stringify(newBoard.getActivePiece, null, 2),
            );
            return newBoard;
        }

        const moves: Record<GameInput, () => Piece> = {
            [GameInput.LEFT]: () => Piece.left(oldPiece),
            [GameInput.RIGHT]: () => Piece.right(oldPiece),
            [GameInput.DOWN]: () => Piece.down(oldPiece),
            [GameInput.ROTATE]: () => Piece.rotate(oldPiece),
            [GameInput.SPACE]: () => oldPiece,
        };

        const newPiece = moves[newInput]();
        const isValid = newPiece
            .getComputedCoordinates()
            .every(
                ({ x, y }) =>
                    this.isCoordinateInBound({ x, y }) &&
                    board.getLockedGrid()[y][x] === GRID_STATES.EMPTY,
            );

        if (!isValid) return board;
        console.log("Did I get all the way here ?");
        console.log(newPiece);
        return new Board(newPiece, board.getLockedGrid());
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

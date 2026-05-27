import { COLS, ROWS } from "../../../shared/constants";
import { GameInput, GRID_STATES } from "../../../shared/types";
import { Coordinate, Piece, PieceType, Shapes, SPAWN_COOR } from "./Piece";

type PieceHandlingResult = {
    isAlive: boolean;
    Piece: Piece;
};

const TIME_TO_DOWN_MS = 100;

export class Board {
    private lockedGrid: number[][];
    private activePiece: Piece;
    private ghostPiece: Piece;
    private isAlive: boolean = false;

    constructor(activePiece?: Piece, grid?: number[][]) {
        this.lockedGrid = Board.handleFilledRows(
            grid ?? Board.createEmptyGrid(),
        );
        this.activePiece = activePiece ?? new Piece(PieceType.T, SPAWN_COOR); //TODO implement bag system
        this.isAlive = Board.isBoardAlive(this, this.activePiece);
        this.ghostPiece = Board.computeGhost(this.activePiece, this.lockedGrid);
    }

    getActivePiece() {
        return this.activePiece;
    }

    getIsAlive() {
        return this.isAlive;
    }

    getFullGrid(): number[][] {
        const display = this.lockedGrid.map((row) => [...row]);
        const color = this.activePiece.getColor();

        Piece.getComputedCoordinates(this.ghostPiece).forEach(({ x, y }) => {
            // if (!Board.isCoordinateInBound({ x, y })) return;
            if (display[y][x] === GRID_STATES.EMPTY)
                display[y][x] = GRID_STATES.GHOST;
        });
        Piece.getComputedCoordinates(this.activePiece).forEach(({ x, y }) => {
            // if (!Board.isCoordinateInBound({ x, y })) return;
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

    private static isEmptyCell(cell: number) {
        return cell === GRID_STATES.EMPTY || cell === GRID_STATES.GHOST;
    }

    private static createEmptyGrid() {
        return Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.EMPTY),
        );
    }

    private static isBoardAlive(board: Board, piece: Piece): boolean {
        const coordinates = Piece.getComputedCoordinates(piece);
        const isAlive = Board.isValidCoordinates(
            coordinates,
            board.getLockedGrid(),
        );
        return isAlive;
    }

    //This entire functionnality will sadly have to be outside this class because
    //Game has to be able to know how many lines we delete so it can penalize other boards.
    private static handleFilledRows(grid: number[][]): number[][] {
        const nonCompleteRows = grid.filter((row) =>
            row.some((cell) => Board.isEmptyCell(cell)),
        );

        const numRemovedRows = grid.length - nonCompleteRows.length;
        const emptyRows = Array.from({ length: numRemovedRows }, () =>
            new Array(COLS).fill(GRID_STATES.EMPTY),
        );
        //Also need to handle that the other board are going to be penalized by me owning.
        return [...emptyRows, ...nonCompleteRows];
    }

    private static isValidCoordinates(
        coordinates: Coordinate[],
        grid: number[][],
    ): boolean {
        return coordinates.every(
            ({ x, y }) =>
                Board.isCoordinateInBound({ x, y }) &&
                Board.isEmptyCell(grid[y][x]),
        );
    }

    private static handleDownInput(
        grid: number[][],
        activePiece: Piece,
    ): Board {
        const pieceCoordinates = Piece.getComputedCoordinates(activePiece);
        if (Board.isValidCoordinates(pieceCoordinates, grid))
            return new Board(activePiece, grid);

        const newPivot: Coordinate = {
            x: activePiece.getPivot().x,
            y: activePiece.getPivot().y - 1,
        };
        const pieceToLock = new Piece(
            activePiece.getType(),
            newPivot,
            activePiece.getCells(),
        );

        const newLockedGrid = structuredClone(grid);
        Piece.getComputedCoordinates(pieceToLock).forEach(({ x, y }) => {
            newLockedGrid[y][x] = pieceToLock.getColor();
        });
        const pieceTypes = Object.keys(Shapes) as PieceType[];
        const randomPieceType =
            pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        const newPiece = new Piece(randomPieceType, SPAWN_COOR);

        return new Board(newPiece, newLockedGrid);
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(
        newInput: GameInput,
        board: Board,
    ): Board {
        const oldPiece = board.getActivePiece();

        if (newInput === GameInput.SPACE) {
            const newLocked = board.getLockedGrid();
            const ghostPiece = board.getGhostPiece();
            Piece.getComputedCoordinates(ghostPiece).forEach(({ x, y }) => {
                newLocked[y][x] = oldPiece.getColor();
            });
            const pieceTypes = Object.keys(Shapes) as PieceType[];
            const randomPieceType =
                pieceTypes[Math.floor(Math.random() * pieceTypes.length)]; //TODO, remove math.random().
            const newBoard = new Board(
                new Piece(randomPieceType, SPAWN_COOR),
                newLocked,
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
        const piece = moves[newInput]();
        const grid = board.getLockedGrid();

        if (newInput === GameInput.DOWN) {
            return Board.handleDownInput(grid, piece);
        }

        const isValid = Board.isValidCoordinates(
            Piece.getComputedCoordinates(piece),
            grid,
        );
        if (!isValid) return board;

        return new Board(piece, grid);
    }

    private static computeGhost(piece: Piece, grid: number[][]): Piece {
        let candidate = piece;
        while (true) {
            const next = Piece.down(candidate);
            const isValid = Piece.getComputedCoordinates(next).every(
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

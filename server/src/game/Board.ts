import { COLS, ROWS } from "../../../shared/constants.js";
import {
    Coordinate,
    GameInput,
    GRID_STATES,
    PieceType,
} from "../../../shared/types.js";
import { Piece, SPAWN_COOR } from "./Piece.js";
import { rng } from "./rng.js";

type PieceTypeRng = {
    pieceType: PieceType;
    seed: number;
    bag: PieceType[];
};

type clearRowsData = {
    grid: number[][];
    clearedRows: number;
    indexesOfClear: number[]; //Its possible for cleared lines to not be contiguous
};

export type BoardTypeRng = {
    board: Board;
    seed: number;
    bag: PieceType[];
};

export class Board {
    private lockedGrid: number[][];
    private activePiece: Piece;
    private ghostPiece: Piece;
    private isAlive: boolean = false;
    private seed: number;
    private bag: PieceType[];
    private nextPiece: PieceType;
    private clearedLines: number;
    private clearedLinesIndexes: number[];

    constructor(
        seed: number,
        bag: PieceType[],
        activePiece?: Piece,
        grid?: number[][],
        isAlive?: boolean,
        clearedLines?: number,
        clearedLinesIndexes?: number[],
    ) {
        this.seed = seed;
        this.bag = bag;
        const clearRowsData = Board.handleFilledRows(
            grid ?? Board.createEmptyGrid(),
        );
        this.lockedGrid = clearRowsData.grid;
        this.clearedLines = clearedLines ?? clearRowsData.clearedRows;
        this.clearedLinesIndexes =
            clearedLinesIndexes ?? clearRowsData.indexesOfClear;
        if (activePiece) this.activePiece = activePiece;
        else {
            const pieceRng = Board.getPieceFromBag(this.seed, this.bag);
            this.activePiece = Board.spawnNewActivePiece(
                this.lockedGrid,
                pieceRng.pieceType,
            );
            this.seed = pieceRng.seed;
            this.bag = pieceRng.bag;
        }

        this.nextPiece = Board.getPieceFromBag(this.seed, this.bag).pieceType;
        this.isAlive = isAlive ?? Board.isBoardAlive(this, this.activePiece);
        this.ghostPiece = Board.computeGhost(this.activePiece, this.lockedGrid);
    }

    static copy(
        board: Board,
        overrides: Partial<{
            seed: number;
            bag: PieceType[];
            activePiece: Piece;
            grid: number[][];
            isAlive: boolean;
            clearedLines: number;
            clearedLinesIndexes: number[];
        }> = {},
    ): Board {
        return new Board(
            overrides.seed ?? board.seed,
            overrides.bag ?? board.bag,
            overrides.activePiece ?? board.activePiece,
            overrides.grid ?? board.lockedGrid,
            overrides.isAlive ?? board.isAlive,
            overrides.clearedLines ?? board.clearedLines,
            overrides.clearedLinesIndexes ?? board.clearedLinesIndexes,
        );
    }

    getActivePiece() {
        return this.activePiece;
    }

    getClearedLines() {
        return this.clearedLines;
    }

    getClearedLinesIndexes() {
        return this.clearedLinesIndexes;
    }

    getIsAlive() {
        return this.isAlive;
    }

    getBag() {
        return this.bag;
    }

    getNextPiece() {
        return this.nextPiece;
    }

    private static getPieceFromBag(
        seed: number,
        bag: PieceType[],
    ): PieceTypeRng {
        const { nextSeed, value } = rng(seed);
        const pieceType = bag[Math.floor(value * bag.length)];

        let newBag = bag.filter((piece) => piece !== pieceType);
        if (newBag.length === 0) {
            newBag = Object.values(PieceType);
        }

        return { seed: nextSeed, pieceType: pieceType, bag: newBag };
    }

    getFullGrid(): number[][] {
        const display = this.lockedGrid.map((row) => [...row]);
        const color = this.activePiece.getColor();

        Piece.getComputedCoordinates(this.ghostPiece).forEach(({ x, y }) => {
            if (display[y][x] === GRID_STATES.EMPTY)
                display[y][x] = GRID_STATES.GHOST;
        });
        Piece.getComputedCoordinates(this.activePiece).forEach(({ x, y }) => {
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

    getSeed() {
        return this.seed;
    }

    static addBlockLines(toAdd: number, board: Board): Board {
        if (toAdd === 0 || !board.getIsAlive()) return board;

        const filledLines = Array.from({ length: toAdd }, () =>
            Array(COLS).fill(GRID_STATES.BLOCKED),
        );

        const combined = [...board.getLockedGrid(), ...filledLines];

        const overflow = combined
            .slice(0, toAdd)
            .some((row) => row.some((cell) => !Board.isEmptyCell(cell)));

        const newGrid = combined.slice(toAdd);
        const newBoard = Board.copy(board, {
            grid: newGrid,
            isAlive: !overflow,
        });

        return newBoard;
    }

    private static spawnNewActivePiece(
        grid: number[][],
        pieceType: PieceType,
    ): Piece {
        const spawnOffsets: Coordinate[] = [
            { x: SPAWN_COOR.x, y: SPAWN_COOR.y },
            { x: SPAWN_COOR.x - 4, y: SPAWN_COOR.y },
            { x: SPAWN_COOR.x + 3, y: SPAWN_COOR.y },
        ];
        for (const spawn of spawnOffsets) {
            const piece = new Piece(pieceType, spawn);
            const coordinates = Piece.getComputedCoordinates(piece);
            if (Board.isValidCoordinates(coordinates, grid)) {
                return piece;
            }
        }

        // Game over
        return new Piece(pieceType, SPAWN_COOR);
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

    private static handleFilledRows(grid: number[][]): clearRowsData {
        const indexedGrid = grid.map((row, y) => ({ row, y }));

        const nonCompleteRowsWithIndex = indexedGrid.filter(({ row }) =>
            row.some(
                (cell) =>
                    Board.isEmptyCell(cell) || cell === GRID_STATES.BLOCKED,
            ),
        );
        const remainingIndices = new Set(
            nonCompleteRowsWithIndex.map((item) => item.y),
        );
        const clearedRowIndices = grid
            .map((_, y) => y)
            .filter((y) => !remainingIndices.has(y));

        let nonCompleteRows = nonCompleteRowsWithIndex.map((item) => item.row);

        const numRemovedRows = grid.length - nonCompleteRows.length;
        let linesToClearFromBlocks = numRemovedRows;

        if (linesToClearFromBlocks > 0) {
            for (let i = nonCompleteRows.length - 1; i >= 0; i--) {
                if (linesToClearFromBlocks === 0) break;

                const isBlockedRow = nonCompleteRows[i].every(
                    (cell) => cell === GRID_STATES.BLOCKED,
                );

                if (isBlockedRow) {
                    nonCompleteRows.splice(i, 1);
                    linesToClearFromBlocks--;
                }
            }
        }

        const totalNewEmptyRows = grid.length - nonCompleteRows.length;
        const emptyRows = Array.from({ length: totalNewEmptyRows }, () =>
            new Array(COLS).fill(GRID_STATES.EMPTY),
        );

        return {
            grid: [...emptyRows, ...nonCompleteRows],
            clearedRows: numRemovedRows,
            indexesOfClear: clearedRowIndices,
        };
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
        seed: number,
        bag: PieceType[],
    ): BoardTypeRng {
        const pieceCoordinates = Piece.getComputedCoordinates(activePiece);
        if (Board.isValidCoordinates(pieceCoordinates, grid))
            return {
                bag,
                seed,
                board: new Board(seed, bag, activePiece, grid),
            };

        const newPivot: Coordinate = {
            x: activePiece.getPivot().x,
            y: activePiece.getPivot().y - 1,
        };

        const pieceToLock = Piece.copy(activePiece, {
            pivot: newPivot,
        });

        const newLockedGrid = structuredClone(grid);
        Piece.getComputedCoordinates(pieceToLock).forEach(({ x, y }) => {
            newLockedGrid[y][x] = pieceToLock.getColor();
        });

        const {
            pieceType,
            seed: newSeed,
            bag: newBag,
        } = Board.getPieceFromBag(seed, bag);

        const newPiece = Board.spawnNewActivePiece(newLockedGrid, pieceType);
        const newBoard = new Board(newSeed, newBag, newPiece, newLockedGrid);
        return { board: newBoard, seed: newSeed, bag: newBag };
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(
        newInput: GameInput,
        boardData: BoardTypeRng,
    ): BoardTypeRng {
        const board = boardData.board;
        const oldPiece = board.getActivePiece();

        if (newInput === GameInput.SPACE) {
            const newLocked = board.getLockedGrid();
            const ghostPiece = board.getGhostPiece();
            Piece.getComputedCoordinates(ghostPiece).forEach(({ x, y }) => {
                newLocked[y][x] = oldPiece.getColor();
            });
            const { bag, seed, pieceType } = Board.getPieceFromBag(
                boardData.seed,
                boardData.bag,
            );

            const newBoard = new Board(
                seed,
                bag,
                Board.spawnNewActivePiece(newLocked, pieceType),
                newLocked,
            );
            return { bag, seed, board: newBoard };
        }

        const getMoves = (piece: Piece): Record<GameInput, () => Piece> => ({
            [GameInput.LEFT]: () => Piece.left(piece),
            [GameInput.RIGHT]: () => Piece.right(piece),
            [GameInput.DOWN]: () => Piece.down(piece),
            [GameInput.ROTATE]: () => Piece.rotate(piece),
            [GameInput.SPACE]: () => piece,
        });
        const piece = getMoves(oldPiece)[newInput]();
        const grid = board.getLockedGrid();

        if (newInput === GameInput.DOWN) {
            return Board.handleDownInput(
                grid,
                piece,
                boardData.seed,
                boardData.bag,
            );
        }

        const isValid = Board.isValidCoordinates(
            Piece.getComputedCoordinates(piece),
            grid,
        );
        if (!isValid) {
            if (newInput !== GameInput.ROTATE) return boardData;
            else return Board.wallKick(piece, boardData, grid);
        }
        return {
            ...boardData,
            board: new Board(boardData.seed, boardData.bag, piece, grid),
        };
    }

    private static wallKick(
        rotated: Piece,
        boardData: BoardTypeRng,
        grid: number[][],
    ): BoardTypeRng {
        const WALL_KICKS_0_TO_R: Coordinate[] = [
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: 2 },
            { x: -1, y: 2 },
        ];

        const WALL_KICKS_0_TO_L: Coordinate[] = [
            { x: 1, y: 0 },
            { x: 1, y: -1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
        ];

        const WALL_KICKS = [...WALL_KICKS_0_TO_R, ...WALL_KICKS_0_TO_L];

        const kick = WALL_KICKS.find((offset) => {
            const kicked = Piece.copy(rotated, {
                pivot: {
                    x: rotated.getPivot().x + offset.x,
                    y: rotated.getPivot().y + offset.y,
                },
            });
            return Board.isValidCoordinates(
                Piece.getComputedCoordinates(kicked),
                grid,
            );
        });

        if (!kick) return boardData;

        const newPiece = new Piece(
            rotated.getType(),
            {
                x: rotated.getPivot().x + kick.x,
                y: rotated.getPivot().y + kick.y,
            },
            rotated.getCells(),
        );
        return {
            ...boardData,
            board: new Board(boardData.seed, boardData.bag, newPiece, grid),
        };
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

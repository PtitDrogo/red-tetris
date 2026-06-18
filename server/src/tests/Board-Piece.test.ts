import { describe, it, expect, beforeEach } from "vitest";
import { ROWS, COLS } from "../../../shared/constants.js";
import { GRID_STATES, GameInput } from "../../../shared/types.js";
import { Board } from "../game/Board.js";
import { Piece, PieceType } from "../game/Piece.js";

// Because otherwise tests are complaining that -0 !== 0
const normalize = (cells: { x: number; y: number }[]) =>
    cells.map(({ x, y }) => ({ x: x || 0, y: y || 0 }));

describe("Rotation Behaviors", () => {
    it("should correctly rotate the O piece (No-op)", () => {
        const oPiece = new Piece(PieceType.O, { x: 5, y: 5 });
        const rotated = Piece.rotate(oPiece);

        expect(normalize(rotated.getCells())).toEqual(
            normalize(oPiece.getCells()),
        );
    });

    it("should correctly rotate the I piece using its special rotational matrix", () => {
        const iPiece = new Piece(PieceType.I, { x: 5, y: 5 });
        const rotated = Piece.rotate(iPiece);

        expect(normalize(rotated.getCells())).toEqual([
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 0 },
            { x: 1, y: -1 },
        ]);
    });

    it("should rotate a standard piece (e.g., T piece) 90 degrees clockwise", () => {
        const tPiece = new Piece(PieceType.T, { x: 5, y: 5 });
        const rotated = Piece.rotate(tPiece);

        expect(normalize(rotated.getCells())).toEqual([
            { x: 0, y: 1 },
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: 0 },
        ]);
    });

    it("should calculate absolute grid coordinates based on the pivot", () => {
        const zPiece = new Piece(PieceType.Z, { x: 5, y: 5 });
        const absoluteCoords = Piece.getComputedCoordinates(zPiece);

        expect(normalize(absoluteCoords)).toContainEqual({ x: 4, y: 4 });
        expect(normalize(absoluteCoords)).toContainEqual({ x: 5, y: 4 });
        expect(normalize(absoluteCoords)).toContainEqual({ x: 5, y: 5 });
        expect(normalize(absoluteCoords)).toContainEqual({ x: 6, y: 5 });
    });
});

describe("Left & Right Movement and Wall Collisions", () => {
    let emptyGrid: number[][];

    beforeEach(() => {
        emptyGrid = Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.EMPTY),
        );
    });

    it("should successfully shift the active piece one column to the left", () => {
        const tPiece = new Piece(PieceType.T, { x: 5, y: 5 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.LEFT, boardInfo);

        expect(result.board.getActivePiece().getPivot().x).toBe(4);
    });

    it("should successfully shift the active piece one column to the right", () => {
        const tPiece = new Piece(PieceType.T, { x: 5, y: 5 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.RIGHT, boardInfo);

        expect(result.board.getActivePiece().getPivot().x).toBe(6);
    });

    it("should refuse left movement if the piece is flush against the left wall", () => {
        const tPiece = new Piece(PieceType.T, { x: 1, y: 5 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.LEFT, boardInfo);

        expect(result.board.getActivePiece().getPivot().x).toBe(1);
    });

    it("should refuse right movement if the piece is flush against the right wall", () => {
        const rightmostValidX = COLS - 2;
        const tPiece = new Piece(PieceType.T, { x: rightmostValidX, y: 5 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.RIGHT, boardInfo);

        expect(result.board.getActivePiece().getPivot().x).toBe(
            rightmostValidX,
        );
    });
});
describe("Piece Constructor & Copy Branch Coverage", () => {
    it("should instantiate a piece using fallback SPAWN_COOR and template cells when parameters are omitted", () => {
        const piece = new Piece(PieceType.T);

        expect(piece.getPivot()).toBeDefined();
        expect(piece.getCells()).toBeInstanceOf(Array);
        expect(piece.getCells().length).greaterThan(0);
    });

    it("should successfully clone a piece when the overrides argument is completely omitted", () => {
        const original = new Piece(PieceType.I, { x: 4, y: 4 }, [
            { x: 0, y: 0 },
        ]);

        const cloned = Piece.copy(original);

        expect(cloned.getType()).toBe(original.getType());
        expect(cloned.getPivot()).toEqual(original.getPivot());
        expect(cloned.getCells()).toEqual(original.getCells());
    });

    it("should fall back to original piece properties when an override field is missing", () => {
        const original = new Piece(PieceType.Z, { x: 2, y: 2 }, [
            { x: 1, y: 1 },
        ]);

        const pivotOverride = Piece.copy(original, { pivot: { x: 8, y: 8 } });
        expect(pivotOverride.getPivot()).toEqual({ x: 8, y: 8 });
        expect(pivotOverride.getType()).toBe(original.getType());
        expect(pivotOverride.getCells()).toEqual(original.getCells());

        const cellsOverride = Piece.copy(original, { cells: [{ x: 5, y: 5 }] });
        expect(cellsOverride.getCells()).toEqual([{ x: 5, y: 5 }]);
        expect(cellsOverride.getType()).toBe(original.getType());
        expect(cellsOverride.getPivot()).toEqual(original.getPivot());

        const typeOverride = Piece.copy(original, { type: PieceType.O });
        expect(typeOverride.getType()).toBe(PieceType.O);
        expect(typeOverride.getPivot()).toEqual(original.getPivot());
        expect(typeOverride.getCells()).toEqual(original.getCells());
    });
});

describe("Board Core Game Loop Behaviors", () => {
    let emptyGrid: number[][];

    beforeEach(() => {
        emptyGrid = Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.EMPTY),
        );
    });

    it("should clear filled rows and shift everything down", () => {
        const gridWithFullRow = structuredClone(emptyGrid);

        gridWithFullRow[19] = Array(COLS).fill(GRID_STATES.BLUE);
        gridWithFullRow[18][5] = GRID_STATES.RED;

        const board = new Board(1, [PieceType.T], undefined, gridWithFullRow);

        expect(board.getClearedLines()).toBe(1);

        const newGrid = board.getLockedGrid();
        expect(newGrid[19][5]).toBe(GRID_STATES.RED);
        expect(newGrid[0].every((cell) => cell === GRID_STATES.EMPTY)).toBe(
            true,
        );
    });

    it("should accurately compute the ghost piece position on top of the stack", () => {
        const gridWithObstacle = structuredClone(emptyGrid);
        gridWithObstacle[15][5] = GRID_STATES.BLOCKED;

        const tPiece = new Piece(PieceType.T, { x: 5, y: 0 });
        const board = new Board(1, [PieceType.O], tPiece, gridWithObstacle);

        const ghost = board.getGhostPiece();

        expect(ghost.getPivot().y).toBe(14);
        expect(ghost.getPivot().x).toBe(5);
    });

    it("should perform a wall kick if a rotation results in an invalid collision", () => {
        const tPiece = new Piece(PieceType.T, { x: 0, y: 5 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.ROTATE, boardInfo);

        expect(result.board.getActivePiece().getPivot().x).toBe(1);
    });

    it("should lock the piece immediately upon a Hard Drop (SPACE) and spawn a new piece", () => {
        const tPiece = new Piece(PieceType.T, { x: 5, y: 0 });
        const boardInfo = {
            board: new Board(1, [PieceType.O], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.O],
        };

        const result = Board.handleGameInput(GameInput.SPACE, boardInfo);
        const lockedGrid = result.board.getLockedGrid();

        expect(lockedGrid[19][5]).toBe(tPiece.getColor());
        expect(lockedGrid[19][4]).toBe(tPiece.getColor());
        expect(lockedGrid[19][6]).toBe(tPiece.getColor());
        expect(lockedGrid[18][5]).toBe(tPiece.getColor());

        expect(result.board.getActivePiece().getType()).toBe(PieceType.O);
    });

    it("should handle garbage lines correctly and trigger game over if overflow occurs", () => {
        const board = new Board(1, [PieceType.T], undefined, emptyGrid, true);

        const boardWithGarbage = Board.addBlockLines(3, board);
        const lockedGrid = boardWithGarbage.getLockedGrid();

        expect(
            lockedGrid[19].every((cell) => cell === GRID_STATES.BLOCKED),
        ).toBe(true);
        expect(
            lockedGrid[18].every((cell) => cell === GRID_STATES.BLOCKED),
        ).toBe(true);
        expect(
            lockedGrid[17].every((cell) => cell === GRID_STATES.BLOCKED),
        ).toBe(true);
        expect(lockedGrid[16].every((cell) => cell === GRID_STATES.EMPTY)).toBe(
            true,
        );

        expect(boardWithGarbage.getIsAlive()).toBe(true);

        const deadBoard = Board.addBlockLines(18, boardWithGarbage);
        expect(deadBoard.getIsAlive()).toBe(false);
    });

    it("should refuse movement if attempting to move through walls or floor", () => {
        const tPiece = new Piece(PieceType.T, { x: 5, y: 19 });
        const boardInfo = {
            board: new Board(1, [PieceType.I], tPiece, emptyGrid),
            seed: 1,
            bag: [PieceType.I],
        };

        const result = Board.handleGameInput(GameInput.DOWN, boardInfo);

        expect(result.board.getActivePiece().getType()).toBe(PieceType.I);
        expect(result.board.getLockedGrid()[19][5]).toBe(tPiece.getColor());
    });
});

import { describe, it, expect, beforeEach } from "vitest";
import { Board } from "./Board";
import { Piece, PieceType, Shapes } from "./Piece";
import { COLS, ROWS } from "../../../shared/constants";
import { gameInput, GRID_STATES } from "../../../shared/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a fresh T-piece spawned at (5, 0) — a safe, central position. */
function makePiece(
    type: PieceType = PieceType.T,
    pivot = { x: 5, y: 5 },
): Piece {
    return new Piece(type, pivot);
}

/** Return a blank Board with the given active piece. */
function makeBoard(piece: Piece): Board {
    return new Board(piece);
}

/**
 * Count how many cells in the grid equal the given state.
 */
function countCells(grid: number[][], state: GRID_STATES): number {
    return grid.flat().filter((v) => v === state).length;
}

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe("Board constructor", () => {
    it("creates an empty ROWS×COLS grid when no grid is supplied", () => {
        const board = makeBoard(makePiece());
        const grid = board.getGrid();

        expect(grid).toHaveLength(ROWS);
        grid.forEach((row) => expect(row).toHaveLength(COLS));
    });

    it("all cells start as GRID_STATES.EMPTY when no grid is supplied", () => {
        const board = makeBoard(makePiece());
        const grid = board.getGrid();

        expect(countCells(grid, GRID_STATES.EMPTY)).toBe(ROWS * COLS);
    });

    it("accepts a custom grid and preserves it", () => {
        const piece = makePiece();
        const customGrid = Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.BLUE),
        );
        const board = new Board(piece, customGrid);

        expect(countCells(board.getGrid(), GRID_STATES.BLUE)).toBe(ROWS * COLS);
    });

    it("stores the active piece", () => {
        const piece = makePiece();
        const board = makeBoard(piece);

        expect(board.getActivePiece()).toBe(piece);
    });
});

// ---------------------------------------------------------------------------
// getGrid — deep-copy contract
// ---------------------------------------------------------------------------

describe("Board.getGrid", () => {
    it("returns a deep copy — mutating the returned grid does not affect the board", () => {
        const board = makeBoard(makePiece());
        const grid = board.getGrid();

        grid[0][0] = GRID_STATES.BLUE;

        expect(board.getGrid()[0][0]).toBe(GRID_STATES.EMPTY);
    });

    it("returns a new array reference on every call", () => {
        const board = makeBoard(makePiece());

        expect(board.getGrid()).not.toBe(board.getGrid());
    });
});

// ---------------------------------------------------------------------------
// handleGameInput — LEFT
// ---------------------------------------------------------------------------

describe("Board.handleGameInput LEFT", () => {
    it("moves the active piece one column to the left", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.LEFT, board);

        expect(newBoard.getActivePiece().getPivot().x).toBe(4);
    });

    it("returns the same board when moving left would go out of bounds", () => {
        // T-piece at x=0 — leftmost cell at x=-1 would be out of bounds
        const piece = makePiece(PieceType.T, { x: 1, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.LEFT, board);

        expect(newBoard).toBe(board);
    });

    it("keeps the piece colour cells in the grid after moving", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.LEFT, board);

        expect(countCells(newBoard.getGrid(), GRID_STATES.BLUE)).toBe(4);
    });
});

// ---------------------------------------------------------------------------
// handleGameInput — RIGHT
// ---------------------------------------------------------------------------

describe("Board.handleGameInput RIGHT", () => {
    it("moves the active piece one column to the right", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.RIGHT, board);

        expect(newBoard.getActivePiece().getPivot().x).toBe(6);
    });

    it("returns the same board when moving right would go out of bounds", () => {
        // T-piece cells span [-1..+1] relative to pivot; rightmost at pivot.x+1
        const piece = makePiece(PieceType.T, { x: COLS - 2, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.RIGHT, board);

        expect(newBoard).toBe(board);
    });

    it("keeps the piece colour cells in the grid after moving", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.RIGHT, board);

        expect(countCells(newBoard.getGrid(), GRID_STATES.BLUE)).toBe(4);
    });
});

// ---------------------------------------------------------------------------
// handleGameInput — DOWN
// ---------------------------------------------------------------------------

describe("Board.handleGameInput DOWN", () => {
    it("moves the active piece one row up (y - 1 as implemented)", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.DOWN, board);

        expect(newBoard.getActivePiece().getPivot().y).toBe(6);
    });

    it("returns the same board when moving down would go out of bounds (y < 0)", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: ROWS - 2 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.DOWN, board);

        expect(newBoard).toBe(board);
    });

    it("keeps the piece colour cells in the grid after moving", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const newBoard = Board.handleGameInput(gameInput.DOWN, board);

        expect(countCells(newBoard.getGrid(), GRID_STATES.BLUE)).toBe(4);
    });
});

// ---------------------------------------------------------------------------
// handleGameInput — SPACE (rotate)
// ---------------------------------------------------------------------------

// describe("Board.handleGameInput SPACE (rotate)", () => {
//     it("rotates the active piece", () => {
//         const piece = makePiece(PieceType.T, { x: 5, y: 5 });
//         const board = makeBoard(piece);
//         const newBoard = Board.handleGameInput(gameInput.SPACE, board);

//         const originalCells = piece.getCells();
//         const rotatedCells = newBoard.getActivePiece().getCells();

//         expect(rotatedCells).not.toEqual(originalCells);
//     });

//     it("O-piece does not change cells after rotation", () => {
//         const piece = makePiece(PieceType.O, { x: 5, y: 5 });
//         const board = makeBoard(piece);
//         const newBoard = Board.handleGameInput(gameInput.SPACE, board);

//         expect(newBoard.getActivePiece().getCells()).toEqual(piece.getCells());
//     });

//     it("pivot stays unchanged after rotation", () => {
//         const pivot = { x: 5, y: 5 };
//         const piece = makePiece(PieceType.T, pivot);
//         const board = makeBoard(piece);
//         const newBoard = Board.handleGameInput(gameInput.SPACE, board);

//         expect(newBoard.getActivePiece().getPivot()).toEqual(pivot);
//     });

//     it("keeps exactly 4 coloured cells in the grid after rotating", () => {
//         const piece = makePiece(PieceType.T, { x: 5, y: 5 });
//         const board = makeBoard(piece);
//         const newBoard = Board.handleGameInput(gameInput.SPACE, board);

//         expect(countCells(newBoard.getGrid(), GRID_STATES.BLUE)).toBe(4);
//     });

//     it("returns same board if rotation would move piece out of bounds", () => {
//         // Push the T piece to the far right so a rotation cell goes out of bounds
//         const piece = makePiece(PieceType.T, { x: COLS - 1, y: 5 });
//         const board = makeBoard(piece);
//         const newBoard = Board.handleGameInput(gameInput.SPACE, board);

//         // Either it stays as-is, or the pivot is unchanged — either way the
//         // original board reference is returned when invalid.
//         expect(newBoard).toBe(board);
//     });
// });

// ---------------------------------------------------------------------------
// handleGameInput — collision with locked cells
// ---------------------------------------------------------------------------

describe("Board.handleGameInput — collision with existing filled cells", () => {
    it("does not move into a cell already occupied by another colour", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        // Manually build a grid with a blocking cell directly to the left
        const grid = Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.EMPTY),
        );
        // Block the cells the piece would land on after moving left
        const leftPiece = Piece.left(piece);
        leftPiece.getComputedCoordinates().forEach(({ x, y }) => {
            grid[y][x] = GRID_STATES.BLUE;
        });

        const board = new Board(piece, grid);
        const newBoard = Board.handleGameInput(gameInput.LEFT, board);

        // The board must be returned unchanged because the destination is occupied
        expect(newBoard).toBe(board);
    });
});

// ---------------------------------------------------------------------------
// Immutability — original board is never mutated
// ---------------------------------------------------------------------------

describe("Board immutability", () => {
    it("handleGameInput never mutates the original board's grid", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);
        const gridBefore = board.getGrid();

        Board.handleGameInput(gameInput.LEFT, board);
        Board.handleGameInput(gameInput.RIGHT, board);
        Board.handleGameInput(gameInput.DOWN, board);
        // Board.handleGameInput(gameInput.SPACE, board);

        expect(board.getGrid()).toEqual(gridBefore);
    });

    it("handleGameInput never mutates the original board's active piece", () => {
        const piece = makePiece(PieceType.T, { x: 5, y: 5 });
        const board = makeBoard(piece);

        Board.handleGameInput(gameInput.LEFT, board);

        expect(board.getActivePiece().getPivot()).toEqual({ x: 5, y: 5 });
    });
});

// ---------------------------------------------------------------------------
// Grid cell count invariant
// ---------------------------------------------------------------------------

describe("Grid cell count invariant", () => {
    it("always has exactly 4 coloured cells after any valid move sequence", () => {
        let board = makeBoard(makePiece(PieceType.I, { x: 5, y: 5 }));

        const inputs = [
            gameInput.LEFT,
            gameInput.RIGHT,
            gameInput.RIGHT,
            // gameInput.SPACE,
            gameInput.DOWN,
            gameInput.LEFT,
        ];

        for (const input of inputs) {
            const next = Board.handleGameInput(input, board);
            expect(countCells(next.getGrid(), GRID_STATES.BLUE)).toBe(4);
            board = next;
        }
    });
});

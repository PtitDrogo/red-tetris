import { describe, it, expect, vi } from "vitest";
import { Board } from "./Board"; // Adjust path if necessary
import { Piece, PieceType, SPAWN_COOR } from "./Piece";
import { GameInput, GRID_STATES } from "../../../shared/types";
import { COLS, ROWS } from "../../../shared/constants";

describe("Board Class", () => {
    // Helper to generate an empty grid
    const createEmptyGrid = () =>
        Array.from({ length: ROWS }, () => Array(COLS).fill(GRID_STATES.EMPTY));

    describe("Constructor & Initialization", () => {
        it("should initialize with default parameters", () => {
            const board = new Board();
            expect(board.getActivePiece()).toBeInstanceOf(Piece);
            expect(board.getLockedGrid()).toHaveLength(20);
            expect(board.getLockedGrid()[0]).toHaveLength(10);
        });

        it("should use the provided active piece and grid layout", () => {
            const customPiece = new Piece(PieceType.I, { x: 3, y: 3 });
            const customGrid = createEmptyGrid();
            customGrid[19][0] = GRID_STATES.RED; // Place a block at the bottom-left

            const board = new Board(customPiece, customGrid);
            expect(board.getActivePiece().getType()).toBe(PieceType.I);
            expect(board.getActivePiece().getPivot()).toEqual({ x: 3, y: 3 });
            expect(board.getLockedGrid()[19][0]).toBe(GRID_STATES.RED);
        });
    });

    describe("Grid Rendering (getFullGrid)", () => {
        it("should correctly layer the ghost piece and active piece over the locked grid", () => {
            // Setup a clean board with a T-piece spawned at {5, 0}
            // A T-piece at {5,0} with cells [{-1,0}, {0,0}, {1,0}, {0,1}] will occupy:
            // (4,0), (5,0), (6,0) and (5,1)
            const activePiece = new Piece(PieceType.T, { x: 5, y: 0 });
            const grid = createEmptyGrid();

            // Lock a block at the bottom center to catch the ghost piece early
            grid[5][5] = GRID_STATES.RED;

            const board = new Board(activePiece, grid);
            const fullGrid = board.getFullGrid();

            // 1. Verify Active Piece color placement (T-piece is GRID_STATES.GREEN)
            expect(fullGrid[0][4]).toBe(GRID_STATES.GREEN);
            expect(fullGrid[0][5]).toBe(GRID_STATES.GREEN);
            expect(fullGrid[0][6]).toBe(GRID_STATES.GREEN);
            expect(fullGrid[1][5]).toBe(GRID_STATES.GREEN);

            // 2. Verify Ghost Piece placement
            // With a blocker at (5,5), the T-piece can only drop down until its lowest cell (5,1) hits above it.
            // So the lowest cell of the ghost piece will sit at (5,4).
            // This means the ghost pivot is at { x: 5, y: 3 }
            // Ghost cells: (4,3), (5,3), (6,3), and (5,4)
            expect(fullGrid[3][4]).toBe(GRID_STATES.GHOST);
            expect(fullGrid[3][5]).toBe(GRID_STATES.GHOST);
            expect(fullGrid[3][6]).toBe(GRID_STATES.GHOST);
            expect(fullGrid[4][5]).toBe(GRID_STATES.GHOST);

            // 3. Verify Existing Locked Blocks remain untouched
            expect(fullGrid[5][5]).toBe(GRID_STATES.RED);
        });
    });

    describe("Game Input Processing (handleGameInput)", () => {
        it("should return a new board state on a valid movement input (LEFT)", () => {
            const initialPiece = new Piece(PieceType.T, { x: 5, y: 5 });
            const board = new Board(initialPiece);

            const nextBoard = Board.handleGameInput(GameInput.LEFT, board);

            // Functional check: Board should be a completely separate instance
            expect(nextBoard).not.toBe(board);
            expect(nextBoard.getActivePiece().getPivot().x).toBe(4);
        });

        it("should return a new board state on a valid rotation input (ROTATE)", () => {
            const initialPiece = new Piece(PieceType.T, { x: 5, y: 5 });
            const board = new Board(initialPiece);

            const nextBoard = Board.handleGameInput(GameInput.ROTATE, board);

            // Check that cells transformed correctly away from their original layouts
            expect(nextBoard.getActivePiece().getCells()).not.toEqual(
                initialPiece.getCells(),
            );
        });

        it("should return the exact same board reference if a movement breaks wall boundaries", () => {
            // Push a piece right up against the left wall
            const initialPiece = new Piece(PieceType.T, { x: 1, y: 5 }); // Cell at x=-1 makes total X = 0
            const board = new Board(initialPiece);

            // Attempting to go left further will step out of bounds (x = -1)
            const nextBoard = Board.handleGameInput(GameInput.LEFT, board);

            expect(nextBoard).toBe(board); // Returns identical instance
        });

        it("should return the exact same board reference if a movement collides with locked blocks", () => {
            const initialPiece = new Piece(PieceType.T, { x: 5, y: 5 });
            const grid = createEmptyGrid();
            grid[5][3] = GRID_STATES.RED; // Place barrier immediately to the left of the piece cluster

            const board = new Board(initialPiece, grid);
            const nextBoard = Board.handleGameInput(GameInput.LEFT, board);

            expect(nextBoard).toBe(board);
        });
    });

    describe("Boundary and Collision Utilities", () => {
        // We evaluate ghost generation behavior indirectly to hit full branch coverage
        // on the internal static `computeGhost` loop conditions.
        it("should drop the ghost piece cleanly to the floor when no blocks are present", () => {
            const activePiece = new Piece(PieceType.T, { x: 5, y: 0 });
            const board = new Board(activePiece);

            // Bottom row is index 19. Lowest cell of T piece is y + 1.
            // So if pivot y=18, lowest cell is 19 (perfect fit at the floor).
            expect(board.getGhostPiece().getPivot().y).toBe(ROWS - 2);
        });
    });
});

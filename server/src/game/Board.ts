import { COLS, ROWS } from "../../../shared/constants";
import { GameInput, GRID_STATES } from "../../../shared/types";
import { Coordinate, Piece, PieceType, Shapes, SPAWN_COOR } from "./Piece";

export class Board {
    private lockedGrid: number[][];
    private activePiece: Piece;
    private ghostPiece: Piece;
    private isDead: boolean = false;

    constructor(activePiece?: Piece, grid?: number[][]) {
        this.lockedGrid =
            grid ??
            Array.from({ length: ROWS }, () =>
                Array(COLS).fill(GRID_STATES.EMPTY),
            );
        this.activePiece = activePiece ?? new Piece(PieceType.T, SPAWN_COOR); //TODO implement bag system
        this.ghostPiece = Board.computeGhost(this.activePiece, this.lockedGrid);

        this.lockedGrid = Board.handleNewGameState(this.lockedGrid);
    }

    getActivePiece() {
        return this.activePiece;
    }

    getIsDead() {
        return this.isDead;
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

    //Todo, make the checking of the bool pure somehow later.
    private static handleNewGameState(grid: number[][]): number[][] {
        //Main idea, when you create a new board, youll be given a grid, but maybe
        //the board will be wrong, the piece will be clashing with currently existing
        // Cells.
        //So we try to push it up top by one.
        //If we cant push it by one, probably means its gg
        //Also - If theres a full grid, we get rid of it
        //What we do first is the check for if its clashing with the grid.

        //I have 12 minutes Im doing the line check first.

        grid.map((line) => {
            const isFull = line.every((cell) => {
                cell !== GRID_STATES.EMPTY && cell !== GRID_STATES.GHOST;
            });
        });

        const filteredRows = grid.filter((row) =>
            row.every(
                (cell) =>
                    cell !== GRID_STATES.EMPTY && cell !== GRID_STATES.GHOST,
            ),
        );

        const numRemovedRows = grid.length - filteredRows.length;

        const emptyRows = Array.from({ length: numRemovedRows }, () =>
            new Array(COLS).fill(GRID_STATES.EMPTY),
        );
        //Also need to handle that the other board are going to be penalized by me owning.

        return [...emptyRows, ...filteredRows];
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(newInput: GameInput, board: Board): Board {
        const oldPiece = board.getActivePiece();

        if (newInput === GameInput.SPACE) {
            const newLocked = board.getLockedGrid();
            board
                .getGhostPiece()
                .getComputedCoordinates()
                .forEach(({ x, y }) => {
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

        const newPiece = moves[newInput]();
        const isValid = newPiece
            .getComputedCoordinates()
            .every(
                ({ x, y }) =>
                    this.isCoordinateInBound({ x, y }) &&
                    board.getLockedGrid()[y][x] === GRID_STATES.EMPTY,
            );

        if (!isValid) return board;

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

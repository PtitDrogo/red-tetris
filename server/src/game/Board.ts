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
    private creationTimeStamp: number; //When a new Piece is created, this value will always be that.

    constructor(
        creationTimeStamp: number,
        activePiece?: Piece,
        grid?: number[][],
    ) {
        this.creationTimeStamp = creationTimeStamp;
        this.lockedGrid = Board.handleFilledRows(
            grid ?? Board.createEmptyGrid(),
        );
        this.activePiece = activePiece ?? new Piece(PieceType.T, SPAWN_COOR); //TODO implement bag system
        this.isAlive = Board.isBoardAlive(this, this.activePiece);
        this.ghostPiece = Board.computeGhost(this.activePiece, this.lockedGrid);
    }

    private static createEmptyGrid() {
        return Array.from({ length: ROWS }, () =>
            Array(COLS).fill(GRID_STATES.EMPTY),
        );
    }

    private static isBoardAlive(board: Board, piece: Piece): boolean {
        const coordinates = Piece.getComputedCoordinates(
            piece.getPivot(),
            piece.getCells(),
        );
        const isAlive = Board.isValidCoordinates(
            coordinates,
            board.getLockedGrid(),
        );
        return isAlive;
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

        Piece.getComputedCoordinates(
            this.ghostPiece.getPivot(),
            this.ghostPiece.getCells(),
        ).forEach(({ x, y }) => {
            if (display[y][x] === GRID_STATES.EMPTY)
                display[y][x] = GRID_STATES.GHOST;
        });
        Piece.getComputedCoordinates(
            this.activePiece.getPivot(),
            this.activePiece.getCells(),
        ).forEach(({ x, y }) => {
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

    //Return the piece if it fits, otherwise pushes it by one.
    //ONLY USE THIS WITH DOWN COMMAND
    private static handleActivePieceCollision(
        grid: number[][],
        activePiece: Piece,
    ): Piece {
        const pieceCoordinates = Piece.getComputedCoordinates(
            activePiece.getPivot(),
            activePiece.getCells(),
        );
        if (Board.isValidCoordinates(pieceCoordinates, grid))
            return activePiece;

        const newPivot: Coordinate = {
            x: activePiece.getPivot().x,
            y: activePiece.getPivot().y - 1,
        };

        const newCoordinates = Piece.getComputedCoordinates(
            newPivot,
            activePiece.getCells(),
        );
        return new Piece(activePiece.getType(), newPivot, newCoordinates);
    }

    //This either returns a Board with the new Piece and returns the board unchanged if newPiece isnt valid.
    static handleGameInput(
        newInput: GameInput,
        board: Board,
        currTime: number,
    ): Board {
        const oldPiece = board.getActivePiece();

        if (newInput === GameInput.SPACE) {
            const newLocked = board.getLockedGrid();
            const ghostPiece = board.getGhostPiece();
            Piece.getComputedCoordinates(
                ghostPiece.getPivot(),
                ghostPiece.getCells(),
            ).forEach(({ x, y }) => {
                newLocked[y][x] = oldPiece.getColor();
            });
            const pieceTypes = Object.keys(Shapes) as PieceType[];
            const randomPieceType =
                pieceTypes[Math.floor(Math.random() * pieceTypes.length)]; //TODO, remove math.random().
            const newBoard = new Board(
                currTime,
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
            const validatedPiece = Board.handleActivePieceCollision(
                grid,
                piece,
            );
            return new Board(currTime, validatedPiece, grid);
        }

        const isValid = Board.isValidCoordinates(
            Piece.getComputedCoordinates(piece.getPivot(), piece.getCells()),
            grid,
        );
        if (!isValid) return board;

        return new Board(currTime, piece, grid);
        //If the input is down and its trying to go into an invalid position, it means we need to lock its
        //coordinates to the grid one position above (which should be valid) and then we create a new Board
        //With a new random Piece.

        //the game loop should call handlegameInput every X MS.

        //Option 1:
        //Its the job of handleGameInput to realise that when a Piece is "Validated"
        //If it realises that, it prints the piece to the grid, then will create a new piece and create a new board with the new piece.

        //Option 2:
        //Its the job of Board constructor to realise when a Piece is "validated"
        //when a board creates an active Piece thats down, it adds its coordinate one up to the grid, then it create a new Piece.
        //Typing it out it feels silly. Its not even helping making in preventing an impossible Board object because
        //the board will still have the job of looking at its grid and active piece to determine if it has lost the game.

        //Going with Option 1, especially considering I already do it for "space"
    }

    private static computeGhost(piece: Piece, grid: number[][]): Piece {
        let candidate = piece;
        while (true) {
            const next = Piece.down(candidate);
            const isValid = Piece.getComputedCoordinates(
                next.getPivot(),
                next.getCells(),
            ).every(
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

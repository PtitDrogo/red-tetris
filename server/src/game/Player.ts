import { gameInput } from "../../../shared/types";
import { Board } from "./Board";
import { Piece } from "./Piece";

export class Player {
    private socketId: string;
    private activePiece: Piece;
    private board: Board;

    constructor(socketId: string, activePiece: Piece, board: Board) {
        this.socketId = socketId;
        this.activePiece = activePiece;
        this.board = board;
    }

    getSocketId() {
        return this.socketId;
    }

    //This needs to check against the board actually.
    static handleInput(player: Player, input: gameInput): Player {
        let newPiece = null;
        
        switch (input) {
            case gameInput.LEFT:
                newPiece = Piece.left(player.activePiece);
                break;
                
            case gameInput.RIGHT:
                newPiece = Piece.right(player.activePiece);
                break;
                
            case gameInput.DOWN:
                newPiece = Piece.down(player.activePiece);
                break;
                
            case gameInput.SPACE:
                newPiece = Piece.rotate(player.activePiece);
                break;
        }

        

        return new Player(player.socketId, newPiece, player.board);

    }
}

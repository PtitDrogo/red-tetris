import { GameInput } from "../../../shared/types";
import { gameService } from "../services/GameService";
import { SocketType } from "../types/types";
import { isGameInput } from "../validators/gameInput";

export class InputController {
    //This is where I will handle all inputs
    //Which are
    //Move right/left
    // Go down a bit
    // Go down the entire thing
    // rotate (Theres actually only one Rotate in Tetris ?? Nice !)

    static handleInput(socket: SocketType, input: unknown) {
        if (!isGameInput(input)) {
            throw new Error("Given game input is not valid.");
        }

        //Find the game with the socket Type

        const game = gameService.findGame(socket.id);
        if (!game) {
            throw new Error("Could not find the game");
        }

        game.

        // switch (input) {
        //     case GameInput.DOWN:
        //         break;
        //     case GameInput.LEFT:
        //         break;
        //     case GameInput.RIGHT:
        //         break;
        //     case GameInput.SPACE:
        //         break;

        //     default:
        //         throw new Error("Unexpected error");
        // }
    }
}

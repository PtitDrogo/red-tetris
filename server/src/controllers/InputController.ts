import { gameService } from "../services/GameService";
import { SocketType } from "../types/types";
import { isGameInput } from "../validators/gameInput";

export class InputController {
    static handleInput(socket: SocketType, input: unknown) {
        console.log("yo input is", input)
        if (!isGameInput(input)) {
            throw new Error("Given game input is not valid.");
        }
        console.log("Its a valid Input !")
        const game = gameService.findGame(socket.id);
        if (!game) {
            throw new Error("Could not find the game");
        }
        game.handleGameInput(input, socket.id);
    }
}

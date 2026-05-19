import { GameInput } from "../../../shared/types";

export function isGameInput(value: unknown): value is GameInput {
    return typeof value === "number" && value in GameInput;
}

import { GameInput } from "../../../shared/types.js";

export function isGameInput(value: unknown): value is GameInput {
    return (
        typeof value === "number" &&
        !isNaN(value) &&
        Object.values(GameInput).includes(value)
    );
}

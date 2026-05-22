import { GameInput } from "../../../shared/types";

export function isGameInput(value: unknown): value is GameInput {
    const num = typeof value === "string" ? Number(value) : value;

    return (
        typeof num === "number" &&
        !isNaN(num) &&
        Object.values(GameInput).includes(num)
    );
}

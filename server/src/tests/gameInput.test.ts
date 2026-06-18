import { describe, it, expect } from "vitest";
import { GameInput } from "../../../shared/types.js";
import { isGameInput } from "../validators/gameInput.js";

describe("isGameInput", () => {
    describe("Valid Inputs", () => {
        it("should return true for valid GameInput enum values", () => {
            const validValues = Object.values(GameInput).filter(
                (val) => typeof val === "number",
            );

            validValues.forEach((value) => {
                expect(isGameInput(value)).toBe(true);
            });
        });
    });

    describe("Invalid Numbers", () => {
        it("should return false for numbers not in the GameInput enum", () => {
            expect(isGameInput(99999)).toBe(false);
            expect(isGameInput(-1)).toBe(false);
        });

        it("should return false for NaN", () => {
            expect(isGameInput(NaN)).toBe(false);
        });
    });

    describe("Invalid Types", () => {
        it("should return false for strings", () => {
            expect(isGameInput("1")).toBe(false);
            expect(isGameInput("GameInput")).toBe(false);
        });

        it("should return false for booleans", () => {
            expect(isGameInput(true)).toBe(false);
            expect(isGameInput(false)).toBe(false);
        });

        it("should return false for objects and arrays", () => {
            expect(isGameInput({})).toBe(false);
            expect(isGameInput([1])).toBe(false);
        });

        it("should return false for null and undefined", () => {
            expect(isGameInput(null)).toBe(false);
            expect(isGameInput(undefined)).toBe(false);
        });
    });
});

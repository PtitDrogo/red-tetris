import { describe, it, expect } from "vitest";
import { Piece, PieceType, Shapes } from "./Piece";

// ─── Constructor ─────────────────────────────────────────────────────────────

describe("Piece constructor", () => {
    it("sets type and pivot", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 0 });
        expect(piece.getType()).toBe(PieceType.T);
        expect(piece.getPivot()).toEqual({ x: 5, y: 0 });
    });

    it("uses default cells from Shapes when no cells are provided", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 0 });
        expect(piece.getCells()).toEqual(Shapes[PieceType.T].cells);
    });

    it("uses provided cells when explicitly passed", () => {
        const customCells = [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
        ];
        const piece = new Piece(PieceType.T, { x: 5, y: 0 }, customCells);
        expect(piece.getCells()).toEqual(customCells);
    });

    it("initialises all 7 piece types without throwing", () => {
        for (const type of Object.values(PieceType)) {
            expect(() => new Piece(type, { x: 0, y: 0 })).not.toThrow();
        }
    });
});

// ─── Purity ──────────────────────────────────────────────────────────────────

describe("purity — no mutation of the original piece", () => {
    it("down does not mutate the original piece", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        Piece.down(piece);
        expect(piece.getPivot()).toEqual({ x: 5, y: 5 });
    });

    it("left does not mutate the original piece", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        Piece.left(piece);
        expect(piece.getPivot()).toEqual({ x: 5, y: 5 });
    });

    it("right does not mutate the original piece", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        Piece.right(piece);
        expect(piece.getPivot()).toEqual({ x: 5, y: 5 });
    });

    it("rotate does not mutate the original piece's cells", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        const originalCells = piece.getCells().map((c) => ({ ...c }));
        Piece.rotate(piece);
        expect(piece.getCells()).toEqual(originalCells);
    });
});

// ─── Movement ────────────────────────────────────────────────────────────────

describe("Piece.down", () => {
    it("decrements pivot y by 1", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.down(piece).getPivot()).toEqual({ x: 5, y: 4 });
    });

    it("preserves pivot x", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.down(piece).getPivot().x).toBe(5);
    });

    it("preserves type and cells", () => {
        const piece = new Piece(PieceType.I, { x: 5, y: 5 });
        const result = Piece.down(piece);
        expect(result.getType()).toBe(PieceType.I);
        expect(result.getCells()).toEqual(Shapes[PieceType.I].cells);
    });

    it("returns a new Piece instance", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.down(piece)).not.toBe(piece);
    });
});

describe("Piece.left", () => {
    it("decrements pivot x by 1", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.left(piece).getPivot()).toEqual({ x: 4, y: 5 });
    });

    it("preserves pivot y", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.left(piece).getPivot().y).toBe(5);
    });

    it("returns a new Piece instance", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.left(piece)).not.toBe(piece);
    });
});

describe("Piece.right", () => {
    it("increments pivot x by 1", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.right(piece).getPivot()).toEqual({ x: 6, y: 5 });
    });

    it("preserves pivot y", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.right(piece).getPivot().y).toBe(5);
    });

    it("returns a new Piece instance", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.right(piece)).not.toBe(piece);
    });
});

// ─── Rotation ────────────────────────────────────────────────────────────────

describe("Piece.rotate", () => {
    it("applies 90° clockwise rotation: (x, y) → (y, -x)", () => {
        const cells = [{ x: 1, y: 0 }];
        const piece = new Piece(PieceType.T, { x: 5, y: 5 }, cells);
        expect(Piece.rotate(piece).getCells()).toEqual([{ x: 0, y: -1 }]);
    });

    it("preserves the pivot", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.rotate(piece).getPivot()).toEqual({ x: 5, y: 5 });
    });

    it("preserves the type", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.rotate(piece).getType()).toBe(PieceType.T);
    });

    it("returns a new Piece instance", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.rotate(piece)).not.toBe(piece);
    });

    // ─── Dynamic tests for all shapes ────────────────────────────────────────

    const allShapes = Object.values(PieceType);

    describe.each(allShapes)("%s piece rotation behavior", (type) => {
        it("returns to the original shape after 4 rotations", () => {
            const piece = new Piece(type, { x: 5, y: 5 });
            const result = Piece.rotate(
                Piece.rotate(Piece.rotate(Piece.rotate(piece))),
            );
            expect(result.getCells()).toEqual(piece.getCells());
        });
    });

    // ─── Special rules checking ─────────────

    it("I piece: 2 rotations return to the original shape", () => {
        const piece = new Piece(PieceType.I, { x: 5, y: 5 });
        expect(Piece.rotate(Piece.rotate(piece)).getCells()).toEqual(
            piece.getCells(),
        );
    });

    it("O piece: remains entirely unchanged on any rotation", () => {
        const piece = new Piece(PieceType.O, { x: 5, y: 5 });
        expect(Piece.rotate(piece).getCells()).toEqual(piece.getCells());
    });
});

// ─── Chaining ────────────────────────────────────────────────────────────────

describe("chaining moves", () => {
    it("left then right returns to original pivot", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        expect(Piece.right(Piece.left(piece)).getPivot()).toEqual(
            piece.getPivot(),
        );
    });

    it("multiple downs accumulate correctly", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 10 });
        expect(Piece.down(Piece.down(Piece.down(piece))).getPivot()).toEqual({
            x: 5,
            y: 7,
        });
    });

    it("move then rotate preserves the rotated cells", () => {
        const piece = new Piece(PieceType.T, { x: 5, y: 5 });
        const result = Piece.rotate(Piece.left(piece));
        expect(result.getCells()).not.toEqual(Shapes[PieceType.T].cells);
        expect(result.getPivot()).toEqual({ x: 4, y: 5 });
    });
});

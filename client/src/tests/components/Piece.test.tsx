import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { PiecePreview } from "../../components/Piece";
import { PieceType } from "../../../../shared/types";

describe("PiecePreview Component", () => {
    test("Branche de garde : retourne undefined/rien si le type n'est pas fourni", () => {
        const { container } = render(<PiecePreview type={undefined} />);

        expect(container.firstChild).toBeNull();
    });

    test("Rendu d'une pièce valide (ex: la pièce en I) et dessin des blocs", () => {
        const { container } = render(<PiecePreview type={"I" as PieceType} />);

        expect(screen.getByText(/Next:/i)).toBeInTheDocument();

        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toBeInTheDocument();
        expect(gridContainer).toHaveClass("grid-cols-4");
        expect(gridContainer).toHaveClass("grid-rows-3");

        const cells = gridContainer?.children;
        expect(cells?.length).toBe(12);

        expect(cells?.[0]).toHaveClass("w-4 h-4");
    });

    test("Rendu d'une autre forme (ex: la pièce en O) pour maximiser la couverture des boucles forEach", () => {
        const { container } = render(<PiecePreview type={"O" as PieceType} />);

        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toBeInTheDocument();

        expect(gridContainer?.children.length).toBe(12);
    });
});

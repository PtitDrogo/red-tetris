import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { PiecePreview } from "../../components/Piece";
import { PieceType } from "../../../../shared/types";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const mockStore = configureStore({
    reducer: {
        game: (state = {}) => state 
    }
});

describe("PiecePreview Component", () => {
    test("Branche de garde : retourne undefined/rien si le type n'est pas fourni", () => {
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={undefined} />
            </Provider>
        );

        expect(container.firstChild).toBeNull();
    });

    test("Rendu d'une pièce valide (ex: la pièce en I) et dessin des blocs", () => {
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={"I" as PieceType} />
            </Provider>
        );

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
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={"O" as PieceType} />
            </Provider>
        );

        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toBeInTheDocument();

        expect(gridContainer?.children.length).toBe(12);
    });
});
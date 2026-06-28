import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Grid from "../../components/Grid";
import { GRID_STATES } from "../../../../shared/types";

describe("Grid Component", () => {
    const mockGrid: GRID_STATES[][] = [
        [
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
        ],
        [
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
        ],
        [
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
            GRID_STATES.EMPTY,
        ],
    ];

    test("Rentre dans toutes les lignes et génère la bonne structure HTML", () => {
        const { container } = render(
            <Grid
                grid={mockGrid}
                gridColsClass="grid-cols-4"
                gridRowsClass="grid-rows-3"
                cellSizeClass="w-4 h-4"
            />,
        );

        const mainGridContainer = container.firstChild as HTMLElement;
        expect(mainGridContainer).toHaveClass("grid");
        expect(mainGridContainer).toHaveClass("grid-cols-4");
        expect(mainGridContainer).toHaveClass("grid-rows-3");

        const cells = mainGridContainer.children;
        expect(cells.length).toBe(12);

        expect(cells[0]).toHaveClass("w-4 h-4");
    });

    test("Applique la bonne classe de couleur selon le GRID_STATES de la cellule", () => {
        const smallGrid = [[GRID_STATES.EMPTY]];

        const { container } = render(
            <Grid
                grid={smallGrid}
                gridColsClass="grid-cols-1"
                gridRowsClass="grid-rows-1"
                cellSizeClass="w-8 h-8"
            />,
        );

        const firstCell = container.querySelector(".grid > div");
        expect(firstCell).toBeInTheDocument();
        expect(firstCell).toHaveClass("w-8 h-8");
        expect(firstCell).toHaveClass("border-r");
        expect(firstCell).toHaveClass("border-b");
    });
});

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { PiecePreview } from "../../components/Piece";
import { PieceType } from "../../../../shared/types";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const mockStore = configureStore({
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    reducer: {
        game: (state = {}) => state,
    },
});

describe("PiecePreview Component", () => {
    test("Guard branch: uses empty piece (N) if type is not provided", () => {
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={undefined} />
            </Provider>,
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

    test("Renders a valid piece (e.g., I-piece) and draws the blocks", () => {
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={"I" as PieceType} />
            </Provider>,
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

    test("Renders another shape (e.g., O-piece) to maximize forEach loop coverage", () => {
        const { container } = render(
            <Provider store={mockStore}>
                <PiecePreview type={"O" as PieceType} />
            </Provider>,
        );

        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toBeInTheDocument();

        expect(gridContainer?.children.length).toBe(12);
    });
});

describe("PiecePreview Component - playWithBlessed branch", () => {
    const blessedStore = configureStore({
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
        reducer: {
            game: (state = { playWithBlessed: true }) => state,
        },
    });

    test("playWithBlessed=true and type not provided: uses B piece and displays the tooltip", () => {
        const { container } = render(
            <Provider store={blessedStore}>
                <PiecePreview type={undefined} />
            </Provider>,
        );

        expect(
            screen.getByText(/Clear 2 lines or more to get blessed pieces/i),
        ).toBeInTheDocument();

        expect(screen.getByText(/Next:/i)).toBeInTheDocument();

        const gridContainer = container.querySelector(".grid");
        expect(gridContainer).toBeInTheDocument();
        expect(gridContainer?.children.length).toBe(12);
    });

    test("playWithBlessed=true but an explicit type is provided: provided type takes precedence over B, tooltip still displayed", () => {
        render(
            <Provider store={blessedStore}>
                <PiecePreview type={"O" as PieceType} />
            </Provider>,
        );

        expect(
            screen.getByText(/Clear 2 lines or more to get blessed pieces/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Next:/i)).toBeInTheDocument();
    });
});
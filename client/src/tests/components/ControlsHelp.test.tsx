import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ControlsHelp } from "../../components/ControlsHelp";

describe("ControlsHelp Component", () => {
    test("Affiche toutes les touches et leurs actions associées", () => {
        render(<ControlsHelp />);

        expect(screen.getByText("←")).toBeInTheDocument();
        expect(screen.getByText("→")).toBeInTheDocument();
        expect(screen.getByText("Move")).toBeInTheDocument();

        expect(screen.getByText("↑")).toBeInTheDocument();
        expect(screen.getByText("Rotate")).toBeInTheDocument();

        expect(screen.getByText("↓")).toBeInTheDocument();
        expect(screen.getByText("Drop")).toBeInTheDocument();

        expect(screen.getByText("Space")).toBeInTheDocument();
        expect(screen.getByText("Hard Drop")).toBeInTheDocument();
    });

    test("Utilise des éléments <kbd> pour chaque touche", () => {
        const { container } = render(<ControlsHelp />);
        const kbdElements = container.querySelectorAll("kbd");
        expect(kbdElements.length).toBe(5);
    });
});

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { ControlsHelp } from "../../components/ControlsHelp";

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe("ControlsHelp Component", () => {
    test("Show all keys and their associated actions", () => {
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

    test("Use <kbd> elements for each key", () => {
        const { container } = render(<ControlsHelp />);
        const kbdElements = container.querySelectorAll("kbd");
        expect(kbdElements.length).toBe(5);
    });
});

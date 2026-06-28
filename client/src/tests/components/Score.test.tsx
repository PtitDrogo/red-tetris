import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { Score } from "../../components/Score";

describe("Score Component", () => {
    test("Rentre dans la branche standard : affiche le score et le niveau si fournis", () => {
        render(<Score score={1250} level={4} />);

        expect(screen.getByText("Score: 1250")).toBeInTheDocument();

        expect(screen.getByText("Level: 4")).toBeInTheDocument();
    });

    test("Branche conditionnelle : n'affiche pas le niveau si la prop level est absente (undefined)", () => {
        render(<Score score={450} level={undefined} />);

        expect(screen.getByText("Score: 450")).toBeInTheDocument();

        expect(screen.queryByText(/Level:/i)).toBeNull();
    });
});

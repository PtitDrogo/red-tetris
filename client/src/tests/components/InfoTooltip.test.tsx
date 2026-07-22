import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { InfoTooltip } from "../../components/ToolTip";

describe("InfoTooltip", () => {
    it("renders the provided message text", () => {
        render(<InfoTooltip message="This is some helpful info" />);
        expect(
            screen.getByText("This is some helpful info"),
        ).toBeInTheDocument();
    });

    it("renders the info icon (BadgeInfo svg)", () => {
        const { container } = render(<InfoTooltip message="Hello" />);
        const icon = container.querySelector("svg");
        expect(icon).toBeInTheDocument();
    });

    it("keeps the tooltip text hidden until the group is hovered", () => {
        render(<InfoTooltip message="Hover me" />);
        const tooltipText = screen.getByText("Hover me");
        expect(tooltipText).toHaveClass("hidden", "group-hover:block");
    });

    it("updates the displayed message when re-rendered with a new prop", () => {
        const { rerender } = render(<InfoTooltip message="First message" />);
        expect(screen.getByText("First message")).toBeInTheDocument();

        rerender(<InfoTooltip message="Second message" />);
        expect(screen.getByText("Second message")).toBeInTheDocument();
        expect(screen.queryByText("First message")).not.toBeInTheDocument();
    });

    it("wraps the icon and tooltip in a relatively positioned group container", () => {
        const { container } = render(
            <InfoTooltip message="Positioning check" />,
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass("relative", "inline-flex", "group");
    });

    it("renders without crashing for an empty message string", () => {
        const { container } = render(<InfoTooltip message="" />);
        expect(container.querySelector("svg")).toBeInTheDocument();
    });
});

import { describe, it, expect } from "vitest";
import { add } from "./DummyMath";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("handles zero", () => {
    expect(add(0, 5)).toBe(5);
  });
});

import { describe, it, expect } from "vitest";
import { addServer } from "./DummyServerMath";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(addServer(1, 2)).toBe(3);
  });

  it("handles zero", () => {
    expect(addServer(0, 5)).toBe(5);
  });
});

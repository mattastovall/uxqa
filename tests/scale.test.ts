import { describe, expect, it } from "vitest";
import { calculateScale } from "../src/scale.js";

describe("calculateScale", () => {
  it("contains the screen in both dimensions", () => {
    expect(calculateScale({ available: { width: 200, height: 300 }, screen: { width: 400, height: 400 } })).toBe(0.5);
    expect(calculateScale({ available: { width: 1000, height: 450 }, screen: { width: 1440, height: 900 } })).toBe(0.5);
  });

  it("does not enforce a minimum that can overflow", () => {
    expect(calculateScale({ available: { width: 1, height: 1 }, screen: { width: 1440, height: 900 } })).toBeCloseTo(1 / 1440);
  });

  it("returns zero for unusable measurements and never enlarges", () => {
    expect(calculateScale({ available: { width: 0, height: 100 }, screen: { width: 100, height: 100 } })).toBe(0);
    expect(calculateScale({ available: { width: 1000, height: 1000 }, screen: { width: 100, height: 100 } })).toBe(1);
  });
});

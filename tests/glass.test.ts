import { describe, expect, it } from "vitest";
import { createCapsuleDisplacementPixels } from "../src/glass.js";

function channelAt(pixels: Uint8ClampedArray, width: number, x: number, y: number, channel: 0 | 1 | 2 | 3): number {
  return pixels[(y * width + x) * 4 + channel] ?? -1;
}

describe("Safari glass displacement map", () => {
  it("keeps the center neutral and bends opposite edges inward", () => {
    const width = 80;
    const height = 40;
    const pixels = createCapsuleDisplacementPixels({ width, height });

    expect(channelAt(pixels, width, 40, 20, 0)).toBeCloseTo(128, 0);
    expect(channelAt(pixels, width, 40, 20, 1)).toBeCloseTo(128, 0);
    expect(channelAt(pixels, width, 1, 20, 0)).toBeGreaterThan(200);
    expect(channelAt(pixels, width, 78, 20, 0)).toBeLessThan(56);
    expect(channelAt(pixels, width, 40, 1, 1)).toBeGreaterThan(200);
    expect(channelAt(pixels, width, 40, 38, 1)).toBeLessThan(56);
  });

  it("leaves pixels outside the capsule transparent", () => {
    const width = 80;
    const pixels = createCapsuleDisplacementPixels({ width, height: 40 });
    expect(channelAt(pixels, width, 0, 0, 3)).toBe(0);
    expect(channelAt(pixels, width, 79, 39, 3)).toBe(0);
  });
});

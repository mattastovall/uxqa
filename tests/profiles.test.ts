import { describe, expect, it } from "vitest";
import {
  BUILT_IN_BROWSERS,
  BUILT_IN_DEVICES,
  DEFAULT_SELECTION,
  getContentRect,
  resolveSimulatorSelection,
  validateProfiles,
} from "../src/profiles.js";

describe("simulator profiles", () => {
  it("defaults to iPhone 16 Safari with automatic chrome", () => {
    expect(DEFAULT_SELECTION).toEqual({ deviceId: "iphone-16", browserId: "safari", chrome: "auto" });
    expect(resolveSimulatorSelection({}).selection).toEqual(DEFAULT_SELECTION);
  });

  it("keeps every built-in content rectangle within its device", () => {
    for (const browser of BUILT_IN_BROWSERS) {
      const device = BUILT_IN_DEVICES.find((candidate) => candidate.id === browser.deviceId);
      expect(device, browser.id).toBeDefined();
      if (!device) continue;
      const rectangles = browser.chrome.kind === "fixed"
        ? [browser.chrome.content]
        : [browser.chrome.expanded, browser.chrome.collapsed];
      for (const rect of rectangles) {
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(device.screen.width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(device.screen.height);
      }
    }
  });

  it("falls back to a device-compatible default browser", () => {
    expect(resolveSimulatorSelection({ deviceId: "pixel", browserId: "safari", chrome: "off" }).selection).toEqual({
      deviceId: "pixel", browserId: "chrome", chrome: "off",
    });
  });

  it("rejects invalid custom geometry with actionable paths", () => {
    const result = validateProfiles({
      devices: [{ id: "tiny", label: "Tiny", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "custom", cornerRadiusPx: 10 }],
      browsers: [{ id: "tiny/custom", browserId: "custom", deviceId: "tiny", label: "Custom", appearance: "custom", chrome: { kind: "fixed", content: { x: 0, y: 0, width: 101, height: 100 } }, calibration: { capturedVersion: "descriptive", capturedAt: "2026-07-11", source: "manual" } }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toContain("browsers[0].chrome.content");
  });

  it("returns fixed, expanded, collapsed, and chrome-off rectangles", () => {
    const fixed = resolveSimulatorSelection({ deviceId: "ipad", browserId: "safari", chrome: "on" });
    expect(getContentRect({ profile: fixed, chromeState: "collapsed" })).toEqual({ x: 0, y: 74, width: 768, height: 930 });
    const linked = resolveSimulatorSelection({ deviceId: "pixel", browserId: "chrome", chrome: "auto" });
    expect(getContentRect({ profile: linked, chromeState: "expanded" })).toEqual({ x: 0, y: 80, width: 412, height: 811 });
    expect(getContentRect({ profile: linked, chromeState: "collapsed" })).toEqual({ x: 0, y: 24, width: 412, height: 867 });
    expect(getContentRect({ profile: { ...linked, selection: { ...linked.selection, chrome: "off" } }, chromeState: "expanded" })).toEqual({ x: 0, y: 0, width: 412, height: 915 });
  });
});

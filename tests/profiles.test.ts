import { describe, expect, it } from "vitest";
import {
  BUILT_IN_BROWSERS,
  BUILT_IN_DEVICES,
  DEFAULT_SELECTION,
  getContentRect,
  resolveSimulatorSelection,
  validateProfiles,
} from "../src/profiles.js";
import type { SimulatorProfiles } from "../src/profiles.js";

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

  it("preserves the explicit calibrated geometry for every built-in pair", () => {
    expect(BUILT_IN_BROWSERS.map(({ id, chrome }) => ({ id, chrome }))).toEqual([
      { id: "iphone-16/safari", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 59, width: 393, height: 741 }, collapsed: { x: 0, y: 59, width: 393, height: 741 }, collapseThresholdPx: 48, expandThresholdPx: 24, transitionMs: 420 } },
      { id: "iphone-16/safari-old", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 59, width: 393, height: 690 }, collapsed: { x: 0, y: 59, width: 393, height: 759 }, collapseThresholdPx: 48, expandThresholdPx: 24, transitionMs: 180 } },
      { id: "iphone-16/instagram", chrome: { kind: "fixed", content: { x: 0, y: 109, width: 393, height: 709 } } },
      { id: "iphone-16/tiktok", chrome: { kind: "fixed", content: { x: 0, y: 107, width: 393, height: 711 } } },
      { id: "iphone-16/facebook", chrome: { kind: "fixed", content: { x: 0, y: 111, width: 393, height: 707 } } },
      { id: "iphone-16/linkedin", chrome: { kind: "fixed", content: { x: 0, y: 107, width: 393, height: 711 } } },
      { id: "iphone-se/safari", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 20, width: 375, height: 597 }, collapsed: { x: 0, y: 20, width: 375, height: 597 }, collapseThresholdPx: 48, expandThresholdPx: 24, transitionMs: 420 } },
      { id: "iphone-se/safari-old", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 20, width: 375, height: 563 }, collapsed: { x: 0, y: 20, width: 375, height: 603 }, collapseThresholdPx: 48, expandThresholdPx: 24, transitionMs: 180 } },
      { id: "iphone-se/instagram", chrome: { kind: "fixed", content: { x: 0, y: 68, width: 375, height: 599 } } },
      { id: "iphone-se/tiktok", chrome: { kind: "fixed", content: { x: 0, y: 66, width: 375, height: 601 } } },
      { id: "iphone-se/facebook", chrome: { kind: "fixed", content: { x: 0, y: 70, width: 375, height: 597 } } },
      { id: "iphone-se/linkedin", chrome: { kind: "fixed", content: { x: 0, y: 66, width: 375, height: 601 } } },
      { id: "pixel/chrome", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 80, width: 412, height: 811 }, collapsed: { x: 0, y: 24, width: 412, height: 867 }, collapseThresholdPx: 56, expandThresholdPx: 28, transitionMs: 180 } },
      { id: "pixel/instagram", chrome: { kind: "fixed", content: { x: 0, y: 80, width: 412, height: 811 } } },
      { id: "pixel/tiktok", chrome: { kind: "fixed", content: { x: 0, y: 78, width: 412, height: 813 } } },
      { id: "pixel/facebook", chrome: { kind: "fixed", content: { x: 0, y: 80, width: 412, height: 811 } } },
      { id: "pixel/linkedin", chrome: { kind: "fixed", content: { x: 0, y: 76, width: 412, height: 815 } } },
      { id: "ipad/safari", chrome: { kind: "fixed", content: { x: 0, y: 74, width: 768, height: 930 } } },
      { id: "macbook/safari", chrome: { kind: "fixed", content: { x: 0, y: 70, width: 1440, height: 830 } } },
      { id: "windows-desktop/chrome", chrome: { kind: "fixed", content: { x: 0, y: 86, width: 1440, height: 814 } } },
    ]);
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

  it("validates unknown input and every nested profile invariant without throwing", () => {
    const invalidInputs: unknown[] = [
      null,
      {},
      { devices: "no", browsers: [] },
      { devices: [{ id: "", label: 1, platform: "web", screen: { width: Number.NaN, height: -1 }, defaultBrowserId: "", cornerRadiusPx: -1 }], browsers: [] },
      { devices: [{ id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "missing", cornerRadiusPx: 0 }], browsers: [] },
      { devices: [{ id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "b", cornerRadiusPx: 0 }, { id: "d", label: "D2", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "b", cornerRadiusPx: 0 }], browsers: [] },
      { devices: [{ id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "b", cornerRadiusPx: 0 }], browsers: [{ id: "x", deviceId: "d", browserId: "b", label: "B", appearance: "x", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 0, width: 100, height: 90 }, collapsed: { x: 0, y: 0, width: 100, height: 80 }, collapseThresholdPx: Infinity, expandThresholdPx: 0, transitionMs: -1 }, calibration: { capturedVersion: "", capturedAt: 1, source: "" } }] },
      { devices: [{ id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "b", cornerRadiusPx: 0 }], browsers: [{ id: "x", deviceId: "other", browserId: "b", label: "B", appearance: "x", chrome: { kind: "fixed", content: { x: 0, y: 0, width: 100, height: 100 } }, calibration: { capturedVersion: "v", capturedAt: "date", source: "s" } }] },
    ];
    for (const input of invalidInputs) expect(() => validateProfiles(input)).not.toThrow();
    for (const input of invalidInputs) expect(validateProfiles(input).ok).toBe(false);
  });

  it("rejects duplicate browser IDs and pairs", () => {
    const device = { id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "b", cornerRadiusPx: 0 };
    const browser = { id: "d/b", deviceId: "d", browserId: "b", label: "B", appearance: "custom", chrome: { kind: "fixed", content: { x: 0, y: 0, width: 100, height: 100 } }, calibration: { capturedVersion: "v", capturedAt: "date", source: "manual" } };
    expect(validateProfiles({ devices: [device], browsers: [browser, browser] }).ok).toBe(false);
  });

  it("requires the compatible default and non-shrinking collapsed geometry", () => {
    const result = validateProfiles({
      devices: [{ id: "d", label: "D", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "missing", cornerRadiusPx: 0 }],
      browsers: [{ id: "d/b", deviceId: "d", browserId: "b", label: "B", appearance: "custom", chrome: { kind: "scroll-linked", expanded: { x: 0, y: 0, width: 100, height: 90 }, collapsed: { x: 0, y: 0, width: 100, height: 80 }, collapseThresholdPx: 10, expandThresholdPx: 5, transitionMs: 0 }, calibration: { capturedVersion: "v", capturedAt: "date", source: "manual" } }],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("browsers[0].chrome.collapsed.height must be at least expanded.height");
      expect(result.errors).toContain("devices[0].defaultBrowserId must reference a compatible browser");
    }
  });

  it("accepts and returns fully validated unknown profiles", () => {
    const result = validateProfiles({ devices: BUILT_IN_DEVICES, browsers: BUILT_IN_BROWSERS });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.profiles.browsers).toHaveLength(20);
  });

  it("never resolves a browser belonging to another device", () => {
    const profiles = { devices: [{ id: "custom", label: "Custom", platform: "ios", screen: { width: 100, height: 100 }, defaultBrowserId: "missing", cornerRadiusPx: 0 }], browsers: BUILT_IN_BROWSERS } satisfies SimulatorProfiles;
    const resolved = resolveSimulatorSelection({ deviceId: "custom", browserId: "chrome" }, profiles);
    expect(resolved.browser.deviceId).toBe(resolved.device.id);
    expect(resolved.selection.deviceId).toBe(resolved.browser.deviceId);
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

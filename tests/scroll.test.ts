import { describe, expect, it } from "vitest";
import { createScrollTelemetry, parseScrollTelemetry, reduceChromeScroll } from "../src/scroll.js";
import type { ChromeBehavior } from "../src/profiles.js";

const behavior: Extract<ChromeBehavior, { kind: "scroll-linked" }> = {
  kind: "scroll-linked", expanded: { x: 0, y: 10, width: 100, height: 80 }, collapsed: { x: 0, y: 0, width: 100, height: 90 },
  collapseThresholdPx: 40, expandThresholdPx: 20, transitionMs: 180,
};

describe("chrome scroll model", () => {
  it("parses complete telemetry and rejects malformed values", () => {
    const telemetry = createScrollTelemetry({ scrollY: 10, deltaY: 10, canScroll: true });
    expect(parseScrollTelemetry(telemetry)).toEqual(telemetry);
    expect(parseScrollTelemetry({ ...telemetry, version: 2 })).toBeNull();
    expect(parseScrollTelemetry({ ...telemetry, scrollProgress: Infinity })).toBeNull();
    expect(parseScrollTelemetry({ ...telemetry, scrollY: -1 })).toBeNull();
    expect(parseScrollTelemetry({ ...telemetry, atTop: true })).toBeNull();
    expect(parseScrollTelemetry({ ...telemetry, canScroll: false, scrollProgress: 0.5 })).toBeNull();
  });

  it("normalizes telemetry produced from unusable measurements", () => {
    expect(createScrollTelemetry({ scrollY: -10, scrollProgress: 2, deltaY: Number.NaN, canScroll: true })).toMatchObject({ scrollY: 0, scrollProgress: 1, deltaY: 0, atTop: true });
    expect(createScrollTelemetry({ scrollY: 10, scrollProgress: 0.5, deltaY: 1, canScroll: false }).scrollProgress).toBe(0);
  });

  it("crosses collapse and expansion thresholds", () => {
    const partly = reduceChromeScroll({ tracker: { kind: "expanded", downwardPx: 0 }, telemetry: createScrollTelemetry({ scrollY: 20, deltaY: 20, canScroll: true }), behavior });
    expect(partly).toEqual({ kind: "expanded", downwardPx: 20 });
    const collapsed = reduceChromeScroll({ tracker: partly, telemetry: createScrollTelemetry({ scrollY: 40, deltaY: 20, canScroll: true }), behavior });
    expect(collapsed).toEqual({ kind: "collapsed", upwardPx: 0 });
    expect(reduceChromeScroll({ tracker: collapsed, telemetry: createScrollTelemetry({ scrollY: 20, deltaY: -20, canScroll: true }), behavior })).toEqual({ kind: "expanded", downwardPx: 0 });
  });
});

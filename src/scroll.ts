import type { ChromeBehavior } from "./profiles.js";

export const SCROLL_MESSAGE_KIND = "uxqa-scroll";
export const SCROLL_MESSAGE_VERSION = 1;
export type ScrollTelemetry = Readonly<{ kind: typeof SCROLL_MESSAGE_KIND; version: typeof SCROLL_MESSAGE_VERSION; scrollY: number; scrollProgress: number; deltaY: number; atTop: boolean; canScroll: boolean }>;
export type ChromeScrollTracker = Readonly<{ kind: "expanded"; downwardPx: number }> | Readonly<{ kind: "collapsed"; upwardPx: number }>;

export function createScrollTelemetry({ scrollY, scrollProgress = 0, deltaY, canScroll }: Readonly<{ scrollY: number; scrollProgress?: number; deltaY: number; canScroll: boolean }>): ScrollTelemetry {
  return { kind: SCROLL_MESSAGE_KIND, version: SCROLL_MESSAGE_VERSION, scrollY, scrollProgress, deltaY, atTop: scrollY <= 0, canScroll };
}

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

export function parseScrollTelemetry(value: unknown): ScrollTelemetry | null {
  if (typeof value !== "object" || value === null || !("kind" in value) || !("version" in value) || !("scrollY" in value) || !("scrollProgress" in value) || !("deltaY" in value) || !("atTop" in value) || !("canScroll" in value)) return null;
  if (value.kind !== SCROLL_MESSAGE_KIND || value.version !== SCROLL_MESSAGE_VERSION || !finite(value.scrollY) || !finite(value.scrollProgress) || value.scrollProgress < 0 || value.scrollProgress > 1 || !finite(value.deltaY) || typeof value.atTop !== "boolean" || typeof value.canScroll !== "boolean") return null;
  return { kind: value.kind, version: value.version, scrollY: value.scrollY, scrollProgress: value.scrollProgress, deltaY: value.deltaY, atTop: value.atTop, canScroll: value.canScroll };
}

export function reduceChromeScroll({ tracker, telemetry, behavior }: Readonly<{ tracker: ChromeScrollTracker; telemetry: ScrollTelemetry; behavior: ChromeBehavior }>): ChromeScrollTracker {
  if (behavior.kind === "fixed" || telemetry.atTop || !telemetry.canScroll) return { kind: "expanded", downwardPx: 0 };
  switch (tracker.kind) {
    case "expanded": {
      if (telemetry.deltaY <= 0) return { kind: "expanded", downwardPx: 0 };
      const downwardPx = tracker.downwardPx + telemetry.deltaY;
      return downwardPx >= behavior.collapseThresholdPx ? { kind: "collapsed", upwardPx: 0 } : { kind: "expanded", downwardPx };
    }
    case "collapsed": {
      if (telemetry.deltaY >= 0) return { kind: "collapsed", upwardPx: 0 };
      const upwardPx = tracker.upwardPx + Math.abs(telemetry.deltaY);
      return upwardPx >= behavior.expandThresholdPx ? { kind: "expanded", downwardPx: 0 } : { kind: "collapsed", upwardPx };
    }
    default: { const exhaustive: never = tracker; return exhaustive; }
  }
}

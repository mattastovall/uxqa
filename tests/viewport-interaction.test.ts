import { describe, expect, it, vi } from "vitest";
import { findViewportScroller, handleViewportWheel, isScrollerAtBoundary } from "../src/viewportInteraction.js";

describe("viewport interaction", () => {
  it("finds the nearest scrollable ancestor inside the viewport", () => {
    const viewport = document.createElement("div");
    const scroller = document.createElement("div");
    const child = document.createElement("p");
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });
    scroller.style.overflowY = "auto";
    viewport.append(scroller);
    scroller.append(child);
    document.body.append(viewport);
    expect(findViewportScroller(viewport, child, null)).toBe(scroller);
    viewport.remove();
  });

  it("detects scroll boundaries", () => {
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });
    expect(isScrollerAtBoundary(scroller, -10)).toBe(true);
    scroller.scrollTop = 100;
    expect(isScrollerAtBoundary(scroller, 10)).toBe(true);
    scroller.scrollTop = 40;
    expect(isScrollerAtBoundary(scroller, 10)).toBe(false);
  });

  it("stops wheel propagation inside the viewport", () => {
    const viewport = document.createElement("div");
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { value: 40, writable: true });
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });
    scroller.className = "uxqa-react-content";
    scroller.style.overflowY = "auto";
    viewport.append(scroller);
    const event = new WheelEvent("wheel", { deltaY: 10, bubbles: true, cancelable: true });
    Object.defineProperty(event, "target", { value: scroller });
    const stopPropagation = vi.spyOn(event, "stopPropagation");
    const preventDefault = vi.spyOn(event, "preventDefault");
    handleViewportWheel(viewport, scroller, event);
    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("prevents page scroll when the inner scroller is at a boundary", () => {
    const viewport = document.createElement("div");
    const scroller = document.createElement("div");
    Object.defineProperty(scroller, "scrollTop", { value: 0, writable: true });
    Object.defineProperty(scroller, "scrollHeight", { value: 200 });
    Object.defineProperty(scroller, "clientHeight", { value: 100 });
    scroller.style.overflowY = "auto";
    viewport.append(scroller);
    const event = new WheelEvent("wheel", { deltaY: -10, bubbles: true, cancelable: true });
    Object.defineProperty(event, "target", { value: scroller });
    const preventDefault = vi.spyOn(event, "preventDefault");
    handleViewportWheel(viewport, scroller, event);
    expect(preventDefault).toHaveBeenCalled();
  });
});

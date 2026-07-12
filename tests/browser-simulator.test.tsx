import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { CSSProperties } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserSimulator, SimulatorViewport, resolveSimulatorSelection } from "../src/index.js";
import "../src/styles.css";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }
}

beforeEach(() => {
  ResizeObserverMock.instances = [];
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("BrowserSimulator", () => {
  it("renders the default iframe integration with an accessible title", () => {
    render(<BrowserSimulator src="/campaign" />);
    const frame = screen.getByTitle("Website preview");
    expect(frame).toHaveAttribute("src", "/campaign");
    expect(screen.getByLabelText("Device")).toHaveValue("iphone-16");
    expect(screen.getByLabelText("Browser")).toHaveValue("safari");
  });

  it("renders React content without an iframe", () => {
    render(<BrowserSimulator content={<button>Inside preview</button>} />);
    expect(screen.getByRole("button", { name: "Inside preview" })).toBeInTheDocument();
    expect(screen.queryByTitle("Website preview")).not.toBeInTheDocument();
  });

  it("updates uncontrolled selection and reports controlled changes", () => {
    const { rerender } = render(<BrowserSimulator src="/" defaultSelection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} />);
    fireEvent.change(screen.getByLabelText("Device"), { target: { value: "iphone-se" } });
    expect(screen.getByLabelText("Device")).toHaveValue("iphone-se");

    const onSelectionChange = vi.fn();
    rerender(<BrowserSimulator src="/" selection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} onSelectionChange={onSelectionChange} />);
    fireEvent.change(screen.getByLabelText("Device"), { target: { value: "iphone-16" } });
    expect(onSelectionChange).toHaveBeenCalledWith({ deviceId: "iphone-16", browserId: "safari", chrome: "auto" });
    expect(screen.getByLabelText("Device")).toHaveValue("pixel");
  });

  it("supports hidden controls and iframe attribute passthrough", () => {
    render(<BrowserSimulator src="https://example.com" controls={false} title="Campaign" iframeProps={{ allow: "camera", loading: "lazy", referrerPolicy: "no-referrer", sandbox: "allow-scripts" }} />);
    expect(screen.queryByLabelText("Device")).not.toBeInTheDocument();
    expect(screen.getByTitle("Campaign")).toHaveAttribute("allow", "camera");
    expect(screen.getByTitle("Campaign")).toHaveAttribute("loading", "lazy");
    expect(screen.getByTitle("Campaign")).toHaveAttribute("referrerpolicy", "no-referrer");
    expect(screen.getByTitle("Campaign")).toHaveAttribute("sandbox", "allow-scripts");
  });

  it("uses hostname override in neutral browser chrome", () => {
    render(<BrowserSimulator src="/campaign" hostname="preview.example" />);
    expect(screen.getByText("preview.example")).toBeInTheDocument();
  });

  it("renders distinct chrome for browser and device selections", () => {
    const { container } = render(<BrowserSimulator src="/" />);
    expect(container.querySelector(".uxqa-browser-chrome")).toHaveAttribute("data-appearance", "ios26-safari");
    expect(container.querySelector(".uxqa-ios26-safari")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Browser"), { target: { value: "instagram" } });
    expect(container.querySelector(".uxqa-browser-chrome")).toHaveAttribute("data-appearance", "instagram");
    expect(container.querySelector('[data-app="instagram"]')).toHaveTextContent("Instagram");
    fireEvent.change(screen.getByLabelText("Device"), { target: { value: "windows-desktop" } });
    expect(container.querySelector(".uxqa-browser-chrome")).toHaveAttribute("data-appearance", "windows-chrome");
    expect(container.querySelector(".uxqa-windows-chrome")).toBeInTheDocument();
  });

  it("collapses scroll-linked chrome without painting the expanded toolbar", () => {
    const { container } = render(<BrowserSimulator src="/" defaultSelection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} />);
    const frame = screen.getByTitle("Website preview") as HTMLIFrameElement;
    let scrollY = 0;
    let scrollHandler: (() => void) | undefined;
    const target = {
      get scrollY() { return scrollY; },
      document: { documentElement: { scrollHeight: 1000, clientHeight: 500 } },
      addEventListener: vi.fn((_name: string, handler: () => void) => { scrollHandler = handler; }),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(frame, "contentWindow", { configurable: true, value: target });
    fireEvent.load(frame);
    expect(container.querySelector(".uxqa-android-toolbar")).toBeInTheDocument();
    scrollY = 60;
    act(() => scrollHandler?.());
    expect(container.querySelector(".uxqa-browser-chrome")).toHaveAttribute("data-chrome-state", "collapsed");
    expect(container.querySelector(".uxqa-android-toolbar")).not.toBeInTheDocument();
  });

  it("reports invalid controlled selections", () => {
    const onError = vi.fn();
    render(<BrowserSimulator src="/" selection={{ deviceId: "missing", browserId: "missing", chrome: "auto" }} onSelectionChange={vi.fn()} onError={onError} />);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("missing") }));
  });

  it("renders a compact invalid-profile error instead of a silent fallback", () => {
    const onError = vi.fn();
    render(<BrowserSimulator src="/" profiles={{ devices: [], browsers: [{ id: "bad/browser", deviceId: "bad", browserId: "browser", label: "Bad", appearance: "bad", chrome: { kind: "fixed", content: { x: 0, y: 0, width: 10, height: 10 } }, calibration: { capturedVersion: "1", capturedAt: "today", source: "test" } }] }} onError={onError} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid simulator profiles");
    expect(screen.queryByTitle("Website preview")).not.toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
  });

  it("announces iframe loading, load, and error status", () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    render(<BrowserSimulator src="/" onLoad={onLoad} onError={onError} />);
    const frame = screen.getByTitle("Website preview");
    expect(screen.getByRole("status")).toHaveTextContent("Loading preview");
    fireEvent.load(frame);
    expect(onLoad).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Preview loaded");
    fireEvent.error(screen.getByTitle("Website preview"));
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("Preview failed to load");
  });

  it("returns iframe status to loading when src changes", () => {
    const { rerender } = render(<BrowserSimulator src="/first" />);
    fireEvent.load(screen.getByTitle("Website preview"));
    expect(screen.getByRole("status")).toHaveTextContent("Preview loaded");
    rerender(<BrowserSimulator src="/second" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading preview");
  });

  it("gives standalone SimulatorViewport the default styling root", () => {
    const profile = resolveSimulatorSelection({ deviceId: "iphone-16", browserId: "safari", chrome: "auto" });
    const { container } = render(<SimulatorViewport content={<main>Standalone</main>} profile={profile} />);
    expect(container.querySelector(".uxqa-viewport")).toHaveClass("uxqa-viewport");
    expect(container.querySelector(".uxqa-screen")).toBeInTheDocument();
  });

  it("inherits consumer CSS custom properties from the BrowserSimulator root", () => {
    const style: CSSProperties & Readonly<{ "--uxqa-canvas-background": string; "--uxqa-min-height": string }> = {
      "--uxqa-canvas-background": "rgb(1, 2, 3)",
      "--uxqa-min-height": "321px",
    };
    const { container } = render(<BrowserSimulator src="/" style={style} />);
    const simulator = container.querySelector(".uxqa-simulator");
    expect(simulator).not.toBeNull();
    if (!simulator) return;
    expect(getComputedStyle(simulator).getPropertyValue("--uxqa-canvas-background")).toBe("rgb(1, 2, 3)");
    expect(getComputedStyle(simulator).getPropertyValue("--uxqa-min-height")).toBe("321px");
  });

  it("uses iPhone SE Safari offsets without an unsupported home indicator", () => {
    const { container, rerender } = render(<BrowserSimulator src="/" controls={false} defaultSelection={{ deviceId: "iphone-se", browserId: "safari", chrome: "auto" }} />);
    expect(container.querySelector(".uxqa-ios26-safari")).toHaveClass("uxqa-ios26-safari--home-button");
    expect(container.querySelector(".uxqa-home-indicator")).not.toBeInTheDocument();

    rerender(<BrowserSimulator key="legacy" src="/" controls={false} defaultSelection={{ deviceId: "iphone-se", browserId: "safari-old", chrome: "auto" }} />);
    expect(container.querySelector(".uxqa-legacy-safari")).toBeInTheDocument();
    expect(container.querySelector(".uxqa-home-indicator")).not.toBeInTheDocument();
  });

  it("attaches same-origin scrolling after load and tolerates cross-origin access", () => {
    render(<BrowserSimulator src="/" defaultSelection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} />);
    const frame = screen.getByTitle("Website preview") as HTMLIFrameElement;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    Object.defineProperty(frame, "contentWindow", { configurable: true, value: { scrollY: 0, document: { documentElement: { scrollHeight: 1000, clientHeight: 500 } }, addEventListener, removeEventListener } });
    fireEvent.load(frame);
    expect(addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    cleanup();
    expect(removeEventListener).toHaveBeenCalledWith("scroll", expect.any(Function));

    render(<BrowserSimulator src="https://elsewhere.example" />);
    const crossOriginFrame = screen.getByTitle("Website preview");
    Object.defineProperty(crossOriginFrame, "contentWindow", { configurable: true, get: () => { throw new DOMException("Blocked", "SecurityError"); } });
    expect(() => fireEvent.load(crossOriginFrame)).not.toThrow();
  });

  it("reattaches same-origin scrolling when the profile changes without reloading the iframe", () => {
    render(<BrowserSimulator src="/" defaultSelection={{ deviceId: "pixel", browserId: "chrome", chrome: "auto" }} />);
    const frame = screen.getByTitle("Website preview") as HTMLIFrameElement;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    Object.defineProperty(frame, "contentWindow", { configurable: true, value: { scrollY: 0, document: { documentElement: { scrollHeight: 1000, clientHeight: 500 } }, addEventListener, removeEventListener } });

    fireEvent.load(frame);
    expect(addEventListener).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Browser"), { target: { value: "instagram" } });
    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(addEventListener).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByLabelText("Browser"), { target: { value: "chrome" } });
    expect(addEventListener).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("Preview loaded");
  });

  it("cleans up ResizeObserver and isolates multiple instances", () => {
    const { unmount } = render(<><BrowserSimulator src="/one" /><BrowserSimulator src="/two" /></>);
    expect(ResizeObserverMock.instances).toHaveLength(2);
    act(() => ResizeObserverMock.instances[0]?.callback([{ contentRect: { width: 500, height: 900 } } as ResizeObserverEntry], ResizeObserverMock.instances[0] as unknown as ResizeObserver));
    unmount();
    expect(ResizeObserverMock.instances.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });
});

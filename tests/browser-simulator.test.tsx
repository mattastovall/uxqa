import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserSimulator } from "../src/index.js";

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

  it("reports invalid controlled selections", () => {
    const onError = vi.fn();
    render(<BrowserSimulator src="/" selection={{ deviceId: "missing", browserId: "missing", chrome: "auto" }} onSelectionChange={vi.fn()} onError={onError} />);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("missing") }));
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

  it("cleans up ResizeObserver and isolates multiple instances", () => {
    const { unmount } = render(<><BrowserSimulator src="/one" /><BrowserSimulator src="/two" /></>);
    expect(ResizeObserverMock.instances).toHaveLength(2);
    act(() => ResizeObserverMock.instances[0]?.callback([{ contentRect: { width: 500, height: 900 } } as ResizeObserverEntry], ResizeObserverMock.instances[0] as unknown as ResizeObserver));
    unmount();
    expect(ResizeObserverMock.instances.every((observer) => observer.disconnect.mock.calls.length === 1)).toBe(true);
  });
});

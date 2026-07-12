import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BrowserChrome } from "../src/BrowserChrome.js";
import {
  BUILT_IN_BROWSERS,
  BUILT_IN_DEVICES,
  resolveSimulatorSelection,
  type BrowserProfile,
  type DeviceProfile,
  type ResolvedSimulatorProfile,
} from "../src/profiles.js";

function builtInProfile(browser: BrowserProfile): ResolvedSimulatorProfile {
  const device = BUILT_IN_DEVICES.find((candidate) => candidate.id === browser.deviceId);
  if (!device) throw new Error(`Missing built-in device ${browser.deviceId}`);
  return {
    selection: { deviceId: device.id, browserId: browser.browserId, chrome: "auto" },
    device,
    browser,
  };
}

describe("BrowserChrome", () => {
  it.each(BUILT_IN_BROWSERS.flatMap((browser) => (["expanded", "collapsed"] as const).map((chromeState) => ({ browser, chromeState }))))(
    "renders $browser.id in the $chromeState state with calibrated geometry",
    ({ browser, chromeState }) => {
      const profile = builtInProfile(browser);
      const { container } = render(<BrowserChrome profile={profile} chromeState={chromeState} hostname="preview.example" />);
      const root = container.querySelector<HTMLElement>(".uxqa-browser-chrome");
      const rect = browser.chrome.kind === "fixed" ? browser.chrome.content : browser.chrome[chromeState];

      expect(root).toHaveAttribute("data-appearance", browser.appearance);
      expect(root).toHaveAttribute("data-chrome-state", chromeState);
      expect(root?.style.getPropertyValue("--uxqa-content-x")).toBe(`${rect.x}px`);
      expect(root?.style.getPropertyValue("--uxqa-content-y")).toBe(`${rect.y}px`);
      expect(root?.style.getPropertyValue("--uxqa-content-width")).toBe(`${rect.width}px`);
      expect(root?.style.getPropertyValue("--uxqa-content-height")).toBe(`${rect.height}px`);
      expect(root?.querySelectorAll("svg").length).toBeGreaterThan(0);
    },
  );

  it("renders the complete iOS 26 Safari address control", () => {
    const profile = resolveSimulatorSelection({ deviceId: "iphone-16", browserId: "safari" });
    const { container } = render(<BrowserChrome profile={profile} chromeState="expanded" hostname="preview.example" />);
    expect(container.querySelector(".uxqa-ios26-page-menu svg")).toBeInTheDocument();
    expect(container.querySelector(".uxqa-ios26-reload svg")).toBeInTheDocument();
  });

  it.each([
    { deviceId: "iphone-16", browserId: "safari", state: "collapsed", selector: ".uxqa-ios26-safari--collapsed" },
    { deviceId: "iphone-se", browserId: "safari", state: "expanded", selector: ".uxqa-ios26-safari--home-button" },
    { deviceId: "iphone-16", browserId: "safari-old", state: "expanded", selector: ".uxqa-legacy-safari--expanded" },
    { deviceId: "pixel", browserId: "chrome", state: "expanded", selector: ".uxqa-android-toolbar" },
    { deviceId: "ipad", browserId: "safari", state: "expanded", selector: ".uxqa-ipad-toolbar" },
    { deviceId: "macbook", browserId: "safari", state: "expanded", selector: ".uxqa-macos-safari" },
    { deviceId: "windows-desktop", browserId: "chrome", state: "expanded", selector: ".uxqa-windows-chrome" },
    { deviceId: "iphone-16", browserId: "instagram", state: "expanded", selector: '[data-app="instagram"]' },
    { deviceId: "iphone-16", browserId: "tiktok", state: "expanded", selector: '[data-app="tiktok"]' },
    { deviceId: "iphone-16", browserId: "facebook", state: "expanded", selector: '[data-app="facebook"]' },
    { deviceId: "iphone-16", browserId: "linkedin", state: "expanded", selector: '[data-app="linkedin"]' },
  ] as const)("renders the fidelity marker $selector", ({ deviceId, browserId, state, selector }) => {
    const profile = resolveSimulatorSelection({ deviceId, browserId });
    const { container } = render(<BrowserChrome profile={profile} chromeState={state} hostname="preview.example" />);
    expect(container.querySelector(selector)).toBeInTheDocument();
  });

  it("renders legacy Safari overflow and macOS Safari share actions", () => {
    const legacy = resolveSimulatorSelection({ deviceId: "iphone-16", browserId: "safari-old" });
    const legacyRender = render(<BrowserChrome profile={legacy} chromeState="expanded" hostname="preview.example" />);
    expect(legacyRender.container.querySelector('[data-icon="more"]')).toBeInTheDocument();
    legacyRender.unmount();

    const desktop = resolveSimulatorSelection({ deviceId: "macbook", browserId: "safari" });
    const desktopRender = render(<BrowserChrome profile={desktop} chromeState="expanded" hostname="preview.example" />);
    expect(desktopRender.container.querySelector('[data-icon="share"]')).toBeInTheDocument();
  });

  it("uses structured signal, wifi, and battery indicators", () => {
    const profile = resolveSimulatorSelection({ deviceId: "iphone-16", browserId: "safari" });
    const { container } = render(<BrowserChrome profile={profile} chromeState="expanded" hostname="preview.example" />);
    expect(container.querySelector('[data-icon="signal"]')).toBeInTheDocument();
    expect(container.querySelector('[data-icon="wifi"]')).toBeInTheDocument();
    expect(container.querySelector(".uxqa-battery > span")).toBeInTheDocument();
  });

  it("shows the right home affordance for iPhone SE and gesture devices", () => {
    const se = resolveSimulatorSelection({ deviceId: "iphone-se", browserId: "safari" });
    const seRender = render(<BrowserChrome profile={se} chromeState="expanded" hostname="preview.example" />);
    expect(seRender.container.querySelector(".uxqa-ios26-safari")).toHaveClass("uxqa-ios26-safari--home-button");
    expect(seRender.container.querySelector(".uxqa-home-indicator")).not.toBeInTheDocument();
    seRender.unmount();

    const pixel = resolveSimulatorSelection({ deviceId: "pixel", browserId: "chrome" });
    const pixelRender = render(<BrowserChrome profile={pixel} chromeState="expanded" hostname="preview.example" />);
    expect(pixelRender.container.querySelector(".uxqa-home-indicator")).toBeInTheDocument();
  });

  it("renders nothing when chrome is off", () => {
    const resolved = resolveSimulatorSelection({ deviceId: "iphone-16", browserId: "safari", chrome: "off" });
    const { container } = render(<BrowserChrome profile={resolved} chromeState="expanded" hostname="preview.example" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("ellipsizes long hostnames and falls back for custom appearances", () => {
    const device: DeviceProfile = {
      id: "custom-phone",
      label: "Custom phone",
      platform: "ios",
      screen: { width: 390, height: 844 },
      defaultBrowserId: "custom",
      cornerRadiusPx: 40,
    };
    const browser: BrowserProfile = {
      id: "custom-phone/custom",
      deviceId: device.id,
      browserId: "custom",
      label: "Custom browser",
      appearance: "brand-new-browser",
      chrome: { kind: "fixed", content: { x: 0, y: 54, width: 390, height: 756 } },
      calibration: { capturedVersion: "test", capturedAt: "2026-07-12", source: "test" },
    };
    const profile: ResolvedSimulatorProfile = {
      selection: { deviceId: device.id, browserId: browser.browserId, chrome: "on" },
      device,
      browser,
    };
    const hostname = "a-very-long-preview-hostname-that-needs-to-be-truncated.example.com";
    const { container, getByText } = render(<BrowserChrome profile={profile} chromeState="expanded" hostname={hostname} />);
    expect(container.querySelector(".uxqa-neutral-toolbar")).toBeInTheDocument();
    expect(getByText(hostname)).toHaveClass("uxqa-hostname");
  });

  it("keeps the iOS shelf, motion, fallback, and platform fidelity CSS contracts", () => {
    const css = readFileSync(join(process.cwd(), "src/styles.css"), "utf8");

    expect(css).toContain('.uxqa-browser-chrome[data-appearance="ios26-safari"][data-chrome-state="expanded"]::before { height: 97px; }');
    expect(css).toContain("transition: height 420ms cubic-bezier(.22, 1, .36, 1)");
    expect(css).toContain("@supports not (backdrop-filter: blur(1px))");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    for (const selector of [
      '.uxqa-browser-chrome[data-appearance="ios26-safari"]::before',
      ".uxqa-ios26-safari",
      ".uxqa-ios26-side",
      ".uxqa-ios26-address",
      ".uxqa-ios26-page-menu",
      ".uxqa-ios26-reload",
      ".uxqa-ios26-hostname",
      ".uxqa-legacy-safari",
    ]) expect(css).toContain(selector);
    expect(css).toContain(".uxqa-ipad-toolbar .uxqa-address-pill { height: 34px; }");
    expect(css).toContain('.uxqa-app-toolbar[data-app="tiktok"] { background: #fff; }');
    expect(css).toContain(".uxqa-app-title strong { font-size: 12px; font-weight: 700; }");
  });
});

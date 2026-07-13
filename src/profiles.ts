export type BuiltInDeviceId = "iphone-16" | "iphone-se" | "pixel" | "ipad" | "macbook" | "windows-desktop";
export type BuiltInBrowserId = "safari" | "safari-old" | "chrome" | "instagram" | "tiktok" | "facebook" | "linkedin";
export const DEVICE_IDS = ["iphone-16", "iphone-se", "pixel", "ipad", "macbook", "windows-desktop"] satisfies readonly BuiltInDeviceId[];
export const BROWSER_IDS = ["safari", "safari-old", "chrome", "instagram", "tiktok", "facebook", "linkedin"] satisfies readonly BuiltInBrowserId[];
export type Platform = "ios" | "android" | "ipados" | "macos" | "windows";
export type ChromeMode = "auto" | "on" | "off";
export type ChromeState = "expanded" | "collapsed";
export type Size = Readonly<{ width: number; height: number }>;
export type ContentRect = Readonly<{ x: number; y: number; width: number; height: number }>;
export type ChromeBehavior =
  | Readonly<{ kind: "fixed"; content: ContentRect }>
  | Readonly<{ kind: "scroll-linked"; expanded: ContentRect; collapsed: ContentRect; collapseThresholdPx: number; expandThresholdPx: number; transitionMs: number }>;

export type DeviceProfile = Readonly<{
  id: string; label: string; platform: Platform; screen: Size; defaultBrowserId: string; cornerRadiusPx: number;
}>;
export type BrowserProfile = Readonly<{
  id: string; deviceId: string; browserId: string; label: string; appearance: string; chrome: ChromeBehavior;
  calibration: Readonly<{ capturedVersion: string; capturedAt: string; source: string }>;
}>;
export type SimulatorSelection = Readonly<{ deviceId: string; browserId: string; chrome: ChromeMode }>;
export type ResolvedSimulatorProfile = Readonly<{ selection: SimulatorSelection; device: DeviceProfile; browser: BrowserProfile }>;
export type SimulatorProfiles = Readonly<{ devices: readonly DeviceProfile[]; browsers: readonly BrowserProfile[] }>;
export type ProfileValidation = Readonly<{ ok: true; profiles: SimulatorProfiles }> | Readonly<{ ok: false; errors: readonly string[] }>;

export const BUILT_IN_DEVICES = [
  { id: "iphone-16", label: "iPhone 16", platform: "ios", screen: { width: 393, height: 852 }, defaultBrowserId: "safari", cornerRadiusPx: 50 },
  { id: "iphone-se", label: "iPhone SE", platform: "ios", screen: { width: 375, height: 667 }, defaultBrowserId: "safari", cornerRadiusPx: 28 },
  { id: "pixel", label: "Pixel", platform: "android", screen: { width: 412, height: 915 }, defaultBrowserId: "chrome", cornerRadiusPx: 42 },
  { id: "ipad", label: "iPad", platform: "ipados", screen: { width: 768, height: 1024 }, defaultBrowserId: "safari", cornerRadiusPx: 24 },
  { id: "macbook", label: "MacBook", platform: "macos", screen: { width: 1440, height: 900 }, defaultBrowserId: "safari", cornerRadiusPx: 12 },
  { id: "windows-desktop", label: "Windows Desktop", platform: "windows", screen: { width: 1440, height: 900 }, defaultBrowserId: "chrome", cornerRadiusPx: 8 },
] satisfies readonly DeviceProfile[];

const calibration = (capturedVersion: string, source: string) => ({ capturedVersion, capturedAt: "2026-07-10", source });
const fixed = (x: number, y: number, width: number, height: number): ChromeBehavior => ({ kind: "fixed", content: { x, y, width, height } });
const linked = (expanded: ContentRect, collapsed: ContentRect, collapseThresholdPx: number, expandThresholdPx: number, transitionMs: number): ChromeBehavior => ({ kind: "scroll-linked", expanded, collapsed, collapseThresholdPx, expandThresholdPx, transitionMs });

export const BUILT_IN_BROWSERS = [
  { id: "iphone-16/safari", deviceId: "iphone-16", browserId: "safari", label: "Safari", appearance: "ios26-safari", chrome: linked({ x: 0, y: 59, width: 393, height: 696 }, { x: 0, y: 59, width: 393, height: 741 }, 48, 24, 420), calibration: calibration("iOS 26 compact Safari", "Apple safe-area references") },
  { id: "iphone-16/safari-old", deviceId: "iphone-16", browserId: "safari-old", label: "Safari (Legacy)", appearance: "ios-safari-old", chrome: linked({ x: 0, y: 59, width: 393, height: 690 }, { x: 0, y: 59, width: 393, height: 759 }, 48, 24, 180), calibration: calibration("Pre-iOS-26 Safari", "Apple safe-area references") },
  { id: "iphone-16/instagram", deviceId: "iphone-16", browserId: "instagram", label: "Instagram", appearance: "instagram", chrome: fixed(0, 109, 393, 709), calibration: calibration("Instagram iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-16/tiktok", deviceId: "iphone-16", browserId: "tiktok", label: "TikTok", appearance: "tiktok", chrome: fixed(0, 107, 393, 711), calibration: calibration("TikTok iOS March 2026", "descriptive reference snapshot") },
  { id: "iphone-16/facebook", deviceId: "iphone-16", browserId: "facebook", label: "Facebook", appearance: "facebook", chrome: fixed(0, 111, 393, 707), calibration: calibration("Facebook iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-16/linkedin", deviceId: "iphone-16", browserId: "linkedin", label: "LinkedIn", appearance: "linkedin", chrome: fixed(0, 107, 393, 711), calibration: calibration("LinkedIn iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-se/safari", deviceId: "iphone-se", browserId: "safari", label: "Safari", appearance: "ios26-safari", chrome: linked({ x: 0, y: 20, width: 375, height: 585 }, { x: 0, y: 20, width: 375, height: 597 }, 48, 24, 420), calibration: calibration("iOS 26 compact Safari", "Apple safe-area references") },
  { id: "iphone-se/safari-old", deviceId: "iphone-se", browserId: "safari-old", label: "Safari (Legacy)", appearance: "ios-safari-old", chrome: linked({ x: 0, y: 20, width: 375, height: 563 }, { x: 0, y: 20, width: 375, height: 603 }, 48, 24, 180), calibration: calibration("Pre-iOS-26 Safari", "Apple safe-area references") },
  { id: "iphone-se/instagram", deviceId: "iphone-se", browserId: "instagram", label: "Instagram", appearance: "instagram", chrome: fixed(0, 68, 375, 599), calibration: calibration("Instagram iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-se/tiktok", deviceId: "iphone-se", browserId: "tiktok", label: "TikTok", appearance: "tiktok", chrome: fixed(0, 66, 375, 601), calibration: calibration("TikTok iOS March 2026", "descriptive reference snapshot") },
  { id: "iphone-se/facebook", deviceId: "iphone-se", browserId: "facebook", label: "Facebook", appearance: "facebook", chrome: fixed(0, 70, 375, 597), calibration: calibration("Facebook iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-se/linkedin", deviceId: "iphone-se", browserId: "linkedin", label: "LinkedIn", appearance: "linkedin", chrome: fixed(0, 66, 375, 601), calibration: calibration("LinkedIn iOS July 2026", "descriptive reference snapshot") },
  { id: "pixel/chrome", deviceId: "pixel", browserId: "chrome", label: "Chrome", appearance: "android-chrome", chrome: linked({ x: 0, y: 80, width: 412, height: 811 }, { x: 0, y: 24, width: 412, height: 867 }, 56, 28, 180), calibration: calibration("Android 16 Chrome", "Android system-bar references") },
  { id: "pixel/instagram", deviceId: "pixel", browserId: "instagram", label: "Instagram", appearance: "instagram", chrome: fixed(0, 80, 412, 811), calibration: calibration("Instagram Android July 2026", "descriptive reference snapshot") },
  { id: "pixel/tiktok", deviceId: "pixel", browserId: "tiktok", label: "TikTok", appearance: "tiktok", chrome: fixed(0, 78, 412, 813), calibration: calibration("TikTok Android March 2026", "descriptive reference snapshot") },
  { id: "pixel/facebook", deviceId: "pixel", browserId: "facebook", label: "Facebook", appearance: "facebook", chrome: fixed(0, 80, 412, 811), calibration: calibration("Facebook Android July 2026", "descriptive reference snapshot") },
  { id: "pixel/linkedin", deviceId: "pixel", browserId: "linkedin", label: "LinkedIn", appearance: "linkedin", chrome: fixed(0, 76, 412, 815), calibration: calibration("LinkedIn Android July 2026", "descriptive reference snapshot") },
  { id: "ipad/safari", deviceId: "ipad", browserId: "safari", label: "Safari", appearance: "ipad-safari", chrome: fixed(0, 74, 768, 930), calibration: calibration("iPadOS 26 Safari", "Apple safe-area references") },
  { id: "macbook/safari", deviceId: "macbook", browserId: "safari", label: "Safari", appearance: "macos-safari", chrome: fixed(0, 70, 1440, 830), calibration: calibration("macOS 26 Safari", "descriptive reference snapshot") },
  { id: "windows-desktop/chrome", deviceId: "windows-desktop", browserId: "chrome", label: "Chrome", appearance: "windows-chrome", chrome: fixed(0, 86, 1440, 814), calibration: calibration("Windows Chrome July 2026", "descriptive reference snapshot") },
] satisfies readonly BrowserProfile[];

export const DEFAULT_SELECTION: SimulatorSelection = { deviceId: "iphone-16", browserId: "safari", chrome: "auto" };

const BUILT_INS: SimulatorProfiles = { devices: BUILT_IN_DEVICES, browsers: BUILT_IN_BROWSERS };

export function resolveSimulatorSelection(input: Partial<SimulatorSelection>, profiles: SimulatorProfiles = BUILT_INS): ResolvedSimulatorProfile {
  const requestedDevice = profiles.devices.find((candidate) => candidate.id === input.deviceId) ?? profiles.devices.find((candidate) => candidate.id === DEFAULT_SELECTION.deviceId);
  const requestedCompatible = requestedDevice ? profiles.browsers.filter((candidate) => candidate.deviceId === requestedDevice.id) : [];
  const defaultDevice = BUILT_IN_DEVICES.find((candidate) => candidate.id === DEFAULT_SELECTION.deviceId);
  const defaultBrowser = BUILT_IN_BROWSERS.find((candidate) => candidate.deviceId === DEFAULT_SELECTION.deviceId && candidate.browserId === DEFAULT_SELECTION.browserId);
  if (!defaultDevice || !defaultBrowser) throw new Error("uxqa built-in default profiles are missing");
  const device = requestedDevice && requestedCompatible.length > 0 ? requestedDevice : defaultDevice;
  const compatible = requestedDevice && requestedCompatible.length > 0 ? requestedCompatible : [defaultBrowser];
  const browser = compatible.find((candidate) => candidate.browserId === input.browserId) ?? compatible.find((candidate) => candidate.browserId === device.defaultBrowserId) ?? compatible[0] ?? defaultBrowser;
  const chrome = input.chrome === "auto" || input.chrome === "on" || input.chrome === "off" ? input.chrome : DEFAULT_SELECTION.chrome;
  return { selection: { deviceId: device.id, browserId: browser.browserId, chrome }, device, browser };
}

function validRect(rect: ContentRect, screen: Size): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.x >= 0 && rect.y >= 0 && rect.width > 0 && rect.height > 0 && rect.x + rect.width <= screen.width && rect.y + rect.height <= screen.height;
}

function parseRect(value: unknown, path: string, errors: string[]): ContentRect | null {
  if (typeof value !== "object" || value === null || !("x" in value) || !("y" in value) || !("width" in value) || !("height" in value)) {
    errors.push(`${path} must contain x, y, width, and height`); return null;
  }
  if (![value.x, value.y, value.width, value.height].every((field) => typeof field === "number" && Number.isFinite(field))) {
    errors.push(`${path} fields must be finite numbers`); return null;
  }
  if (typeof value.x !== "number" || typeof value.y !== "number" || typeof value.width !== "number" || typeof value.height !== "number") return null;
  return { x: value.x, y: value.y, width: value.width, height: value.height };
}

function parseSize(value: unknown, path: string, errors: string[]): Size | null {
  if (typeof value !== "object" || value === null || !("width" in value) || !("height" in value) || typeof value.width !== "number" || !Number.isFinite(value.width) || typeof value.height !== "number" || !Number.isFinite(value.height)) {
    errors.push(`${path} width and height must be finite numbers`); return null;
  }
  if (value.width <= 0 || value.height <= 0) errors.push(`${path} dimensions must be positive`);
  return value.width > 0 && value.height > 0 ? { width: value.width, height: value.height } : null;
}

function parseDevice(value: unknown, index: number, errors: string[]): DeviceProfile | null {
  const path = `devices[${index}]`;
  if (typeof value !== "object" || value === null || !("id" in value) || !("label" in value) || !("platform" in value) || !("screen" in value) || !("defaultBrowserId" in value) || !("cornerRadiusPx" in value)) {
    errors.push(`${path} must contain all device fields`); return null;
  }
  if (typeof value.id !== "string" || value.id.length === 0) errors.push(`${path}.id must be a non-empty string`);
  if (typeof value.label !== "string" || value.label.length === 0) errors.push(`${path}.label must be a non-empty string`);
  if (value.platform !== "ios" && value.platform !== "android" && value.platform !== "ipados" && value.platform !== "macos" && value.platform !== "windows") errors.push(`${path}.platform is invalid`);
  if (typeof value.defaultBrowserId !== "string" || value.defaultBrowserId.length === 0) errors.push(`${path}.defaultBrowserId must be a non-empty string`);
  if (typeof value.cornerRadiusPx !== "number" || !Number.isFinite(value.cornerRadiusPx) || value.cornerRadiusPx < 0) errors.push(`${path}.cornerRadiusPx must be a finite non-negative number`);
  const screen = parseSize(value.screen, `${path}.screen`, errors);
  if (typeof value.id !== "string" || !value.id || typeof value.label !== "string" || !value.label || (value.platform !== "ios" && value.platform !== "android" && value.platform !== "ipados" && value.platform !== "macos" && value.platform !== "windows") || typeof value.defaultBrowserId !== "string" || !value.defaultBrowserId || typeof value.cornerRadiusPx !== "number" || !Number.isFinite(value.cornerRadiusPx) || value.cornerRadiusPx < 0 || !screen) return null;
  return { id: value.id, label: value.label, platform: value.platform, screen, defaultBrowserId: value.defaultBrowserId, cornerRadiusPx: value.cornerRadiusPx };
}

function parseBrowser(value: unknown, index: number, errors: string[]): BrowserProfile | null {
  const path = `browsers[${index}]`;
  if (typeof value !== "object" || value === null || !("id" in value) || !("deviceId" in value) || !("browserId" in value) || !("label" in value) || !("appearance" in value) || !("chrome" in value) || !("calibration" in value)) {
    errors.push(`${path} must contain all browser fields`); return null;
  }
  for (const [field, fieldValue] of [["id", value.id], ["deviceId", value.deviceId], ["browserId", value.browserId], ["label", value.label], ["appearance", value.appearance]]) {
    if (typeof fieldValue !== "string" || fieldValue.length === 0) errors.push(`${path}.${field} must be a non-empty string`);
  }
  let chrome: ChromeBehavior | null = null;
  if (typeof value.chrome !== "object" || value.chrome === null || !("kind" in value.chrome)) errors.push(`${path}.chrome must be an object with a kind`);
  else if (value.chrome.kind === "fixed") {
    if (!("content" in value.chrome)) errors.push(`${path}.chrome.content is required`);
    else { const content = parseRect(value.chrome.content, `${path}.chrome.content`, errors); if (content) chrome = { kind: "fixed", content }; }
  } else if (value.chrome.kind === "scroll-linked") {
    if (!("expanded" in value.chrome) || !("collapsed" in value.chrome) || !("collapseThresholdPx" in value.chrome) || !("expandThresholdPx" in value.chrome) || !("transitionMs" in value.chrome)) errors.push(`${path}.chrome must contain all scroll-linked fields`);
    else {
      const expanded = parseRect(value.chrome.expanded, `${path}.chrome.expanded`, errors);
      const collapsed = parseRect(value.chrome.collapsed, `${path}.chrome.collapsed`, errors);
      const thresholdsValid = typeof value.chrome.collapseThresholdPx === "number" && Number.isFinite(value.chrome.collapseThresholdPx) && value.chrome.collapseThresholdPx > 0 && typeof value.chrome.expandThresholdPx === "number" && Number.isFinite(value.chrome.expandThresholdPx) && value.chrome.expandThresholdPx > 0 && typeof value.chrome.transitionMs === "number" && Number.isFinite(value.chrome.transitionMs) && value.chrome.transitionMs >= 0;
      if (!thresholdsValid) errors.push(`${path}.chrome thresholds must be finite and positive, and transitionMs finite and non-negative`);
      if (expanded && collapsed && thresholdsValid && typeof value.chrome.collapseThresholdPx === "number" && typeof value.chrome.expandThresholdPx === "number" && typeof value.chrome.transitionMs === "number") chrome = { kind: "scroll-linked", expanded, collapsed, collapseThresholdPx: value.chrome.collapseThresholdPx, expandThresholdPx: value.chrome.expandThresholdPx, transitionMs: value.chrome.transitionMs };
    }
  } else errors.push(`${path}.chrome.kind must be fixed or scroll-linked`);
  let parsedCalibration: BrowserProfile["calibration"] | null = null;
  if (typeof value.calibration !== "object" || value.calibration === null || !("capturedVersion" in value.calibration) || !("capturedAt" in value.calibration) || !("source" in value.calibration) || typeof value.calibration.capturedVersion !== "string" || !value.calibration.capturedVersion || typeof value.calibration.capturedAt !== "string" || !value.calibration.capturedAt || typeof value.calibration.source !== "string" || !value.calibration.source) errors.push(`${path}.calibration fields must be non-empty strings`);
  else parsedCalibration = { capturedVersion: value.calibration.capturedVersion, capturedAt: value.calibration.capturedAt, source: value.calibration.source };
  if (typeof value.id !== "string" || !value.id || typeof value.deviceId !== "string" || !value.deviceId || typeof value.browserId !== "string" || !value.browserId || typeof value.label !== "string" || !value.label || typeof value.appearance !== "string" || !value.appearance || !chrome || !parsedCalibration) return null;
  return { id: value.id, deviceId: value.deviceId, browserId: value.browserId, label: value.label, appearance: value.appearance, chrome, calibration: parsedCalibration };
}

export function validateProfiles(input: unknown): ProfileValidation {
  const errors: string[] = [];
  if (typeof input !== "object" || input === null || !("devices" in input) || !("browsers" in input) || !Array.isArray(input.devices) || !Array.isArray(input.browsers)) return { ok: false, errors: ["profiles must contain devices and browsers arrays"] };
  const devices = input.devices.map((value, index) => parseDevice(value, index, errors)).filter((value) => value !== null);
  const browsers = input.browsers.map((value, index) => parseBrowser(value, index, errors)).filter((value) => value !== null);
  const deviceIds = new Set<string>();
  devices.forEach((device, index) => { if (deviceIds.has(device.id)) errors.push(`devices[${index}].id must be unique`); deviceIds.add(device.id); });
  const browserIds = new Set<string>();
  const pairs = new Set<string>();
  browsers.forEach((browser, index) => {
    if (browserIds.has(browser.id)) errors.push(`browsers[${index}].id must be unique`);
    browserIds.add(browser.id);
    const pair = `${browser.deviceId}/${browser.browserId}`;
    if (pairs.has(pair)) errors.push(`browsers[${index}] deviceId/browserId pair must be unique`);
    pairs.add(pair);
    const device = devices.find((candidate) => candidate.id === browser.deviceId);
    if (!device) { errors.push(`browsers[${index}].deviceId must reference a device`); return; }
    switch (browser.chrome.kind) {
      case "fixed":
        if (!validRect(browser.chrome.content, device.screen)) errors.push(`browsers[${index}].chrome.content must fit within the device screen`);
        break;
      case "scroll-linked":
        if (!validRect(browser.chrome.expanded, device.screen)) errors.push(`browsers[${index}].chrome.expanded must fit within the device screen`);
        if (!validRect(browser.chrome.collapsed, device.screen)) errors.push(`browsers[${index}].chrome.collapsed must fit within the device screen`);
        if (browser.chrome.collapsed.height < browser.chrome.expanded.height) errors.push(`browsers[${index}].chrome.collapsed.height must be at least expanded.height`);
        if (browser.chrome.collapseThresholdPx <= 0) errors.push(`browsers[${index}].chrome.collapseThresholdPx must be positive`);
        if (browser.chrome.expandThresholdPx <= 0) errors.push(`browsers[${index}].chrome.expandThresholdPx must be positive`);
        if (browser.chrome.transitionMs < 0) errors.push(`browsers[${index}].chrome.transitionMs must not be negative`);
        break;
      default: { const exhaustive: never = browser.chrome; return exhaustive; }
    }
  });
  devices.forEach((device, index) => {
    const compatible = browsers.filter((browser) => browser.deviceId === device.id);
    if (compatible.length === 0) errors.push(`devices[${index}] must have at least one compatible browser`);
    if (!compatible.some((browser) => browser.browserId === device.defaultBrowserId)) errors.push(`devices[${index}].defaultBrowserId must reference a compatible browser`);
  });
  const profiles: SimulatorProfiles = { devices, browsers };
  return errors.length === 0 ? { ok: true, profiles } : { ok: false, errors };
}

export function getContentRect({ profile, chromeState }: Readonly<{ profile: ResolvedSimulatorProfile; chromeState: ChromeState }>): ContentRect {
  if (profile.selection.chrome === "off") return { x: 0, y: 0, width: profile.device.screen.width, height: profile.device.screen.height };
  switch (profile.browser.chrome.kind) {
    case "fixed": return profile.browser.chrome.content;
    case "scroll-linked": return profile.browser.chrome[chromeState];
    default: { const exhaustive: never = profile.browser.chrome; return exhaustive; }
  }
}

export function getLayoutViewportHeight(profile: ResolvedSimulatorProfile): number {
  if (profile.selection.chrome === "off") return profile.device.screen.height;
  switch (profile.browser.chrome.kind) {
    case "fixed": return profile.browser.chrome.content.height;
    case "scroll-linked": return Math.max(profile.browser.chrome.expanded.height, profile.browser.chrome.collapsed.height);
    default: { const exhaustive: never = profile.browser.chrome; return exhaustive; }
  }
}

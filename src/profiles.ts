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
  { id: "iphone-16/safari", deviceId: "iphone-16", browserId: "safari", label: "Safari", appearance: "ios26-safari", chrome: linked({ x: 0, y: 59, width: 393, height: 741 }, { x: 0, y: 59, width: 393, height: 741 }, 48, 24, 420), calibration: calibration("iOS 26 compact Safari", "Apple safe-area references") },
  { id: "iphone-16/safari-old", deviceId: "iphone-16", browserId: "safari-old", label: "Safari (Legacy)", appearance: "ios-safari-old", chrome: linked({ x: 0, y: 59, width: 393, height: 690 }, { x: 0, y: 59, width: 393, height: 759 }, 48, 24, 180), calibration: calibration("Pre-iOS-26 Safari", "Apple safe-area references") },
  { id: "iphone-16/instagram", deviceId: "iphone-16", browserId: "instagram", label: "Instagram", appearance: "instagram", chrome: fixed(0, 109, 393, 709), calibration: calibration("Instagram iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-16/tiktok", deviceId: "iphone-16", browserId: "tiktok", label: "TikTok", appearance: "tiktok", chrome: fixed(0, 107, 393, 711), calibration: calibration("TikTok iOS March 2026", "descriptive reference snapshot") },
  { id: "iphone-16/facebook", deviceId: "iphone-16", browserId: "facebook", label: "Facebook", appearance: "facebook", chrome: fixed(0, 111, 393, 707), calibration: calibration("Facebook iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-16/linkedin", deviceId: "iphone-16", browserId: "linkedin", label: "LinkedIn", appearance: "linkedin", chrome: fixed(0, 107, 393, 711), calibration: calibration("LinkedIn iOS July 2026", "descriptive reference snapshot") },
  { id: "iphone-se/safari", deviceId: "iphone-se", browserId: "safari", label: "Safari", appearance: "ios26-safari", chrome: linked({ x: 0, y: 20, width: 375, height: 597 }, { x: 0, y: 20, width: 375, height: 597 }, 48, 24, 420), calibration: calibration("iOS 26 compact Safari", "Apple safe-area references") },
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

function firstDevice(profiles: SimulatorProfiles): DeviceProfile {
  const device = profiles.devices[0] ?? BUILT_IN_DEVICES[0];
  if (!device) throw new Error("uxqa requires at least one device profile");
  return device;
}

function firstBrowser(profiles: SimulatorProfiles): BrowserProfile {
  const browser = profiles.browsers[0] ?? BUILT_IN_BROWSERS[0];
  if (!browser) throw new Error("uxqa requires at least one browser profile");
  return browser;
}

export function resolveSimulatorSelection(input: Partial<SimulatorSelection>, profiles: SimulatorProfiles = BUILT_INS): ResolvedSimulatorProfile {
  const device = profiles.devices.find((candidate) => candidate.id === input.deviceId) ?? profiles.devices.find((candidate) => candidate.id === DEFAULT_SELECTION.deviceId) ?? firstDevice(profiles);
  const compatible = profiles.browsers.filter((candidate) => candidate.deviceId === device.id);
  const browser = compatible.find((candidate) => candidate.browserId === input.browserId) ?? compatible.find((candidate) => candidate.browserId === device.defaultBrowserId) ?? firstBrowser(profiles);
  const chrome = input.chrome === "auto" || input.chrome === "on" || input.chrome === "off" ? input.chrome : DEFAULT_SELECTION.chrome;
  return { selection: { deviceId: device.id, browserId: browser.browserId, chrome }, device, browser };
}

function validRect(rect: ContentRect, screen: Size): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.x >= 0 && rect.y >= 0 && rect.width > 0 && rect.height > 0 && rect.x + rect.width <= screen.width && rect.y + rect.height <= screen.height;
}

export function validateProfiles(profiles: SimulatorProfiles): ProfileValidation {
  const errors: string[] = [];
  const ids = new Set<string>();
  profiles.devices.forEach((device, index) => {
    if (!device.id) errors.push(`devices[${index}].id must be a non-empty string`);
    if (ids.has(device.id)) errors.push(`devices[${index}].id must be unique`);
    ids.add(device.id);
    if (!Number.isFinite(device.screen.width) || device.screen.width <= 0) errors.push(`devices[${index}].screen.width must be positive`);
    if (!Number.isFinite(device.screen.height) || device.screen.height <= 0) errors.push(`devices[${index}].screen.height must be positive`);
  });
  profiles.browsers.forEach((browser, index) => {
    const device = profiles.devices.find((candidate) => candidate.id === browser.deviceId);
    if (!device) { errors.push(`browsers[${index}].deviceId must reference a device`); return; }
    switch (browser.chrome.kind) {
      case "fixed":
        if (!validRect(browser.chrome.content, device.screen)) errors.push(`browsers[${index}].chrome.content must fit within the device screen`);
        break;
      case "scroll-linked":
        if (!validRect(browser.chrome.expanded, device.screen)) errors.push(`browsers[${index}].chrome.expanded must fit within the device screen`);
        if (!validRect(browser.chrome.collapsed, device.screen)) errors.push(`browsers[${index}].chrome.collapsed must fit within the device screen`);
        if (browser.chrome.collapseThresholdPx <= 0) errors.push(`browsers[${index}].chrome.collapseThresholdPx must be positive`);
        if (browser.chrome.expandThresholdPx <= 0) errors.push(`browsers[${index}].chrome.expandThresholdPx must be positive`);
        if (browser.chrome.transitionMs < 0) errors.push(`browsers[${index}].chrome.transitionMs must not be negative`);
        break;
      default: { const exhaustive: never = browser.chrome; return exhaustive; }
    }
  });
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

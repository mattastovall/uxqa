import type { CSSProperties, ReactNode } from "react";
import { getContentRect, type ChromeState, type ResolvedSimulatorProfile } from "./profiles.js";

export type BrowserChromeProps = Readonly<{ profile: ResolvedSimulatorProfile; chromeState: ChromeState; hostname: string }>;
type ChromeStyle = CSSProperties & { "--uxqa-content-x": string; "--uxqa-content-y": string; "--uxqa-content-width": string; "--uxqa-content-height": string };

type IconKind = "back" | "close" | "more" | "page-menu" | "share" | "tabs" | "refresh" | "lock" | "signal" | "wifi";

function Icon({ kind }: Readonly<{ kind: IconKind }>) {
  const paths: Record<typeof kind, ReactNode> = {
    back: <path d="m14.5 5-7 7 7 7" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    more: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    "page-menu": <><path d="M8 7h10M8 12h7M8 17h10" /><path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" /></>,
    share: <><path d="M12 15V3m0 0L8 7m4-4 4 4" /><path d="M6 11v8h12v-8" /></>,
    tabs: <><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 2h9a4 4 0 0 1 4 4v9" /></>,
    refresh: <><path d="M19 8a8 8 0 1 0 1 7" /><path d="M19 3v5h-5" /></>,
    lock: <><rect x="6" y="10" width="12" height="10" rx="2" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>,
    signal: <path d="M1 11V9m4 2V7m4 4V5m4 6V3m4 8V1" />,
    wifi: <path d="M1 4.5a12 12 0 0 1 16 0M4 7.5a7.5 7.5 0 0 1 10 0M8 10.5a1.5 1.5 0 0 1 2 0" />,
  };
  const viewBox = kind === "signal" || kind === "wifi" ? "0 0 18 12" : "0 0 24 24";
  return <svg viewBox={viewBox} focusable="false" data-icon={kind}>{paths[kind]}</svg>;
}

function StatusBar({ profile }: Readonly<{ profile: ResolvedSimulatorProfile }>) {
  const height = profile.device.id === "iphone-16" ? 59 : profile.device.id === "iphone-se" ? 20 : profile.device.id === "pixel" || profile.device.id === "ipad" ? 24 : 0;
  if (height === 0) return null;
  return <div className="uxqa-chrome-status" style={{ height }}><span className="uxqa-status-time">9:41</span>{profile.device.id === "iphone-16" ? <span className="uxqa-dynamic-island" /> : null}<span className="uxqa-status-indicators"><Icon kind="signal" /><Icon kind="wifi" /><span className="uxqa-battery"><span /></span></span></div>;
}

function Address({ hostname }: Readonly<{ hostname: string }>) {
  return <span className="uxqa-address-pill"><span className="uxqa-lock-icon"><Icon kind="lock" /></span><span className="uxqa-hostname">{hostname}</span><span className="uxqa-refresh-icon"><Icon kind="refresh" /></span></span>;
}

function HomeIndicator() { return <span className="uxqa-home-indicator" />; }
function WindowControls() { return <span className="uxqa-window-controls"><span className="uxqa-window-close" /><span className="uxqa-window-minimize" /><span className="uxqa-window-maximize" /></span>; }

function Ios26({ profile, chromeState, hostname }: BrowserChromeProps) {
  const homeButtonClass = profile.device.id === "iphone-se" ? " uxqa-ios26-safari--home-button" : "";
  return <><StatusBar profile={profile} /><div className={`uxqa-ios26-safari${homeButtonClass}${chromeState === "collapsed" ? " uxqa-ios26-safari--collapsed" : ""}`}><span className="uxqa-ios26-side"><Icon kind="back" /></span><span className="uxqa-ios26-address"><span className="uxqa-ios26-page-menu"><Icon kind="page-menu" /></span><span className="uxqa-ios26-hostname">{hostname}</span><span className="uxqa-ios26-reload"><Icon kind="refresh" /></span></span><span className="uxqa-ios26-side"><Icon kind="more" /></span></div>{profile.device.id === "iphone-16" ? <HomeIndicator /> : null}</>;
}

function LegacySafari({ profile, chromeState, hostname }: BrowserChromeProps) {
  return <><StatusBar profile={profile} /><div className={`uxqa-bottom-chrome uxqa-legacy-safari uxqa-legacy-safari--${chromeState}`}>{chromeState === "expanded" ? <><Address hostname={hostname} /><span className="uxqa-mobile-actions"><span className="uxqa-glyph"><Icon kind="back" /></span><span className="uxqa-glyph"><Icon kind="share" /></span><span className="uxqa-glyph"><Icon kind="tabs" /></span><span className="uxqa-glyph"><Icon kind="more" /></span></span></> : <span className="uxqa-collapsed-domain">{hostname}</span>}{profile.device.id === "iphone-16" ? <HomeIndicator /> : null}</div></>;
}

function Android({ profile, chromeState, hostname }: BrowserChromeProps) {
  return <><StatusBar profile={profile} />{chromeState === "expanded" ? <div className="uxqa-top-chrome uxqa-android-toolbar"><Address hostname={hostname} /><span className="uxqa-glyph"><Icon kind="tabs" /></span><span className="uxqa-glyph"><Icon kind="more" /></span></div> : null}<div className="uxqa-bottom-chrome uxqa-android-gesture"><HomeIndicator /></div></>;
}

function Ipad({ profile, hostname }: BrowserChromeProps) {
  return <><StatusBar profile={profile} /><div className="uxqa-top-chrome uxqa-ipad-toolbar"><span className="uxqa-glyph"><Icon kind="back" /></span><Address hostname={hostname} /><span className="uxqa-glyph"><Icon kind="share" /></span><span className="uxqa-glyph"><Icon kind="tabs" /></span></div><div className="uxqa-bottom-chrome uxqa-ipad-home"><HomeIndicator /></div></>;
}

function Desktop({ hostname, windows }: Readonly<{ hostname: string; windows: boolean }>) {
  return <div className={`uxqa-top-chrome ${windows ? "uxqa-windows-chrome" : "uxqa-macos-safari"}`}><div className="uxqa-desktop-tab-row">{windows ? null : <WindowControls />}<span className="uxqa-desktop-tab">Website preview</span><span className="uxqa-new-tab">+</span>{windows ? <WindowControls /> : null}</div><div className="uxqa-desktop-address-row"><span className="uxqa-glyph"><Icon kind="back" /></span>{windows ? <span className="uxqa-glyph"><Icon kind="refresh" /></span> : null}<Address hostname={hostname} />{windows ? null : <span className="uxqa-glyph"><Icon kind="share" /></span>}<span className="uxqa-glyph"><Icon kind="more" /></span></div></div>;
}

const appLabels: Readonly<Record<string, string>> = { instagram: "Instagram", tiktok: "Web Browser", facebook: "Facebook", linkedin: "LinkedIn" };
function InApp({ profile, hostname }: BrowserChromeProps) {
  const statusHeight = profile.device.id === "iphone-16" ? 59 : profile.device.id === "iphone-se" ? 20 : 24;
  return <><StatusBar profile={profile} /><div className="uxqa-top-chrome uxqa-app-toolbar" style={{ top: statusHeight, height: `calc(var(--uxqa-content-y) - ${statusHeight}px)` }} data-app={profile.browser.appearance}><span className="uxqa-app-glyph"><Icon kind={profile.browser.appearance === "facebook" ? "back" : "close"} /></span><span className="uxqa-app-title"><strong>{appLabels[profile.browser.appearance] ?? profile.browser.label}</strong><span>{hostname}</span></span><span className="uxqa-app-glyph"><Icon kind={profile.browser.appearance === "tiktok" ? "share" : "more"} /></span></div><div className="uxqa-bottom-chrome uxqa-app-bottom"><HomeIndicator /></div></>;
}

export function BrowserChrome(props: BrowserChromeProps) {
  if (props.profile.selection.chrome === "off") return null;
  const rect = getContentRect({ profile: props.profile, chromeState: props.chromeState });
  const style: ChromeStyle = { "--uxqa-content-x": `${rect.x}px`, "--uxqa-content-y": `${rect.y}px`, "--uxqa-content-width": `${rect.width}px`, "--uxqa-content-height": `${rect.height}px` };
  let contents: ReactNode;
  switch (props.profile.browser.appearance) {
    case "ios26-safari": contents = <Ios26 {...props} />; break;
    case "ios-safari-old": contents = <LegacySafari {...props} />; break;
    case "android-chrome": contents = <Android {...props} />; break;
    case "ipad-safari": contents = <Ipad {...props} />; break;
    case "macos-safari": contents = <Desktop hostname={props.hostname} windows={false} />; break;
    case "windows-chrome": contents = <Desktop hostname={props.hostname} windows />; break;
    case "instagram": case "tiktok": case "facebook": case "linkedin": contents = <InApp {...props} />; break;
    default: contents = <div className="uxqa-top-chrome uxqa-neutral-toolbar"><Address hostname={props.hostname} /></div>;
  }
  return <div aria-hidden="true" className="uxqa-browser-chrome" style={style} data-appearance={props.profile.browser.appearance} data-chrome-state={props.chromeState}>{contents}</div>;
}

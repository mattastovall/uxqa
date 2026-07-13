import { useEffect, useRef, useState, type CSSProperties, type IframeHTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { BrowserChrome } from "./BrowserChrome.js";
import { SafariGlassFilter, useSafariGlass } from "./SafariGlass.js";
import { calculateScale } from "./scale.js";
import { getContentRect, getLayoutViewportHeight, type ChromeState, type ResolvedSimulatorProfile } from "./profiles.js";
import { createScrollTelemetry, reduceChromeScroll, type ChromeScrollTracker } from "./scroll.js";
import { handleViewportWheel } from "./viewportInteraction.js";

export type SimulatorIframeProps = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "src" | "title" | "children" | "className" | "style" | "onLoad" | "onError">;
export type SimulatorSource =
  | Readonly<{ src: string; content?: never; title?: string; iframeProps?: SimulatorIframeProps }>
  | Readonly<{ content: ReactNode; src?: never; title?: never; iframeProps?: never }>;

export type SimulatorViewportProps = SimulatorSource & Readonly<{
  profile: ResolvedSimulatorProfile;
  hostname?: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: (event: SyntheticEvent<HTMLIFrameElement>) => void;
  onError?: (error: Error) => void;
}>;

function addressFor(src: string | undefined, override: string | undefined): string {
  if (override) return override;
  if (!src) return "Preview";
  try { return new URL(src, "https://uxqa.local").hostname === "uxqa.local" ? "localhost" : new URL(src, "https://uxqa.local").hostname; }
  catch { return "Preview"; }
}

export function SimulatorViewport(props: SimulatorViewportProps) {
  const { profile, hostname, className, style, onLoad, onError } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const reactContentRef = useRef<HTMLDivElement>(null);
  const detachScrollRef = useRef<(() => void) | null>(null);
  const trackerRef = useRef<ChromeScrollTracker>({ kind: "expanded", downwardPx: 0 });
  const lastScrollYRef = useRef(0);
  const [scale, setScale] = useState(1);
  const [chromeState, setChromeState] = useState<ChromeState>("expanded");
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const iframeSrc = "src" in props ? props.src : undefined;
  const [refractionSafeSrc, setRefractionSafeSrc] = useState<string | null>(null);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setScale(calculateScale({ available: { width: entry.contentRect.width, height: entry.contentRect.height }, screen: profile.device.screen }));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [profile.device.screen]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || iframeSrc === undefined) return;
    const src = iframeSrc;
    const handleError = () => {
      setStatus("error");
      onError?.(new Error(`Preview failed to load: ${src}`));
    };
    frame.addEventListener("error", handleError);
    return () => frame.removeEventListener("error", handleError);
  }, [iframeSrc, onError]);
  useEffect(() => {
    if (iframeSrc !== undefined) setStatus("loading");
  }, [iframeSrc]);
  useEffect(() => {
    trackerRef.current = { kind: "expanded", downwardPx: 0 };
    lastScrollYRef.current = 0;
    setChromeState("expanded");
  }, [profile.browser.id, profile.selection.chrome]);

  useEffect(() => {
    detachScrollRef.current?.();
    detachScrollRef.current = null;
    if (profile.selection.chrome !== "auto" || profile.browser.chrome.kind !== "scroll-linked") return;

    const applyScroll = (scrollY: number, scrollHeight: number, clientHeight: number) => {
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const telemetry = createScrollTelemetry({ scrollY, scrollProgress: maxScroll > 0 ? scrollY / maxScroll : 0, deltaY: scrollY - lastScrollYRef.current, canScroll: maxScroll > 0 });
      lastScrollYRef.current = scrollY;
      trackerRef.current = reduceChromeScroll({ tracker: trackerRef.current, telemetry, behavior: profile.browser.chrome });
      setChromeState(trackerRef.current.kind);
    };

    if (iframeSrc !== undefined) {
      if (status !== "loaded") return;
      const frame = frameRef.current;
      if (!frame) return;
      try {
        const target = frame.contentWindow;
        if (!target) return;
        void target.document.documentElement;
        const handleScroll = () => {
          const root = target.document.documentElement;
          applyScroll(Math.max(0, target.scrollY), root.scrollHeight, root.clientHeight);
        };
        target.addEventListener("scroll", handleScroll, { passive: true });
        const detach = () => target.removeEventListener("scroll", handleScroll);
        detachScrollRef.current = detach;
        return () => {
          detach();
          if (detachScrollRef.current === detach) detachScrollRef.current = null;
        };
      } catch {
        trackerRef.current = { kind: "expanded", downwardPx: 0 };
        setChromeState("expanded");
      }
      return;
    }

    const node = reactContentRef.current;
    if (!node) return;
    const handleScroll = () => applyScroll(node.scrollTop, node.scrollHeight, node.clientHeight);
    node.addEventListener("scroll", handleScroll, { passive: true });
    const detach = () => node.removeEventListener("scroll", handleScroll);
    detachScrollRef.current = detach;
    return () => {
      detach();
      if (detachScrollRef.current === detach) detachScrollRef.current = null;
    };
  }, [iframeSrc, profile.browser.chrome, profile.browser.id, profile.selection.chrome, status]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => handleViewportWheel(viewport, reactContentRef.current, event);
    viewport.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => viewport.removeEventListener("wheel", onWheel, { capture: true });
  }, []);

  const rect = getContentRect({ profile, chromeState });
  const iframeLayoutHeight = getLayoutViewportHeight(profile);
  const safariGlass = useSafariGlass({
    screenRef,
    contentRef,
    enabled: profile.browser.appearance === "ios26-safari" && profile.selection.chrome !== "off" && (iframeSrc === undefined || refractionSafeSrc === iframeSrc),
    transitionMs: profile.browser.chrome.kind === "scroll-linked" ? profile.browser.chrome.transitionMs : 0,
    stateKey: `${profile.browser.id}-${chromeState}`,
  });
  const screenStyle = { width: profile.device.screen.width, height: profile.device.screen.height, borderRadius: profile.device.cornerRadiusPx, transform: `scale(${scale})` };
  const contentStyle = { left: rect.x, top: rect.y, width: rect.width, height: rect.height, transitionDuration: `${profile.browser.chrome.kind === "scroll-linked" ? profile.browser.chrome.transitionMs : 0}ms`, ...(safariGlass ? { filter: `url(#${safariGlass.id})` } : {}) };
  const rootClassName = ["uxqa-viewport", className].filter(Boolean).join(" ");

  return (
    <div
      ref={viewportRef}
      className={rootClassName}
      style={style}
      tabIndex={-1}
      aria-label="Device preview"
      onPointerDown={() => viewportRef.current?.focus({ preventScroll: true })}
    >
      <div ref={screenRef} className="uxqa-screen" style={screenStyle} data-device={profile.device.id} data-browser-appearance={profile.browser.appearance} data-glass-refraction={safariGlass ? "active" : "fallback"}>
        {safariGlass ? <SafariGlassFilter frame={safariGlass} /> : null}
        <BrowserChrome profile={profile} chromeState={chromeState} hostname={addressFor(props.src, hostname)} />
        <div ref={contentRef} className="uxqa-content" style={contentStyle}>
          {"src" in props && props.src !== undefined ? <iframe ref={frameRef} {...props.iframeProps} className="uxqa-frame" style={{ height: iframeLayoutHeight }} src={props.src} title={props.title ?? "Website preview"} onLoad={(event) => {
            setStatus("loaded");
            try {
              void event.currentTarget.contentWindow?.document.documentElement;
              setRefractionSafeSrc(props.src);
            } catch {
              setRefractionSafeSrc(null);
            }
            onLoad?.(event);
          }} /> : <div ref={reactContentRef} className="uxqa-react-content">{props.content}</div>}
        </div>
      </div>
      {"src" in props ? <span className={`uxqa-status uxqa-status--${status}`} role="status">{status === "loading" ? "Loading preview" : status === "loaded" ? "Preview loaded" : "Preview failed to load"}</span> : null}
    </div>
  );
}

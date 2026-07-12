import { useEffect, useRef, useState, type CSSProperties, type IframeHTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { BrowserChrome } from "./BrowserChrome.js";
import { calculateScale } from "./scale.js";
import { getContentRect, type ChromeState, type ResolvedSimulatorProfile } from "./profiles.js";
import { createScrollTelemetry, reduceChromeScroll, type ChromeScrollTracker } from "./scroll.js";

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
  const frameRef = useRef<HTMLIFrameElement>(null);
  const detachScrollRef = useRef<(() => void) | null>(null);
  const trackerRef = useRef<ChromeScrollTracker>({ kind: "expanded", downwardPx: 0 });
  const lastScrollYRef = useRef(0);
  const [scale, setScale] = useState(1);
  const [chromeState, setChromeState] = useState<ChromeState>("expanded");
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const iframeSrc = "src" in props ? props.src : undefined;

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

  useEffect(() => () => detachScrollRef.current?.(), []);
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

  const rect = getContentRect({ profile, chromeState });
  const screenStyle = { width: profile.device.screen.width, height: profile.device.screen.height, borderRadius: profile.device.cornerRadiusPx, transform: `scale(${scale})` };
  const contentStyle = { left: rect.x, top: rect.y, width: rect.width, height: rect.height, transitionDuration: `${profile.browser.chrome.kind === "scroll-linked" ? profile.browser.chrome.transitionMs : 0}ms` };
  const attachScroll = (frame: HTMLIFrameElement) => {
    detachScrollRef.current?.();
    detachScrollRef.current = null;
    if (profile.selection.chrome !== "auto" || profile.browser.chrome.kind !== "scroll-linked") return;
    try {
      const target = frame.contentWindow;
      if (!target) return;
      void target.document.documentElement;
      const handleScroll = () => {
        const scrollY = Math.max(0, target.scrollY);
        const root = target.document.documentElement;
        const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight);
        const telemetry = createScrollTelemetry({ scrollY, scrollProgress: maxScroll > 0 ? scrollY / maxScroll : 0, deltaY: scrollY - lastScrollYRef.current, canScroll: maxScroll > 0 });
        lastScrollYRef.current = scrollY;
        trackerRef.current = reduceChromeScroll({ tracker: trackerRef.current, telemetry, behavior: profile.browser.chrome });
        setChromeState(trackerRef.current.kind);
      };
      target.addEventListener("scroll", handleScroll, { passive: true });
      detachScrollRef.current = () => target.removeEventListener("scroll", handleScroll);
    } catch {
      trackerRef.current = { kind: "expanded", downwardPx: 0 };
      setChromeState("expanded");
    }
  };
  const rootClassName = ["uxqa-viewport", className].filter(Boolean).join(" ");

  return (
    <div ref={viewportRef} className={rootClassName} style={style}>
      <div className="uxqa-screen" style={screenStyle} data-device={profile.device.id}>
        <BrowserChrome profile={profile} chromeState={chromeState} hostname={addressFor(props.src, hostname)} />
        <div className="uxqa-content" style={contentStyle}>
          {"src" in props && props.src !== undefined ? <iframe ref={frameRef} {...props.iframeProps} className="uxqa-frame" src={props.src} title={props.title ?? "Website preview"} onLoad={(event) => { setStatus("loaded"); attachScroll(event.currentTarget); onLoad?.(event); }} /> : <div className="uxqa-react-content">{props.content}</div>}
        </div>
      </div>
      {"src" in props ? <span className={`uxqa-status uxqa-status--${status}`} role="status">{status === "loading" ? "Loading preview" : status === "loaded" ? "Preview loaded" : "Preview failed to load"}</span> : null}
    </div>
  );
}

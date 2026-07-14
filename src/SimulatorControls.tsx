import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { BrowserProfile, DeviceProfile, SimulatorSelection } from "./profiles.js";

export type ControlsVisibility = Readonly<{ device?: boolean; browser?: boolean; chrome?: boolean }>;
export type ControlsVariant = "native" | "compact";
export type SimulatorControlsProps = Readonly<{
  selection: SimulatorSelection;
  devices: readonly DeviceProfile[];
  browsers: readonly BrowserProfile[];
  onSelectionChange: (selection: SimulatorSelection) => void;
  visibility?: ControlsVisibility;
  variant?: ControlsVariant;
}>;

type SelectionActions = Readonly<{
  selectDevice: (deviceId: string) => void;
  selectBrowser: (browserId: string) => void;
  toggleChrome: () => void;
}>;

function selectionActions({ selection, devices, browsers, onSelectionChange }: Omit<SimulatorControlsProps, "visibility" | "variant">): SelectionActions {
  return {
    selectDevice: (deviceId) => {
      const device = devices.find((candidate) => candidate.id === deviceId);
      if (!device) return;
      const nextBrowser = browsers.find((candidate) => candidate.deviceId === device.id && candidate.browserId === device.defaultBrowserId)
        ?? browsers.find((candidate) => candidate.deviceId === device.id);
      if (nextBrowser) onSelectionChange({ ...selection, deviceId: device.id, browserId: nextBrowser.browserId });
    },
    selectBrowser: (browserId) => onSelectionChange({ ...selection, browserId }),
    toggleChrome: () => onSelectionChange({ ...selection, chrome: selection.chrome === "off" ? "auto" : "off" }),
  };
}

function NativeSimulatorControls({ selection, devices, browsers, onSelectionChange, visibility = {} }: Omit<SimulatorControlsProps, "variant">) {
  const compatible = browsers.filter((browser) => browser.deviceId === selection.deviceId);
  const showDevice = visibility.device ?? true;
  const showBrowser = visibility.browser ?? true;
  const showChrome = visibility.chrome ?? true;
  const actions = selectionActions({ selection, devices, browsers, onSelectionChange });

  return (
    <div className="uxqa-controls">
      {showDevice ? (
        <label className="uxqa-control">
          <span className="uxqa-control-label">Device</span>
          <select
            value={selection.deviceId}
            onChange={(event) => actions.selectDevice(event.currentTarget.value)}
          >
            {devices.map((device) => <option key={device.id} value={device.id}>{device.label}</option>)}
          </select>
        </label>
      ) : null}
      {showBrowser ? (
        <label className="uxqa-control">
          <span className="uxqa-control-label">Browser</span>
          <select value={selection.browserId} onChange={(event) => actions.selectBrowser(event.currentTarget.value)}>
            {compatible.map((browser) => <option key={browser.id} value={browser.browserId}>{browser.label}</option>)}
          </select>
        </label>
      ) : null}
      {showChrome ? (
        <label className="uxqa-control uxqa-control--switch">
          <span className="uxqa-control-label">Browser chrome</span>
          <input type="checkbox" role="switch" checked={selection.chrome !== "off"} onChange={actions.toggleChrome} />
        </label>
      ) : null}
    </div>
  );
}

type CompactMenu = "device" | "browser" | null;

function CompactSimulatorControls({ selection, devices, browsers, onSelectionChange, visibility = {} }: Omit<SimulatorControlsProps, "variant">) {
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState<CompactMenu>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const deviceMenuId = useId();
  const browserMenuId = useId();
  const compatible = browsers.filter((browser) => browser.deviceId === selection.deviceId);
  const showDevice = visibility.device ?? true;
  const showBrowser = visibility.browser ?? true;
  const showChrome = visibility.chrome ?? true;
  const actions = selectionActions({ selection, devices, browsers, onSelectionChange });

  const collapseCompactControls = () => {
    setMenu(null);
    setExpanded(false);
  };

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !rootRef.current?.contains(event.target)) setMenu(null);
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu(null);
      setExpanded(false);
      launcherRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const moveOptionFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const options = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    const currentIndex = options.findIndex((option) => option === document.activeElement);
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    event.preventDefault();
    options[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className="uxqa-compact-controls" onMouseEnter={() => setExpanded(true)} onMouseLeave={collapseCompactControls}>
      {expanded ? (
        <div className="uxqa-compact-pill">
          {showDevice ? <div className="uxqa-compact-anchor"><button type="button" className="uxqa-compact-trigger" aria-label={`Device: ${devices.find((device) => device.id === selection.deviceId)?.label ?? selection.deviceId}`} aria-expanded={menu === "device"} aria-controls={deviceMenuId} aria-haspopup="listbox" onClick={() => setMenu((current) => current === "device" ? null : "device")}>{devices.find((device) => device.id === selection.deviceId)?.label}<span aria-hidden="true">▾</span></button>{menu === "device" ? <div id={deviceMenuId} className="uxqa-compact-menu" role="listbox" aria-label="Device options" onKeyDown={moveOptionFocus}>{devices.map((device) => <button key={device.id} type="button" role="option" aria-selected={device.id === selection.deviceId} className="uxqa-compact-option" onClick={() => { actions.selectDevice(device.id); setMenu(null); }}>{device.label}<span>{device.screen.width} × {device.screen.height}</span></button>)}</div> : null}</div> : null}
          {showBrowser ? <div className="uxqa-compact-anchor"><button type="button" className="uxqa-compact-trigger" aria-label={`Browser: ${compatible.find((browser) => browser.browserId === selection.browserId)?.label ?? selection.browserId}`} aria-expanded={menu === "browser"} aria-controls={browserMenuId} aria-haspopup="listbox" onClick={() => setMenu((current) => current === "browser" ? null : "browser")}>{compatible.find((browser) => browser.browserId === selection.browserId)?.label}<span aria-hidden="true">▾</span></button>{menu === "browser" ? <div id={browserMenuId} className="uxqa-compact-menu" role="listbox" aria-label="Browser options" onKeyDown={moveOptionFocus}>{compatible.map((browser) => <button key={browser.id} type="button" role="option" aria-selected={browser.browserId === selection.browserId} className="uxqa-compact-option" onClick={() => { actions.selectBrowser(browser.browserId); setMenu(null); }}>{browser.label}</button>)}</div> : null}</div> : null}
          {showChrome ? <button type="button" className="uxqa-compact-chrome" aria-label={selection.chrome === "off" ? "Show browser chrome" : "Hide browser chrome"} aria-pressed={selection.chrome !== "off"} onClick={actions.toggleChrome}><span aria-hidden="true" />Chrome</button> : null}
          <span className="uxqa-compact-status" aria-live="polite">{`${devices.find((device) => device.id === selection.deviceId)?.label ?? selection.deviceId}, ${compatible.find((browser) => browser.browserId === selection.browserId)?.label ?? selection.browserId}, browser chrome ${selection.chrome === "off" ? "off" : "on"}`}</span>
        </div>
      ) : <button ref={launcherRef} type="button" className="uxqa-compact-launcher" aria-label="Open preview controls" onClick={() => setExpanded(true)}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.5 3.5 18 12l-6.15 1.15L8.5 19.5 5.5 3.5Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" /></svg></button>}
    </div>
  );
}

export function SimulatorControls({ variant = "native", ...props }: SimulatorControlsProps) {
  return variant === "compact" ? <CompactSimulatorControls {...props} /> : <NativeSimulatorControls {...props} />;
}

import type { BrowserProfile, DeviceProfile, SimulatorSelection } from "./profiles.js";

export type ControlsVisibility = Readonly<{ device?: boolean; browser?: boolean; chrome?: boolean }>;
export type SimulatorControlsProps = Readonly<{
  selection: SimulatorSelection;
  devices: readonly DeviceProfile[];
  browsers: readonly BrowserProfile[];
  onSelectionChange: (selection: SimulatorSelection) => void;
  visibility?: ControlsVisibility;
}>;

export function SimulatorControls({ selection, devices, browsers, onSelectionChange, visibility = {} }: SimulatorControlsProps) {
  const compatible = browsers.filter((browser) => browser.deviceId === selection.deviceId);
  const showDevice = visibility.device ?? true;
  const showBrowser = visibility.browser ?? true;
  const showChrome = visibility.chrome ?? true;

  return (
    <div className="uxqa-controls">
      {showDevice ? <label className="uxqa-control">Device<select value={selection.deviceId} onChange={(event) => {
        const device = devices.find((candidate) => candidate.id === event.currentTarget.value);
        if (!device) return;
        const nextBrowser = browsers.find((candidate) => candidate.deviceId === device.id && candidate.browserId === device.defaultBrowserId)
          ?? browsers.find((candidate) => candidate.deviceId === device.id);
        if (nextBrowser) onSelectionChange({ ...selection, deviceId: device.id, browserId: nextBrowser.browserId });
      }}>{devices.map((device) => <option key={device.id} value={device.id}>{device.label}</option>)}</select></label> : null}
      {showBrowser ? <label className="uxqa-control">Browser<select value={selection.browserId} onChange={(event) => onSelectionChange({ ...selection, browserId: event.currentTarget.value })}>{compatible.map((browser) => <option key={browser.id} value={browser.browserId}>{browser.label}</option>)}</select></label> : null}
      {showChrome ? <label className="uxqa-control uxqa-control--checkbox"><input type="checkbox" checked={selection.chrome !== "off"} onChange={(event) => onSelectionChange({ ...selection, chrome: event.currentTarget.checked ? "auto" : "off" })} />Browser chrome</label> : null}
    </div>
  );
}

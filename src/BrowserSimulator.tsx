"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { SimulatorControls, type ControlsVisibility } from "./SimulatorControls.js";
import { SimulatorViewport, type SimulatorSource } from "./SimulatorViewport.js";
import { BUILT_IN_BROWSERS, BUILT_IN_DEVICES, DEFAULT_SELECTION, resolveSimulatorSelection, validateProfiles, type SimulatorProfiles, type SimulatorSelection } from "./profiles.js";

type ControlledSelection = Readonly<{ selection: SimulatorSelection; onSelectionChange: (selection: SimulatorSelection) => void; defaultSelection?: never }>;
type UncontrolledSelection = Readonly<{ selection?: never; onSelectionChange?: (selection: SimulatorSelection) => void; defaultSelection?: SimulatorSelection }>;
export type BrowserSimulatorProps = SimulatorSource & (ControlledSelection | UncontrolledSelection) & Readonly<{
  controls?: boolean | ControlsVisibility;
  profiles?: SimulatorProfiles;
  className?: string;
  style?: CSSProperties;
  hostname?: string;
  onLoad?: React.ComponentProps<typeof SimulatorViewport>["onLoad"];
  onError?: (error: Error) => void;
}>;

export function BrowserSimulator(props: BrowserSimulatorProps) {
  const { controls = true, profiles: customProfiles, className, style, hostname, onLoad, onError } = props;
  const [internalSelection, setInternalSelection] = useState(props.defaultSelection ?? DEFAULT_SELECTION);
  const profileResult = useMemo(() => validateProfiles({
    devices: [...BUILT_IN_DEVICES, ...(customProfiles?.devices ?? [])],
    browsers: [...BUILT_IN_BROWSERS, ...(customProfiles?.browsers ?? [])],
  }), [customProfiles]);
  const profiles = profileResult.ok ? profileResult.profiles : { devices: BUILT_IN_DEVICES, browsers: BUILT_IN_BROWSERS };
  const requested = props.selection ?? internalSelection;
  const resolved = resolveSimulatorSelection(requested, profiles);
  const controlledInvalid = props.selection !== undefined && (resolved.selection.deviceId !== props.selection.deviceId || resolved.selection.browserId !== props.selection.browserId || resolved.selection.chrome !== props.selection.chrome);

  useEffect(() => {
    if (!profileResult.ok) onError?.(new Error(`Invalid simulator profiles: ${profileResult.errors.join("; ")}`));
  }, [onError, profileResult]);
  useEffect(() => {
    if (controlledInvalid) onError?.(new Error(`Invalid controlled simulator selection: ${requested.deviceId}/${requested.browserId}`));
  }, [controlledInvalid, onError, requested.browserId, requested.deviceId]);

  const changeSelection = (selection: SimulatorSelection) => {
    if (props.selection === undefined) setInternalSelection(selection);
    props.onSelectionChange?.(selection);
  };
  const controlProps = typeof controls === "object" ? { visibility: controls } : {};
  const viewportShared = {
    profile: resolved,
    ...(hostname === undefined ? {} : { hostname }),
    ...(onLoad === undefined ? {} : { onLoad }),
    ...(onError === undefined ? {} : { onError }),
  };

  if (!profileResult.ok) {
    return (
      <div className={["uxqa-simulator", className].filter(Boolean).join(" ")} style={style}>
        <div className="uxqa-profile-error" role="alert">
          <strong>Invalid simulator profiles</strong>
          <span>{profileResult.errors.join("; ")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={["uxqa-simulator", className].filter(Boolean).join(" ")} style={style}>
      {controls !== false ? <SimulatorControls selection={resolved.selection} devices={profiles.devices} browsers={profiles.browsers} onSelectionChange={changeSelection} {...controlProps} /> : null}
      {"src" in props && props.src !== undefined
        ? <SimulatorViewport src={props.src} {...(props.title === undefined ? {} : { title: props.title })} {...(props.iframeProps === undefined ? {} : { iframeProps: props.iframeProps })} {...viewportShared} />
        : <SimulatorViewport content={props.content} {...viewportShared} />}
    </div>
  );
}

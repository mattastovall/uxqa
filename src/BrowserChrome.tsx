import type { ChromeState, ResolvedSimulatorProfile } from "./profiles.js";

export type BrowserChromeProps = Readonly<{
  profile: ResolvedSimulatorProfile;
  chromeState: ChromeState;
  hostname: string;
}>;

export function BrowserChrome({ profile, chromeState, hostname }: BrowserChromeProps) {
  if (profile.selection.chrome === "off") return null;
  return (
    <div
      aria-hidden="true"
      className="uxqa-browser-chrome"
      data-appearance={profile.browser.appearance}
      data-state={chromeState}
    >
      <div className="uxqa-browser-chrome__status"><span>9:41</span><span>● ● ●</span></div>
      <div className="uxqa-browser-chrome__toolbar">
        <span className="uxqa-browser-chrome__control">‹</span>
        <span className="uxqa-browser-chrome__address">{hostname}</span>
        <span className="uxqa-browser-chrome__control">⋯</span>
      </div>
    </div>
  );
}

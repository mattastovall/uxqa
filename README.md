# uxqa

`uxqa` is a framework-independent React component for previewing a page or React node in calibrated device and browser chrome. It ships plain CSS, keeps React external, and never changes your routes, URL, or storage.

## Quick starts

### Vite

```sh
npm install uxqa
```

```tsx
import { BrowserSimulator } from "uxqa";
import "uxqa/styles.css";

export function Preview() {
  return <BrowserSimulator className="preview" src="/campaign" />;
}
```

Give the component a bounded container so scale-to-fit has useful dimensions:

```css
.preview { height: min(800px, 80vh); }
.preview .uxqa-viewport { height: 100%; }
```

### Next.js App Router

Import the stylesheet from `app/layout.tsx`:

```tsx
import "uxqa/styles.css";
```

Render the simulator from a client component:

```tsx
"use client";

import { BrowserSimulator } from "uxqa";

export function Preview() {
  return <BrowserSimulator className="preview" src="/campaign" />;
}
```

The package includes a client boundary and does not import Next.js. Keep authentication and recursion prevention in your application.

### Astro with React

Install and configure `@astrojs/react`, then use a React component:

```tsx
import { BrowserSimulator } from "uxqa";
import "uxqa/styles.css";

export default function Preview() {
  return <BrowserSimulator className="preview" src="/campaign" />;
}
```

Hydrate it from Astro with `<Preview client:load />`.

## Usage

### Controlled selection

```tsx
import { useState } from "react";
import { BrowserSimulator, type SimulatorSelection } from "uxqa";
import "uxqa/styles.css";

export function Preview() {
  const [selection, setSelection] = useState<SimulatorSelection>({
    deviceId: "iphone-16",
    browserId: "safari",
    chrome: "auto",
  });

  return <BrowserSimulator className="preview" src="/campaign" selection={selection} onSelectionChange={setSelection} />;
}
```

Use `defaultSelection` for uncontrolled state. A controlled `selection` requires `onSelectionChange`; the TypeScript API rejects contradictory controlled and uncontrolled props.

### React content

Pass `content` instead of `src` when an iframe is unnecessary:

```tsx
<BrowserSimulator className="preview" content={<CampaignCard />} controls={false} />
```

`src` and `content` are mutually exclusive.

### Iframe behavior and security

Same-origin frames can progressively collapse and expand supported browser chrome based on scrolling. Cross-origin pages still render, but browser security prevents `uxqa` from reading their DOM or scroll position, so scroll-linked chrome stays safely expanded. Cross-origin fallback is expected behavior, not an error.

The component does not set `sandbox` by default. Apply the permissions appropriate for content you trust through `iframeProps`:

```tsx
<BrowserSimulator
  className="preview"
  src="https://example.com"
  iframeProps={{
    sandbox: "allow-scripts allow-forms",
    allow: "clipboard-read; clipboard-write",
    referrerPolicy: "no-referrer",
    loading: "lazy",
  }}
/>
```

Do not combine `allow-scripts` and `allow-same-origin` for untrusted same-origin content. A destination can also refuse embedding through CSP `frame-ancestors` or `X-Frame-Options`; the host application owns authentication and embedding policy.

### Controls and styling

`controls` accepts `true`, `false`, or `{ device?, browser?, chrome? }`. Override the address label with `hostname`, and use `className` or `style` on the simulator root.

Supported CSS custom properties are:

| Variable | Default | Purpose |
| --- | --- | --- |
| `--uxqa-canvas-background` | `#eef1f5` | Viewport canvas |
| `--uxqa-control-background` | `#ffffff` | Select background |
| `--uxqa-control-color` | `#17202a` | Controls and labels |
| `--uxqa-radius` | `16px` | Canvas and error radius |
| `--uxqa-shadow` | device shadow | Simulated screen shadow |
| `--uxqa-min-height` | `480px` | Minimum viewport height |

All library selectors are prefixed with `uxqa-`. Prefer CSS variables over targeting internal structure.

### Custom profiles

Custom profiles are additive. Each device needs at least one compatible browser and its `defaultBrowserId` must match one. Geometry must fit inside the device screen.

```tsx
import { BrowserSimulator, type SimulatorProfiles } from "uxqa";

const profiles: SimulatorProfiles = {
  devices: [{
    id: "kiosk",
    label: "Kiosk",
    platform: "windows",
    screen: { width: 1080, height: 1920 },
    defaultBrowserId: "chrome",
    cornerRadiusPx: 0,
  }],
  browsers: [{
    id: "kiosk/chrome",
    deviceId: "kiosk",
    browserId: "chrome",
    label: "Chrome",
    appearance: "windows-chrome",
    chrome: { kind: "fixed", content: { x: 0, y: 86, width: 1080, height: 1834 } },
    calibration: { capturedVersion: "Project kiosk", capturedAt: "2026-07-11", source: "project measurement" },
  }],
};

<BrowserSimulator className="preview" src="/kiosk" profiles={profiles} defaultSelection={{ deviceId: "kiosk", browserId: "chrome", chrome: "auto" }} />;
```

Use `validateProfiles` when loading profile data at runtime.

## Public API

`BrowserSimulator` accepts exactly one of `src` or `content`; `title`; controlled `selection` and `onSelectionChange` or uncontrolled `defaultSelection`; `controls`; additive `profiles`; `className`; `style`; `hostname`; `iframeProps`; `onLoad`; and `onError`.

`SimulatorViewport` is the headless viewport for custom controls. `SimulatorControls` and `BrowserChrome` are also exported for composition.

The package exports the related component prop types plus `DeviceProfile`, `BrowserProfile`, `SimulatorProfiles`, `SimulatorSelection`, `ResolvedSimulatorProfile`, `ChromeBehavior`, `ChromeMode`, and geometry/telemetry types. Data and helpers include `BUILT_IN_DEVICES`, `BUILT_IN_BROWSERS`, `DEVICE_IDS`, `BROWSER_IDS`, `DEFAULT_SELECTION`, `resolveSimulatorSelection`, `validateProfiles`, `getContentRect`, `reduceChromeScroll`, `createScrollTelemetry`, and `calculateScale`.

## Local development

Requires Node.js 22 and npm.

```sh
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run demo:dev
```

The Vite demo consumes `uxqa` and `uxqa/styles.css` through the local workspace package, never source or internal paths. Browser verification runs with:

```sh
npx playwright install chromium
npm run test:e2e
```

## Release

Publication is a maintainer-controlled action:

1. Update `CHANGELOG.md` and the package version.
2. Run `npm run check` and `npm run test:e2e`.
3. Inspect `npm pack --dry-run`.
4. Push a `v<package-version>` tag, then manually run the GitHub `Publish` workflow against that tag. The workflow verifies that the selected tag matches `package.json` and publishes through npm trusted publishing with provenance.

Configure npm trusted publishing for the `mattastovall/uxqa` repository, the `npm` GitHub environment, and `.github/workflows/publish.yml` before the first release. Publish runs are manual-only and must target the matching version tag; selecting a branch fails the release gate.

No npm publication occurs automatically from a branch or tag push.

## License

MIT

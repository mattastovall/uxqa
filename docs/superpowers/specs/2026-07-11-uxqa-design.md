# uxqa design

## Goal

Extract the browser and device simulator proven in `bc-landing` into a standalone React library that most web projects can install and use in a few minutes. The first release must preserve the useful simulator behavior without importing BlueChew routes, Next.js navigation, or application-specific persistence.

## Chosen approach

Publish one package named `uxqa` with a small React API and plain CSS. React and React DOM are peer dependencies. The package ships compiled ESM, CommonJS, declarations, and a documented stylesheet export.

Two alternatives were rejected:

1. A web-component package would work outside React, but it would require a second rendering boundary and a new state/event model before the existing implementation could move. That raises the first-release cost and makes the React integration worse.
2. A Next.js-specific package would make the extraction quick, but it would exclude Vite, Astro React islands, Remix, and other React projects. Routing and URL state belong in host adapters.

The initial package targets React projects. Its public types and DOM behavior should leave room for a future framework-neutral core, but v1 will not claim support it does not test.

## User workflow

The shortest integration is:

```tsx
import { BrowserSimulator } from "uxqa";
import "uxqa/styles.css";

export function Preview() {
  return <BrowserSimulator src="/campaign" />;
}
```

This renders an iPhone 16 Safari preview with controls. A controlled integration can pass a selection and receive changes:

```tsx
import {
  BrowserSimulator,
  type SimulatorSelection,
} from "uxqa";
import "uxqa/styles.css";

export function Preview() {
  const [selection, setSelection] = useState<SimulatorSelection>({
    deviceId: "iphone-16",
    browserId: "safari",
    chrome: "auto",
  });

  return (
    <BrowserSimulator
      src="/campaign"
      selection={selection}
      onSelectionChange={setSelection}
    />
  );
}
```

The README must include working recipes for Vite, Next.js App Router, and Astro with React. It must explain same-origin capabilities and cross-origin limitations before users encounter them.

## Package boundaries

The package owns:

- Device and browser profile data.
- Device frame sizing and responsive scale-to-fit behavior.
- Browser chrome rendering.
- Scroll-linked expanded and collapsed browser chrome.
- The iframe lifecycle and load/error status.
- Optional built-in controls for device, browser, and chrome selection.
- Controlled and uncontrolled selection.
- CSS custom properties and class names documented for safe visual customization.
- Public helpers for profile lookup and custom profile validation.

Host applications own:

- Routing and recursion prevention.
- Query parameters and shareable URLs.
- Session or local storage.
- Multi-page comparison and synchronized scrolling.
- Product-specific route lists.
- Authentication and iframe permissions.
- Deciding whether mobile visitors see the simulator or direct content.

`bc-landing` will remain unchanged in the first repository commit. The extracted package must first prove parity in its own example. Adopting `uxqa` back into `bc-landing` is a separate, reviewable change after the package repository is ready.

## Public API

The main export is `BrowserSimulator`. Its source is either `src: string` or `content: ReactNode`, represented as a discriminated union so consumers cannot pass both. Selection is either uncontrolled through `defaultSelection` or controlled through `selection` and `onSelectionChange`, also represented as a union.

Core props:

- `src` or `content`
- `title` for iframe accessibility
- `selection` and `onSelectionChange`, or `defaultSelection`
- `controls`: `true`, `false`, or a structured visibility object
- `profiles` for additive custom device/browser profiles
- `className` and `style`
- `iframeProps`, excluding fields controlled by the simulator
- `onLoad`, `onError`, and `onSelectionChange`
- `hostname` to override the address shown in browser chrome

Built-in identifiers use literal unions. Custom profiles use caller-defined string identifiers but must pass runtime validation at the package boundary. Invalid selections fall back predictably in uncontrolled mode and produce an actionable error callback in controlled mode.

The package also exports profile types, built-in profile constants, selection resolution helpers, and a headless `SimulatorViewport` component for teams that want their own controls.

## Rendering and data flow

`BrowserSimulator` resolves the current selection, validates the selected device/browser pair, and passes an immutable resolved profile to `SimulatorViewport`. The viewport measures its available area with `ResizeObserver`, calculates one scale value, and renders the fixed-size simulated screen centered inside the available area.

The iframe or content layer renders inside a profile-defined content rectangle. Browser chrome is visual and does not intercept content interaction unless a rendered control is intentionally interactive. Same-origin iframe scroll events may update scroll-linked chrome. Cross-origin frames retain fixed safe chrome state because the browser prevents DOM and scroll inspection.

Built-in controls change selection through one callback. In uncontrolled mode the component stores selection locally. The package never writes to browser storage or the URL.

## Styling

Ship one explicit `uxqa/styles.css` import. Do not inject styles at runtime and do not require Tailwind. Scope selectors under a stable `uxqa-` prefix. Expose a small set of CSS custom properties for canvas background, control colors, radius, shadow, and minimum height.

The default layout must work inside a normal block container. It must not require a full-screen parent. The README will show both fixed-height and viewport-height containers.

## Accessibility

- The iframe requires a useful title, with a clear default for simple use.
- Controls use native buttons and selects or equivalent keyboard-operable listboxes.
- Visible focus styles meet contrast requirements.
- Browser chrome decoration is hidden from assistive technology.
- Loading and error states use polite live-region status text.
- Reduced-motion preferences disable chrome animation.
- Labels expose device and browser names, not internal IDs.

## Error handling

The component displays a compact error state if the iframe fires an error or a profile is invalid. Development builds log enough context to fix invalid profile definitions. Cross-origin restrictions are a supported reduced-capability mode, not an error.

The public API must not accept contradictory props. Runtime validation covers JavaScript consumers and data-loaded custom profiles. Errors name the invalid field and expected shape.

## Repository and release setup

The standalone GitHub repository is `uxqa`. It uses npm, TypeScript, tsup, Vitest, React Testing Library, ESLint, and Playwright for a browser smoke test. The demo is a small Vite app inside the repository and must consume the built package through its public exports.

The repository includes:

- MIT license.
- Package README and examples.
- Contribution and release instructions.
- GitHub Actions for lint, typecheck, unit tests, build, package-content checks, and browser smoke testing.
- npm provenance-compatible publish configuration.
- Changesets or a documented manual version process. The first release can use the smaller manual process if every command is scripted and verified.

The package name and GitHub repository name are available as of 2026-07-11. GitHub authentication is active. npm authentication is not active, so the repository can be made publish-ready and pushed, but an npm release cannot complete until the user authenticates with npm and confirms public publication.

## Verification

The work is ready for publication only when all of the following pass:

- Unit tests for profiles, selection resolution, scale calculation, and scroll-linked chrome reduction.
- Component tests for default, controlled, uncontrolled, content, invalid-profile, and loading/error states.
- Type tests for mutually exclusive public props.
- Production library build with no bundled React copy.
- `npm pack --dry-run` contains only intended package files.
- The demo imports from `uxqa` public exports, starts successfully, and renders each built-in device/browser combination.
- Playwright exercises the default integration, changes device/browser, interacts with iframe content, and captures no console errors.
- README steps are run from a clean temporary consumer project.
- GitHub Actions uses the same commands as local verification.

## First-release exclusions

- No Vue, Svelte, or web-component wrapper.
- No hosted preview service.
- No screenshot or visual-regression cloud service.
- No browser extension.
- No persistence or URL-state opinion.
- No multi-page comparison UI.
- No promise of pixel-perfect browser chrome beyond the documented calibration snapshots.

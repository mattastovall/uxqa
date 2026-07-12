# uxqa library implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a standalone, tested React device and browser simulator package with a one-component default integration.

**Architecture:** Pure profile and scroll modules feed a controlled or uncontrolled React simulator. `BrowserSimulator` composes an optional toolbar and the headless `SimulatorViewport`; the viewport owns scale-to-fit measurement, iframe or React-content rendering, and browser chrome. Application routing, storage, URL state, and multi-page comparison remain outside the package.

**Tech Stack:** Node 22, npm, TypeScript 5, React 18 and 19 peers, tsup, Vitest, React Testing Library, Vite demo, Playwright, ESLint, GitHub Actions.

## Global constraints

- The package name and GitHub repository name are exactly `uxqa`.
- The default consumer path is `import { BrowserSimulator } from "uxqa"`, `import "uxqa/styles.css"`, then `<BrowserSimulator src="/campaign" />`.
- The package has no Next.js, Tailwind, routing, persistence, analytics, or BlueChew dependency.
- React and React DOM remain external peer dependencies with supported range `>=18 <20`.
- Ship ESM, CommonJS, declarations, and the explicit `uxqa/styles.css` export.
- Source props and controlled versus uncontrolled selection use discriminated unions; do not accept contradictory states.
- All CSS selectors use the `uxqa-` prefix and do not modify consumer global elements.
- Cross-origin iframes render safely without DOM access; same-origin scroll-linked behavior is progressive enhancement.
- Do not set an iframe sandbox by default. Consumers may pass `sandbox`, `allow`, `referrerPolicy`, and `loading` through `iframeProps`.
- The package never rewrites `src`, writes storage, or changes the browser URL.
- npm publication remains a user-controlled final action after npm authentication.

---

### Task 1: Package foundation and pure simulator model

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `.gitignore`
- Create: `src/profiles.ts`
- Create: `src/scroll.ts`
- Create: `src/scale.ts`
- Create: `tests/profiles.test.ts`
- Create: `tests/scroll.test.ts`
- Create: `tests/scale.test.ts`

**Interfaces:**
- Produces `DeviceProfile`, `BrowserProfile`, `SimulatorSelection`, `ResolvedSimulatorProfile`, `BUILT_IN_DEVICES`, `BUILT_IN_BROWSERS`, `DEFAULT_SELECTION`, `resolveSimulatorSelection`, `validateProfiles`, `getContentRect`, `reduceChromeScroll`, and `calculateScale`.
- Built-in IDs cover iPhone 16, iPhone SE, Pixel, iPad, MacBook, and Windows Desktop with Safari, legacy Safari, Chrome, Instagram, TikTok, Facebook, and LinkedIn where compatible.

- [ ] **Step 1: Write pure-model tests**

  Cover default selection, every built-in geometry pair, incompatible browser fallback, invalid custom geometry, fixed and scroll-linked rectangles, threshold transitions, telemetry parsing, and scale containment without a minimum that can overflow.

- [ ] **Step 2: Run the tests and verify the missing modules fail**

  Run `npm test -- --run`. Expected: test collection or imports fail because source modules are absent.

- [ ] **Step 3: Implement the package configuration and pure modules**

  Use discriminated unions for fixed versus scroll-linked chrome. Runtime profile validation returns `{ ok: true, profiles } | { ok: false, errors }`. Keep calibration metadata descriptive and make no pixel-perfect claim.

- [ ] **Step 4: Install dependencies and generate the lockfile**

  Run `npm install`. Do not install globally and do not replace npm with another package manager.

- [ ] **Step 5: Verify the pure model**

  Run `npm run typecheck && npm test -- --run`. Expected: all pure-model tests pass with no TypeScript errors.

- [ ] **Step 6: Commit**

  Commit with subject `feat: add simulator profile model`.

### Task 2: React simulator, browser chrome, styles, and component tests

**Files:**
- Create: `src/BrowserChrome.tsx`
- Create: `src/SimulatorViewport.tsx`
- Create: `src/SimulatorControls.tsx`
- Create: `src/BrowserSimulator.tsx`
- Create: `src/index.ts`
- Create: `src/styles.css`
- Create: `tests/browser-simulator.test.tsx`
- Create: `tests/public-types.test.tsx`
- Modify: `vitest.config.ts`
- Modify: `tsup.config.ts`

**Interfaces:**
- Produces `BrowserSimulator`, `SimulatorViewport`, `SimulatorControls`, `BrowserSimulatorProps`, `SimulatorViewportProps`, `SimulatorControlsProps`, and the public exports from Task 1.
- `BrowserSimulatorProps` combines `src` or `content` with controlled `selection` plus required `onSelectionChange`, or uncontrolled `defaultSelection`.

- [ ] **Step 1: Write component and public-type tests**

  Test default iframe integration, accessible title, content mode, controlled and uncontrolled changes, toolbar visibility, iframe attribute passthrough, hostname override, invalid controlled selection reporting, load/error status, same-origin scroll attachment, cross-origin fallback, ResizeObserver cleanup, and multiple-instance isolation. Add `@ts-expect-error` cases proving `src` plus `content` and `selection` without a callback do not compile.

- [ ] **Step 2: Run tests and verify component imports fail**

  Run `npm test -- --run tests/browser-simulator.test.tsx tests/public-types.test.tsx`. Expected: imports fail before implementation.

- [ ] **Step 3: Implement the components**

  Port only neutral chrome markup and styles. Replace hard-coded product titles with props. Use native selects and a checkbox in the default toolbar. Use `ResizeObserver` only in effects, do not touch browser globals during module evaluation, and render scroll-linked chrome expanded when iframe DOM access is unavailable.

- [ ] **Step 4: Implement scoped CSS and public exports**

  Prefix every selector with `uxqa-`, expose documented custom properties, support reduced motion, visible focus, loading/error live regions, and container-local sizing. Mark the package entry with `"use client"` compatibility without importing Next.js.

- [ ] **Step 5: Verify components and production output**

  Run `npm run lint && npm run typecheck && npm test -- --run && npm run build`. Inspect `dist` and confirm React is not bundled and `styles.css` is exported.

- [ ] **Step 6: Commit**

  Commit with subject `feat: add reusable browser simulator`.

### Task 3: Demo, integration documentation, and browser verification

**Files:**
- Create: `demo/index.html`
- Create: `demo/package.json`
- Create: `demo/src/main.tsx`
- Create: `demo/src/App.tsx`
- Create: `demo/src/demo.css`
- Create: `playwright.config.ts`
- Create: `e2e/simulator.spec.ts`
- Create: `README.md`
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- The demo consumes only `uxqa` and `uxqa/styles.css` public package exports through a workspace/file package link.
- README recipes cover Vite, Next.js App Router, and Astro React, including container height, same-origin limits, cross-origin fallback, iframe security options, controlled usage, custom styling, and custom profiles.

- [ ] **Step 1: Build the demo from public exports**

  Show the one-component default, controlled selection, content mode, and a same-origin scrolling page. Do not import `src` or internal paths.

- [ ] **Step 2: Add Playwright tests**

  Verify the default simulator renders, device and browser controls change visible chrome, iframe content remains interactive, same-origin scrolling updates supported chrome, keyboard focus reaches every control, and the browser console has no errors.

- [ ] **Step 3: Write integration and maintenance documentation**

  Put the three-framework quick starts near the top. Document all public props and exports, CSS variables, iframe permissions, cross-origin behavior, custom profiles, local development, verification, and release commands.

- [ ] **Step 4: Verify the demo and documented path**

  Run `npm run build`, start the demo with the repository script, and run `npm run test:e2e`. Create a clean temporary Vite consumer, install the packed tarball, paste the README quick start, build it, and remove the temporary directory.

- [ ] **Step 5: Commit**

  Commit with subject `docs: add integration demo and guides`.

### Task 4: CI, package audit, GitHub repository, and publication readiness

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/publish.yml`
- Create: `scripts/verify-package.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`

**Interfaces:**
- `npm run check` runs lint, typecheck, unit/component tests, build, and package verification.
- Publishing uses GitHub Actions trusted publishing with npm provenance and a manual `workflow_dispatch` release gate.

- [ ] **Step 1: Add deterministic package verification**

  The script runs or checks `npm pack --json`, fails if required public files are absent, fails if source/tests/demo files leak into the tarball, and prints the exact tarball name and unpacked size.

- [ ] **Step 2: Add CI and publish workflows**

  CI runs supported Node versions and a browser job. Publish requires the full check, validates the tag matches `package.json`, and runs `npm publish --provenance --access public` only through manual dispatch or a version tag.

- [ ] **Step 3: Run the complete local release gate**

  Run `npm ci && npm run check && npm run test:e2e && npm pack --dry-run`. Expected: every command passes and the tarball contains only documented package files.

- [ ] **Step 4: Inspect the complete diff and repository status**

  Confirm no BlueChew names, Next imports, absolute local paths, secrets, build artifacts, or untracked required files remain. Confirm package metadata points to `https://github.com/mattastovall/uxqa`.

- [ ] **Step 5: Commit and create the private GitHub repository**

  Commit with subject `chore: prepare uxqa for publication`. Create private repository `mattastovall/uxqa`, set `origin`, and push the implementation branch. Do not publish to npm.

- [ ] **Step 6: Verify remote state**

  Run `gh repo view mattastovall/uxqa --json name,visibility,url,defaultBranchRef`, `git remote -v`, and `git status --short`. Report the GitHub URL, commit, checks, and the single remaining npm authentication/publication action.

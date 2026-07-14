# Compact Simulator Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in compact control surface to `BrowserSimulator` and use it on the uxqa.dev landing preview.

**Architecture:** `BrowserSimulator` receives a backward-compatible `controlVariant` prop and passes it to `SimulatorControls`. `SimulatorControls` owns compact-pill state and emits the existing `SimulatorSelection` changes. Package CSS supplies the generic floating controls; site CSS supplies only the landing-stage theme.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Vite.

## Global Constraints

- `controlVariant` defaults to `"native"`.
- `controls` retains its existing boolean-or-visibility-object API.
- The compact variant has no new dependencies and no `bc-landing` imports.
- Device and browser options always come from the resolved package profiles.

---

### Task 1: Add the compact controls contract

**Files:**
- Modify: `src/SimulatorControls.tsx`
- Modify: `src/BrowserSimulator.tsx`
- Modify: `tests/browser-simulator.test.tsx`
- Modify: `tests/public-types.test.tsx`

**Interfaces:**
- Produces: `ControlVariant = "native" | "compact"` and `controlVariant?: ControlVariant` on `BrowserSimulatorProps`.
- Consumes: existing `SimulatorSelection`, profile arrays, visibility controls, and selection callback.

- [x] **Step 1: Write failing compact control tests**

  Render `<BrowserSimulator src="/" controlVariant="compact" />`, activate the labelled launcher, select a device and browser option, toggle chrome, and press Escape. Assert the matching selection/chrome DOM state and that native select controls are absent.

- [x] **Step 2: Run the focused test**

  Run `npm test -- --run tests/browser-simulator.test.tsx`.
  Expected: FAIL because `controlVariant` and compact controls do not exist.

- [x] **Step 3: Implement the minimal control variant**

  Add the `ControlVariant` union, pass it through `BrowserSimulator`, and render a button-based compact control surface. Keep device/browser menu state mutually exclusive, close it on Escape and outside pointer input, and use existing selection transformations.

- [x] **Step 4: Run focused tests and type checks**

  Run `npm test -- --run tests/browser-simulator.test.tsx tests/public-types.test.tsx` and `npm run typecheck`.
  Expected: PASS.

### Task 2: Style the generic compact control surface

**Files:**
- Modify: `src/styles.css`
- Modify: `tests/browser-chrome.test.tsx`

**Interfaces:**
- Consumes: compact controls' `uxqa-compact-*` class names.
- Produces: bottom-aligned launcher, pill, menus, selected state, and reduced-motion behavior.

- [x] **Step 1: Extend the CSS contract test**

  Assert the compact launcher, pill, listbox, option, and reduced-motion selectors exist in `src/styles.css`.

- [x] **Step 2: Run the focused CSS contract test**

  Run `npm test -- --run tests/browser-chrome.test.tsx`.
  Expected: FAIL because compact CSS selectors do not exist.

- [x] **Step 3: Implement compact CSS**

  Add a positioning context to the simulator viewport and style the compact elements with existing `--uxqa-control-*` tokens. Menus open upward within the viewport, options have visible selected and focus states, and the generic canvas remains consumer-controlled.

- [x] **Step 4: Run focused tests**

  Run `npm test -- --run tests/browser-chrome.test.tsx tests/browser-simulator.test.tsx`.
  Expected: PASS.

### Task 3: Opt uxqa.dev into the compact presentation

**Files:**
- Modify: `site/src/App.tsx`
- Modify: `site/src/site.css`

**Interfaces:**
- Consumes: `BrowserSimulator` with `controlVariant="compact"`.
- Produces: a landing-only dark preview stage that lets the device and floating controls stand apart from the page panel.

- [x] **Step 1: Update the landing hero invocation**

  Pass `controlVariant="compact"` to the existing `BrowserSimulator` without changing the `PreviewPage` content or hostname.

- [x] **Step 2: Replace the generic panel overrides**

  Remove the native-control overrides that only style selects and switches. Theme the compact control tokens and reduce the outer preview-panel framing so the stage remains dark and the device is the focal object.

- [x] **Step 3: Build and inspect**

  Run `npm run build && npm run build --workspace site`, then open the site and verify the launcher expands, options update the device/browser, and the Safari control remains legible.

### Task 4: Run the complete verification suite

**Files:**
- Verify only.

- [x] **Step 1: Run all checks**

  Run `npm run check && npm run build --workspace site && git diff --check`.
  Expected: all commands exit successfully and the diff has no whitespace errors.

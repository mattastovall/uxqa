# Compact Simulator Controls Design

## Goal

Make the polished preview controls available to `BrowserSimulator` without changing the current default controls or importing application-specific code from `bc-landing`.

## API

Add `controlVariant?: "native" | "compact"` to `BrowserSimulatorProps`. It defaults to `"native"`. `controls` keeps its current meaning: `false` hides controls and an object limits visible controls. `controlVariant="compact"` uses the same selection callback and the same visibility object.

## Compact control behavior

The compact variant initially presents a labelled cursor button. Activating it reveals a floating control pill at the bottom of the simulator viewport. Device and browser buttons open mutually-exclusive, upward-opening listboxes. Selecting a device also selects that device's default compatible browser; selecting a browser changes only the browser. The chrome button toggles `auto` and `off`. Escape closes menus and collapses the pill; clicking outside a menu closes it. The cursor button, triggers, options, and chrome control retain visible focus states and button/listbox semantics.

## Layout and styling

The package keeps the generic viewport behavior but adds compact-control CSS that positions the launcher and pill over the viewport. Menus remain inside the viewport and open upward. Existing custom properties continue to set colors, borders, radius, canvas, and shadow. uxqa.dev opts into the compact variant and removes the generic outer preview panel treatment so the device floats on a restrained dark stage.

## Non-goals

Do not copy BlueChew's version picker, pinning, preview status, iframe integration, or application-specific styling. Do not change the native controls' markup or behavior. Do not add dependencies.

## Verification

Add browser-simulator tests for the compact control launcher, menu selection, compatibility reset, chrome toggle, Escape behavior, and native-control regression. Build the package and the site, then visually inspect uxqa.dev's hero preview.

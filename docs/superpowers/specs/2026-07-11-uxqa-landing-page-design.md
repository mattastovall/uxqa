# uxqa landing page design

## Goal

Create a public landing page at `uxqa.dev` that explains uxqa to frontend engineers and design/QA teams, demonstrates the package honestly, and gets a React developer from interest to a working install without reading the full repository first.

## Direction

Use a dark, precise developer-tool visual language with an actual interactive `BrowserSimulator` in the hero. The page should feel like a useful review instrument, not a generic SaaS template. Typography, grid lines, compact labels, and the simulated device provide the visual identity; no stock photography or decorative illustration is needed.

The page uses one route and six sections:

1. A compact navigation bar with uxqa wordmark, section links, and GitHub link.
2. A hero with the headline `See the page your users actually see.`, concise explanation, install and GitHub actions, proof strip, and a working simulator.
3. An audience bridge explaining the engineer and design/QA use cases side by side.
4. Concrete value cards covering calibrated viewport context, shared review language, framework independence, composability, interactive content, and honest cross-origin fallback.
5. A getting-started section with install, import, component, and sizing code that can be copied independently.
6. Feature proof, FAQ, and a final GitHub/get-started call to action.

## Messaging guardrails

uxqa is a React device and browser preview component. It is not a real device emulator, automated test runner, visual regression service, screenshot cloud, or replacement for real-device testing. Avoid `pixel-perfect`, `test every device`, `catch every responsive bug`, and `works with any website`.

Name current, verifiable support: React 18 and 19, Vite, Next.js App Router, Astro React, six device profiles, compatible Safari/Chrome/in-app browser profiles, iframe or React content, controlled or uncontrolled state, custom profiles, CSS variables, and MIT license.

## Interaction

The hero simulator renders React content directly so it works on GitHub Pages without iframe path assumptions. Built-in native uxqa controls remain visible and demonstrate device/browser switching. Copy buttons provide clear copied feedback and use the Clipboard API with a safe fallback. Navigation anchors use native links. Motion is limited to small entrance and hover transitions and respects `prefers-reduced-motion`.

## Responsive and accessible behavior

Desktop uses a two-column hero with copy and simulator. Tablet and mobile stack the simulator below the copy. The simulator gets a bounded responsive height and remains usable down to 320 CSS pixels. The page uses semantic regions, a skip link, visible keyboard focus, sufficient contrast, labeled copy actions, live copied feedback, and no interaction that requires hover.

## Technical structure

Add a `site` npm workspace built by Vite. It imports `uxqa` and `uxqa/styles.css` through public package exports only. Vite uses relative asset paths so both `mattastovall.github.io/uxqa/` and `uxqa.dev` work. The repository root gains `site:dev` and `site:build` scripts.

GitHub Pages deploys `site/dist` through an Actions workflow using the official Pages actions pinned to full commit SHAs. The workflow runs after CI succeeds on the selected production branch and supports manual dispatch. GitHub Pages uses `build_type: workflow` and custom domain `uxqa.dev`.

## Domain sequence

1. Deploy and verify `https://mattastovall.github.io/uxqa/` before changing DNS.
2. Add `uxqa.dev` to the GitHub Pages repository settings.
3. Replace the two existing Cloudflare apex A records with the four current GitHub Pages apex A records in DNS-only mode.
4. Add DNS-only `www` CNAME to `mattastovall.github.io` so GitHub redirects it to the apex.
5. Wait for GitHub domain validation and certificate issuance, enable HTTPS, and verify apex and www.
6. Keep records DNS-only for the initial cutover. Cloudflare proxying is optional later after GitHub HTTPS is stable.

DNS changes must happen only after the default Pages deployment is healthy. Do not add wildcard records. Do not leave unrelated apex A/AAAA records that interfere with GitHub validation.

## Verification

- Lint, TypeScript, library tests, library build, and package verification remain green.
- Site production build succeeds and contains no absolute `/uxqa` asset assumptions.
- Browser verification covers desktop and mobile layout, simulator controls, copy feedback, navigation anchors, keyboard focus, and zero console errors.
- GitHub Pages deployment succeeds at the exact pushed commit.
- Default Pages URL returns the landing page before DNS changes.
- `dig` returns the four GitHub Pages A records after cutover.
- `https://uxqa.dev` returns the landing page with a valid certificate.
- `https://www.uxqa.dev` redirects to the apex.

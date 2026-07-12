# uxqa landing page implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and publish an interactive uxqa landing page through GitHub Pages and route `uxqa.dev` to it through Cloudflare DNS.

**Architecture:** A Vite React workspace consumes uxqa only through public exports. GitHub Actions builds and deploys the static output. Cloudflare remains authoritative DNS and points the apex and www hostnames to GitHub Pages after the default Pages origin is healthy.

**Tech Stack:** React 19, TypeScript, Vite, uxqa, Playwright, GitHub Pages Actions, Cloudflare DNS.

## Global constraints

- Audience is frontend engineers and design/QA teams equally.
- Use the exact headline `See the page your users actually see.`
- Do not describe uxqa as a real device emulator or automated testing service.
- The live hero uses uxqa public exports; no internal source imports.
- Site assets work at both the project Pages path and the custom-domain root.
- Existing package checks stay green.
- Change Cloudflare DNS only after the default GitHub Pages deployment is healthy.
- Initial GitHub Pages DNS records remain DNS-only until GitHub HTTPS is active.

### Task 1: Build the landing page

**Files:** Create `site/package.json`, `site/index.html`, `site/src/main.tsx`, `site/src/App.tsx`, `site/src/site.css`; modify root `package.json`, lockfile, ESLint config; add focused site tests if component logic warrants them.

- [ ] Create the site workspace and red build/test proof.
- [ ] Implement semantic hero, actual BrowserSimulator demo, audience/value sections, copyable getting-started commands, feature proof, FAQ, and final CTA.
- [ ] Implement responsive, reduced-motion, focus, contrast, and copy-feedback behavior.
- [ ] Run site build, lint, typecheck, package checks, and browser verification at desktop/mobile sizes.
- [ ] Commit as `feat: add uxqa landing page`.

### Task 2: Publish with GitHub Pages

**Files:** Create `.github/workflows/pages.yml`; modify README with site link if appropriate.

- [ ] Add pinned official GitHub Pages workflow actions with required Pages permissions and environment.
- [ ] Build and upload `site/dist` without Jekyll processing.
- [ ] Commit as `ci: publish uxqa site to github pages`, push `codex/uxqa-site`, configure Pages `build_type: workflow`, and dispatch deployment.
- [ ] Wait for a successful Pages deployment at the exact commit and verify `https://mattastovall.github.io/uxqa/` content and assets.

### Task 3: Connect uxqa.dev through Cloudflare

- [ ] Set GitHub Pages custom domain to `uxqa.dev` before DNS mutation.
- [ ] Replace existing apex records with DNS-only A records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
- [ ] Add DNS-only `www` CNAME to `mattastovall.github.io`.
- [ ] Verify DNS answers, GitHub domain status, certificate state, and enable HTTPS when available.
- [ ] Verify the live apex page and www redirect. If certificate issuance is pending, keep monitoring until active or report the exact external wait state without proxying early.

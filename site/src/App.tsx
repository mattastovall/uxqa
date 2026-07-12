import { useRef, useState, type ReactNode } from "react";
import { BrowserSimulator } from "uxqa";

const REPOSITORY = "https://github.com/mattastovall/uxqa";

type CopyState = { kind: "idle" } | { kind: "copied" } | { kind: "failed" };

function PreviewPage() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="preview-page">
      <div className="preview-nav"><span className="preview-mark">north/</span><span>Menu</span></div>
      <div className="preview-hero">
        <p className="preview-kicker">FIELD NOTES · 04</p>
        <h2>Take the<br />long way.</h2>
        <p>A pocket guide to weekends beyond the last train stop.</p>
        <button type="button" onClick={() => setChecked((value) => !value)}>{checked ? "Saved to your list" : "Save this route"}</button>
      </div>
      <div className="preview-footer"><span>42.3601° N</span><span>Scroll to explore</span></div>
    </div>
  );
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard !== undefined && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch {
    return false;
  }
}

function CopyBlock({ label, code }: Readonly<{ label: string; code: string }>) {
  const [state, setState] = useState<CopyState>({ kind: "idle" });
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    window.clearTimeout(timer.current);
    setState((await writeClipboard(code)) ? { kind: "copied" } : { kind: "failed" });
    timer.current = window.setTimeout(() => setState({ kind: "idle" }), 1800);
  };

  const feedback = state.kind === "copied" ? "Copied" : state.kind === "failed" ? "Copy failed" : "Copy";
  return (
    <div className="code-block">
      <div className="code-head"><span>{label}</span><button type="button" onClick={copy} aria-label={`Copy ${label}`}>{feedback}</button></div>
      <pre><code>{code}</code></pre>
      <span className="sr-only" aria-live="polite">{state.kind === "idle" ? "" : feedback}</span>
    </div>
  );
}

function SectionHead({ title, children }: Readonly<{ title: string; children?: ReactNode }>) {
  return <div className="section-head"><h2>{title}</h2>{children}</div>;
}

const values = [
  ["01", "Calibrated viewport context", "Review the content area inside the device and browser chrome that changes how a layout feels."],
  ["02", "Shared review language", "Name the exact device and browser profile in a design note, bug report, or pull request."],
  ["03", "Framework-ready", "Use uxqa with React 18 or 19 in Vite, Next.js App Router, or Astro React."],
  ["04", "Composable by default", "Choose controlled or uncontrolled state, add custom profiles, and tune the appearance with CSS variables."],
  ["05", "Keep content interactive", "Render a React node directly or load a page in an iframe. Forms, links, and scroll stay usable."],
  ["06", "Clear iframe boundaries", "Same-origin frames can drive scroll-linked chrome. Cross-origin pages can render when their embedding policy allows it, but their scroll position stays private."],
] as const;

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="uxqa home"><span>ux</span>qa<span className="mark-dot">.</span></a>
        <nav aria-label="Main navigation"><a href="#use-cases">Use cases</a><a href="#features">Features</a><a href="#start">Docs</a></nav>
        <a className="github-link" href={REPOSITORY}>GitHub <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>See the page your users actually see.</h1>
            <p className="hero-lede">Put your React UI inside calibrated device and browser chrome. Review responsive work with the context that screenshots leave out.</p>
            <div className="hero-actions"><a className="button button-primary" href="#start">Get started</a><a className="button button-secondary" href={REPOSITORY}>View on GitHub <span aria-hidden="true">↗</span></a></div>
            <div className="proof-strip" aria-label="Package support"><span>React 18 + 19</span><span>6 device profiles</span><span>7 browser profiles</span><span>MIT licensed</span></div>
          </div>
          <div className="hero-demo" aria-label="Interactive uxqa demo">
            <div className="demo-label"><span>LIVE PREVIEW</span><span>Try the controls ↓</span></div>
            <div className="simulator-shell"><BrowserSimulator content={<PreviewPage />} hostname="north.example" /></div>
          </div>
        </section>

        <section className="audience section" id="use-cases">
          <SectionHead title="One preview. A clearer conversation."><p>uxqa gives the people building an interface and the people reviewing it the same frame of reference.</p></SectionHead>
          <div className="audience-grid">
            <article><span className="article-number">01 / BUILD</span><h3>For frontend engineers</h3><p>Catch cramped controls, browser chrome collisions, and layouts that only work at a convenient desktop width before review.</p><ul><li>Drop into an existing React app</li><li>Control profile state from your own UI</li><li>Render React content or an iframe</li></ul></article>
            <article><span className="article-number">02 / REVIEW</span><h3>For design and QA teams</h3><p>Review a working interface in named viewport conditions without passing around a folder of disconnected screenshots.</p><ul><li>Switch device and browser profiles live</li><li>Interact, scroll, and inspect real states</li><li>Use a shared profile name in feedback</li></ul></article>
          </div>
        </section>

        <section className="values section" id="features">
          <SectionHead title="Context without the theater."><p>uxqa is a preview component. It does its job well and leaves automated tests and real-device validation to the tools made for them.</p></SectionHead>
          <div className="value-grid">{values.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="start section" id="start">
          <SectionHead title="Running in under a minute."><p>Install the package, import the public component and stylesheet, then give its container a height.</p></SectionHead>
          <div className="code-grid">
            <CopyBlock label="1 · Install" code="npm install uxqa" />
            <CopyBlock label="2 · Import" code={'import { BrowserSimulator } from "uxqa";\nimport "uxqa/styles.css";'} />
            <CopyBlock label="3 · Render" code={'<BrowserSimulator\n  className="preview"\n  content={<YourPage />}\n  hostname="your-app.dev"\n/>'} />
            <CopyBlock label="4 · Size" code={'.preview {\n  height: min(760px, 80vh);\n}\n\n.preview .uxqa-viewport {\n  height: 100%;\n}'} />
          </div>
        </section>

        <section className="proof section">
          <p className="compatibility">Works with <strong>Vite</strong>, <strong>Next.js App Router</strong>, and <strong>Astro React</strong>. Supports Safari, Chrome, and compatible in-app browser profiles.</p>
        </section>

        <section className="faq section" id="faq">
          <SectionHead title="What uxqa is, and isn't." />
          <div className="faq-list">
            <details><summary>Is uxqa a real device emulator?</summary><p>No. It is a React preview component that models viewport and browser chrome. Use physical devices and platform emulators for final device validation.</p></details>
            <details><summary>Does it run automated tests?</summary><p>No. uxqa does not replace a test runner, visual regression service, or screenshot cloud. It makes interactive review easier.</p></details>
            <details><summary>Can it show any website?</summary><p>It can render your React content directly or load iframe-compatible pages. Cross-origin sites can block embedding with their security headers.</p></details>
            <details><summary>Can I add my own device?</summary><p>Yes. Pass custom device and browser profiles, or use the six built-in device profiles and seven built-in browser profiles.</p></details>
          </div>
        </section>

        <section className="final-cta section"><h2>Put the viewport back in context.</h2><div className="hero-actions"><a className="button button-primary" href="#start">Install uxqa</a><a className="button button-secondary" href={REPOSITORY}>Read the source <span aria-hidden="true">↗</span></a></div></section>
      </main>
      <footer><a className="wordmark" href="#top"><span>ux</span>qa<span className="mark-dot">.</span></a><p>React device and browser previews. MIT licensed.</p><a href={REPOSITORY}>GitHub ↗</a></footer>
    </>
  );
}

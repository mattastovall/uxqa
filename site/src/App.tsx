import { useRef, useState, type ReactNode } from "react";
import { BrowserSimulator } from "uxqa";

const REPOSITORY = "https://github.com/mattastovall/uxqa";

type CopyState = { kind: "idle" } | { kind: "copied" } | { kind: "failed" };

function PreviewPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="preview-page">
      <header className="preview-nav"><span className="preview-mark">north/</span><span>Menu</span></header>
      <main className="preview-main">
        <p className="preview-kicker">Field notes</p>
        <h2>Routes beyond the last stop.</h2>
        <p className="preview-lede">Day trips reachable by train — no car needed.</p>
        <button type="button" onClick={() => setSaved((value) => !value)}>{saved ? "Saved" : "Save route"}</button>
      </main>
      <footer className="preview-footer"><span>42.3601° N</span><span>Scroll</span></footer>
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

function CopyBlock({ label, code, compact }: Readonly<{ label: string; code: string; compact?: boolean }>) {
  const [state, setState] = useState<CopyState>({ kind: "idle" });
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    window.clearTimeout(timer.current);
    setState((await writeClipboard(code)) ? { kind: "copied" } : { kind: "failed" });
    timer.current = window.setTimeout(() => setState({ kind: "idle" }), 1800);
  };

  const feedback = state.kind === "copied" ? "Copied" : state.kind === "failed" ? "Copy failed" : "Copy";
  return (
    <div className={compact ? "code-block code-block--compact" : "code-block"}>
      {!compact && (
        <div className="code-head"><span>{label}</span><button type="button" onClick={copy} aria-label={`Copy ${label}`}>{feedback}</button></div>
      )}
      <div className={compact ? "code-body" : undefined}>
        <pre><code>{code}</code></pre>
        {compact && <button type="button" className="code-copy" onClick={copy} aria-label={`Copy ${label}`}>{feedback}</button>}
      </div>
      <span className="sr-only" aria-live="polite">{state.kind === "idle" ? "" : feedback}</span>
    </div>
  );
}

function SectionHead({ title, children }: Readonly<{ title: string; children?: ReactNode }>) {
  return <div className="section-head"><h2>{title}</h2>{children}</div>;
}

const startSteps = [
  { label: "Install", code: "npm install uxqa" },
  { label: "Import", code: 'import { BrowserSimulator } from "uxqa";\nimport "uxqa/styles.css";' },
  { label: "Render", code: '<BrowserSimulator\n  className="preview"\n  content={<YourPage />}\n  hostname="your-app.dev"\n/>' },
  { label: "Size", code: '.preview {\n  height: min(760px, 80vh);\n}\n\n.preview .uxqa-viewport {\n  height: 100%;\n}' },
] as const;

function GettingStartedCarousel() {
  const [index, setIndex] = useState(0);
  const step = startSteps[index] ?? startSteps[0];
  const prev = () => setIndex((value) => (value === 0 ? startSteps.length - 1 : value - 1));
  const next = () => setIndex((value) => (value === startSteps.length - 1 ? 0 : value + 1));

  return (
    <div className="start-carousel" id="start">
      <p className="start-carousel-kicker">Getting started</p>
      <div className="start-carousel-panel">
        <div className="start-carousel-toolbar">
          <div className="start-tabs" role="tablist" aria-label="Getting started steps">
            {startSteps.map((item, stepIndex) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={stepIndex === index}
                className={stepIndex === index ? "is-active" : undefined}
                onClick={() => setIndex(stepIndex)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="start-carousel-nav" aria-label="Step navigation">
            <button type="button" onClick={prev} aria-label="Previous step">←</button>
            <span aria-live="polite">{index + 1}/{startSteps.length}</span>
            <button type="button" onClick={next} aria-label="Next step">→</button>
          </div>
        </div>
        <CopyBlock label={step.label} code={step.code} compact />
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="uxqa home"><span>ux</span>qa<span className="mark-dot">.</span></a>
        <nav aria-label="Main navigation"><a href="#start">Get started</a><a href="#faq">FAQ</a></nav>
        <a className="github-link" href={REPOSITORY}>GitHub <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <h1>See the page your users actually see.</h1>
            <p className="hero-lede">Put your React UI inside calibrated device and browser chrome. Review responsive work with the context that screenshots leave out.</p>
            <div className="hero-actions"><a className="button button-primary" href={REPOSITORY}>View on GitHub <span aria-hidden="true">↗</span></a></div>
          </div>
          <div className="hero-demo" aria-label="Interactive uxqa demo">
            <div className="demo-label"><span>LIVE PREVIEW</span><span>Try the controls ↓</span></div>
            <div className="simulator-shell"><BrowserSimulator content={<PreviewPage />} hostname="north.example" /></div>
          </div>
          <GettingStartedCarousel />
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

      </main>
      <footer><a className="wordmark" href="#top"><span>ux</span>qa<span className="mark-dot">.</span></a><p>React device and browser previews. MIT licensed.</p><a href={REPOSITORY}>GitHub ↗</a></footer>
    </>
  );
}

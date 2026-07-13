import { useRef, useState, type ReactNode } from "react";
import { BrowserSimulator } from "uxqa";
import "uxqa/styles.css";

const REPOSITORY = "https://github.com/mattastovall/uxqa";

type CopyState = { kind: "idle" } | { kind: "copied" } | { kind: "failed" };

const shell =
  "mx-auto w-[min(1280px,calc(100%-48px))] px-[env(safe-area-inset-left)_env(safe-area-inset-right)] max-sm:w-[min(100%-28px,1280px)]";

const previewRoutes = [
  { code: "01", name: "Provincetown", time: "2h 14m", note: "Ferry + bike" },
  { code: "02", name: "Rockport", time: "1h 02m", note: "Coastal loop" },
  { code: "03", name: "Concord", time: "48m", note: "Walk + picnic" },
  { code: "04", name: "Salem", time: "36m", note: "Harbor walk" },
] as const;

const previewStops = [
  { label: "North Station", detail: "Depart 08:12" },
  { label: "Beverly Depot", detail: "Transfer" },
  { label: "Gloucester", detail: "Arrive 09:41" },
] as const;

function PreviewPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex min-h-full flex-col bg-preview font-sans text-preview-ink">
      <header className="sticky top-0 z-[1] flex items-center justify-between border-b border-preview-line bg-preview/92 px-5 py-4 font-mono text-[10px] font-medium tracking-[0.08em] uppercase backdrop-blur-[8px]">
        <span className="text-[15px] font-semibold tracking-[-0.04em] text-preview-ink normal-case">north/</span>
        <span>Menu</span>
      </header>

      <section
        className="flex min-h-[min(520px,72vh)] flex-col justify-center px-5 pt-9 pb-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 100% 0%, #dfe8e2 0%, transparent 55%), linear-gradient(180deg, #f5f5f2 0%, #ecece6 100%)",
        }}
      >
        <p className="mb-2.5 font-mono text-[10px] font-medium tracking-[0.1em] text-muted uppercase">Field notes</p>
        <h2 className="mb-3 max-w-[14ch] text-[clamp(28px,7vw,36px)] font-medium leading-[1.12] tracking-[-0.03em]">
          Routes beyond the last stop.
        </h2>
        <p className="mb-[22px] max-w-[30ch] text-sm leading-normal text-dim">Day trips reachable by train — no car needed.</p>
        <button
          type="button"
          className="w-fit cursor-pointer border border-preview-ink bg-preview-ink px-[18px] py-3 font-mono text-[11px] font-medium tracking-[0.06em] text-preview uppercase hover:bg-[#333]"
          onClick={() => setSaved((value) => !value)}
        >
          {saved ? "Saved" : "Save route"}
        </button>
      </section>

      <section
        className="mx-4 grid min-h-[200px] grid-cols-[1.4fr_.6fr] gap-4 px-5 py-6 text-preview max-[420px]:grid-cols-1"
        style={{ background: "linear-gradient(135deg, #1f3a34 0%, #2d5a4a 48%, #1a2e28 100%)" }}
        aria-label="Featured corridor"
      >
        <div>
          <p className="mb-2.5 font-mono text-[10px] font-medium tracking-[0.1em] text-preview/55 uppercase">This weekend</p>
          <h3 className="mb-2.5 text-[22px] font-medium tracking-[-0.03em]">Gloucester line</h3>
          <p className="m-0 max-w-[28ch] text-[13px] leading-normal text-preview/72">
            Salt air, lobster rolls, and a harbor that still smells like work.
          </p>
        </div>
        <div className="flex flex-col items-end justify-between font-mono text-[11px] font-medium tracking-[0.08em] text-preview/55 max-[420px]:flex-row max-[420px]:items-center" aria-hidden="true">
          <span className="grid size-11 place-items-center rounded-full border border-preview/35 text-xs text-preview">NE</span>
          <span>42.6°</span>
        </div>
      </section>

      <section className="px-5 py-7" aria-label="Suggested routes">
        <div>
          <p className="mb-2.5 font-mono text-[10px] font-medium tracking-[0.1em] text-muted uppercase">Suggested</p>
          <h3 className="mb-[18px] text-xl font-medium tracking-[-0.03em]">Four easy exits</h3>
        </div>
        <ul className="m-0 list-none border-t border-preview-line p-0">
          {previewRoutes.map((route) => (
            <li key={route.code} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b border-preview-line py-3.5">
              <span className="font-mono text-[11px] font-medium text-muted">{route.code}</span>
              <div>
                <strong className="block text-[15px] font-semibold tracking-[-0.02em]">{route.name}</strong>
                <span className="text-xs text-preview-muted">{route.note}</span>
              </div>
              <em className="font-mono text-xs font-medium text-preview-ink not-italic">{route.time}</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 items-stretch gap-4 bg-[#ebebe4] px-5 py-7 max-[420px]:grid-cols-1" aria-label="Sample itinerary">
        <div
          className="relative min-h-[180px]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 23px, rgb(26 26 26 / 6%) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgb(26 26 26 / 6%) 24px), linear-gradient(160deg, #d8e4dc, #c5d4cb)",
          }}
          aria-hidden="true"
        >
          <span className="absolute top-[18%] left-[22%] grid size-7 place-items-center rounded-full bg-preview-ink font-mono text-[11px] font-semibold text-preview">A</span>
          <span className="absolute right-[18%] bottom-[22%] grid size-7 place-items-center rounded-full bg-band-mid font-mono text-[11px] font-semibold text-preview">B</span>
          <span className="absolute inset-[18%_28%] rotate-[-18deg] rounded-[999px_999px_40%_40%] border-2 border-dashed border-preview-ink/35" />
        </div>
        <ol className="m-0 flex list-none flex-col justify-center gap-[18px] p-0 py-2">
          {previewStops.map((stop) => (
            <li key={stop.label} className="border-l-2 border-preview-ink pl-[18px]">
              <strong className="block text-sm font-semibold tracking-[-0.02em]">{stop.label}</strong>
              <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-preview-muted uppercase">{stop.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid grid-cols-[1.3fr_1fr] grid-rows-[120px_100px] gap-2.5 px-5 py-7 max-[420px]:grid-cols-1 max-[420px]:grid-rows-none" aria-label="Mood board">
        <figure
          className="m-0 row-span-2 flex flex-col justify-between p-3.5 text-preview max-[420px]:row-auto max-[420px]:min-h-[140px]"
          style={{ background: "linear-gradient(160deg, #3a4a5c, #1c2430 70%)" }}
        >
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase opacity-70">Pier light</span>
          <figcaption className="text-[15px] font-medium tracking-[-0.02em]">Golden hour · Rockport</figcaption>
        </figure>
        <figure className="m-0 flex flex-col justify-between p-3.5 text-preview" style={{ background: "linear-gradient(180deg, #6b8f71, #3d5c45)" }}>
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase opacity-70">Tide chart</span>
          <figcaption className="text-[15px] font-medium tracking-[-0.02em]">+1.8 ft</figcaption>
        </figure>
        <figure className="m-0 flex flex-col justify-between p-3.5 text-preview" style={{ background: "linear-gradient(135deg, #c47a4a, #8f4e2a)" }}>
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase opacity-70">Snack stop</span>
          <figcaption className="text-[15px] font-medium tracking-[-0.02em]">Clam shack</figcaption>
        </figure>
        <figure className="m-0 flex flex-col justify-between p-3.5 text-preview" style={{ background: "linear-gradient(135deg, #2a2a2a, #111)" }}>
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase opacity-70">Return</span>
          <figcaption className="text-[15px] font-medium tracking-[-0.02em]">18:22</figcaption>
        </figure>
      </section>

      <section className="bg-preview-ink px-5 pt-12 pb-10 text-center text-preview">
        <p className="mb-3 text-[clamp(22px,5vw,28px)] font-medium leading-snug tracking-[-0.03em]">“Leave the car. Take the day.”</p>
        <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-muted uppercase">— north/ field guide</span>
      </section>

      <footer className="flex justify-between border-t border-preview-line px-5 pt-3.5 pb-7 font-mono text-[10px] font-medium tracking-[0.06em] text-muted uppercase">
        <span>42.3601° N</span>
        <span>End of line</span>
      </footer>
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
    <div className={compact ? "min-w-0 border-0 bg-transparent" : "min-w-0 border border-line bg-panel"}>
      {!compact && (
        <div className="flex justify-between gap-3 border-b border-line px-4 py-3 font-mono text-xs tracking-wider text-faint uppercase">
          <span>{label}</span>
          <button type="button" className="min-h-11 shrink-0 cursor-pointer border-0 bg-transparent px-1 font-[inherit] text-inherit uppercase text-[#ccc] hover:text-white" onClick={copy} aria-label={`Copy ${label}`}>
            {feedback}
          </button>
        </div>
      )}
      <div className={compact ? "flex items-start gap-4 px-5 py-[18px] max-sm:flex-col max-sm:p-4" : undefined}>
        <pre className={compact
          ? "m-0 min-h-0 min-w-0 flex-1 overflow-auto p-0 font-mono text-[0.84rem]/1.65] text-ink [-webkit-overflow-scrolling:touch] max-sm:text-[0.8rem]"
          : "m-0 min-h-[120px] max-w-full overflow-auto p-[26px] font-mono text-[0.82rem]/1.7] text-[#ccc] [-webkit-overflow-scrolling:touch] max-sm:min-h-[100px] max-sm:p-4 max-sm:text-xs"
        }>
          <code className="whitespace-pre break-normal">{code}</code>
        </pre>
        {compact && (
          <button
            type="button"
            className="min-h-9 shrink-0 cursor-pointer border border-[#333] bg-transparent px-3 font-mono text-[0.72rem] tracking-[0.04em] text-muted uppercase transition-[color,border-color] duration-[160ms] hover:border-[#666] hover:text-white max-sm:min-h-11 max-sm:self-start"
            onClick={copy}
            aria-label={`Copy ${label}`}
          >
            {feedback}
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">{state.kind === "idle" ? "" : feedback}</span>
    </div>
  );
}

function SectionHead({ title, children }: Readonly<{ title: string; children?: ReactNode }>) {
  return (
    <div className="mb-[58px] grid grid-cols-1 gap-8 max-sm:mb-8 lg:grid-cols-2 lg:gap-[clamp(32px,5vw,80px)]">
      <h2 className="m-0 text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.98] tracking-[-0.06em] text-balance max-sm:mb-4 max-sm:text-[clamp(2rem,10vw,3rem)]">
        {title}
      </h2>
      {children}
    </div>
  );
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
    <div className="mt-2 min-w-0 scroll-mt-6 max-lg:mt-0 [grid-area:start]" id="start">
      <p className="mb-3 font-mono text-xs tracking-[0.08em] text-faint uppercase">Getting started</p>
      <div className="border border-line bg-panel">
        <div className="flex items-stretch justify-between gap-3 border-b border-line max-sm:flex-col max-sm:items-stretch">
          <div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:border-b max-sm:border-line" role="tablist" aria-label="Getting started steps">
            {startSteps.map((item, stepIndex) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={stepIndex === index}
                className={[
                  "min-h-11 shrink-0 cursor-pointer border-0 border-r border-line bg-transparent px-4 font-mono text-[0.72rem] tracking-[0.06em] uppercase transition-[color,background] duration-[160ms]",
                  "max-sm:min-w-0 max-sm:flex-1 max-sm:px-2 max-sm:text-[0.65rem] max-sm:border-b-0",
                  "max-sm:last:border-r-0",
                  stepIndex === index
                    ? "bg-[#1a1a1a] text-white max-sm:shadow-[inset_0_-2px_0_#fff]"
                    : "text-faint hover:text-[#ccc]",
                ].join(" ")}
                onClick={() => setIndex(stepIndex)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1 px-2 font-mono text-[0.72rem] whitespace-nowrap text-dim max-sm:hidden" aria-label="Step navigation">
            <button type="button" className="min-h-9 min-w-9 cursor-pointer border-0 bg-transparent font-[inherit] text-muted hover:text-white" onClick={prev} aria-label="Previous step">←</button>
            <span aria-live="polite">{index + 1}/{startSteps.length}</span>
            <button type="button" className="min-h-9 min-w-9 cursor-pointer border-0 bg-transparent font-[inherit] text-muted hover:text-white" onClick={next} aria-label="Next step">→</button>
          </div>
        </div>
        <CopyBlock label={step.label} code={step.code} compact />
      </div>
    </div>
  );
}

const wordmarkClass = "no-underline text-[1.3rem] font-bold tracking-[-0.08em] [&>span:first-child]:text-white";

export function App() {
  return (
    <>
      <a
        className="fixed top-[max(8px,env(safe-area-inset-top))] left-[max(8px,env(safe-area-inset-left))] z-20 -translate-y-[150%] bg-ink px-3.5 py-2.5 text-canvas focus:translate-y-0"
        href="#main"
      >
        Skip to content
      </a>
      <header className={`${shell} grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center border-b border-line max-sm:min-h-16 max-sm:grid-cols-[1fr_auto] max-sm:gap-4`}>
        <a className={wordmarkClass} href="#top" aria-label="uxqa home">
          <span>ux</span>qa<span className="text-white">.</span>
        </a>
        <nav className="flex gap-8 max-sm:gap-5 max-[380px]:gap-3.5" aria-label="Main navigation">
          <a className="font-mono text-[0.78rem] font-medium tracking-[0.08em] text-muted no-underline uppercase hover:text-white max-sm:text-[0.7rem]" href="#start">Get started</a>
          <a className="font-mono text-[0.78rem] font-medium tracking-[0.08em] text-muted no-underline uppercase hover:text-white max-sm:text-[0.7rem]" href="./uxqa-editor/">Editor</a>
          <a className="font-mono text-[0.78rem] font-medium tracking-[0.08em] text-muted no-underline uppercase hover:text-white max-sm:text-[0.7rem]" href="#faq">FAQ</a>
        </nav>
        <a className="justify-self-end font-mono text-[0.78rem] font-medium tracking-[0.08em] text-muted no-underline uppercase hover:text-white max-sm:hidden" href={REPOSITORY}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main">
        <section
          className={`${shell} grid min-h-[calc(100vh-77px)] grid-cols-1 items-start gap-8 py-[68px] pb-[86px] max-lg:min-h-0 max-sm:gap-7 max-sm:py-10 max-sm:pb-14 lg:grid-cols-[minmax(0,.9fr)_minmax(460px,1.1fr)] lg:gap-x-[clamp(40px,7vw,100px)] lg:gap-y-[clamp(24px,5vw,48px)] lg:[grid-template-areas:'copy_demo'_'start_demo']`}
          id="top"
        >
          <div className="min-w-0 [grid-area:copy]">
            <h1 className="m-0 max-w-[760px] text-[clamp(3.6rem,6.6vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.075em] text-balance max-sm:text-[clamp(2.75rem,14vw,4.5rem)] max-sm:leading-[0.95] max-[380px]:text-[clamp(2.4rem,13vw,3.2rem)]">
              See the page your users see.
            </h1>
            <p className="my-[30px] max-w-[610px] text-[clamp(1rem,1.35vw,1.2rem)] text-muted max-sm:my-5 max-sm:text-base">
              Put your React UI inside calibrated device and browser chrome. Review responsive work with the context that screenshots leave out.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-5 font-mono text-[0.78rem] font-medium tracking-[0.06em] text-canvas no-underline uppercase transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-white max-sm:w-full"
                href={REPOSITORY}
              >
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div
            className="hero-demo min-w-0 self-center border border-line bg-panel p-3.5 shadow-[0_30px_90px_rgb(0_0_0_/_45%)] max-lg:w-full max-lg:max-w-[720px] max-lg:justify-self-center max-sm:p-2.5 max-sm:shadow-[0_16px_48px_rgb(0_0_0_/_35%)] [grid-area:demo]"
            aria-label="Interactive uxqa demo"
          >
            <div className="simulator-shell h-[min(680px,72vh)] min-h-[520px] max-sm:h-[min(560px,62vh)] max-sm:min-h-0 max-[380px]:h-[min(500px,58vh)]">
              <BrowserSimulator content={<PreviewPage />} hostname="north.example" />
            </div>
          </div>
          <GettingStartedCarousel />
        </section>

        <section className={`${shell} border-t border-line py-[clamp(86px,11vw,150px)] max-sm:py-14`} id="faq">
          <SectionHead title="What uxqa is, and isn't." />
          <div className="border-t border-line">
            {[
              {
                q: "Is uxqa a real device emulator?",
                a: "No. It is a React preview component that models viewport and browser chrome. Use physical devices and platform emulators for final device validation.",
              },
              {
                q: "Does it run automated tests?",
                a: "No. uxqa does not replace a test runner, visual regression service, or screenshot cloud. It makes interactive review easier.",
              },
              {
                q: "Can it show any website?",
                a: "It can render your React content directly or load iframe-compatible pages. Cross-origin sites can block embedding with their security headers.",
              },
              {
                q: "Can I add my own device?",
                a: "Yes. Pass custom device and browser profiles, or use the six built-in device profiles and seven built-in browser profiles.",
              },
            ].map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="cursor-pointer list-none py-[25px] pr-[42px] text-[1.15rem] text-balance after:float-right after:font-mono after:text-[1.4rem] after:text-muted after:content-['+'] group-open:after:content-['−'] max-sm:py-5 max-sm:pr-9 max-sm:text-base">
                  {item.q}
                </summary>
                <p className="-mt-1.5 mb-[26px] max-w-[720px] text-muted max-sm:mb-5 max-sm:text-[0.95rem]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className={`${shell} grid grid-cols-[1fr_auto_1fr] items-center border-t border-line py-[30px] pb-[max(30px,env(safe-area-inset-bottom))] font-mono text-xs text-faint max-sm:grid-cols-[1fr_auto] max-sm:gap-4 max-sm:pb-[max(24px,env(safe-area-inset-bottom))]`}>
        <a className={wordmarkClass} href="#top">
          <span>ux</span>qa<span className="text-white">.</span>
        </a>
        <p className="m-0 max-sm:hidden">React device and browser previews. MIT licensed.</p>
        <a className="justify-self-end" href={REPOSITORY}>GitHub ↗</a>
      </footer>
    </>
  );
}

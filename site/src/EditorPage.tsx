import editorCardSelected from "./assets/editor-card-selected.png";

const EDITOR_REPOSITORY = "https://github.com/mattastovall/uxqa-editor";
const EDITOR_DEMO_URL =
  (import.meta.env.VITE_UXQA_EDITOR_DEMO_URL as string | undefined) ?? "http://127.0.0.1:3210/";
const X_PROFILE = "https://x.com/MattAStovall";

const shell =
  "mx-auto w-[min(1280px,calc(100%-48px))] px-[env(safe-area-inset-left)_env(safe-area-inset-right)] max-sm:w-[min(100%-28px,1280px)]";

const wordmarkClass = "no-underline text-[1.3rem] font-bold tracking-[-0.08em] [&>span:first-child]:text-white";

const navClass =
  "font-mono text-[0.78rem] font-medium tracking-[0.08em] text-muted no-underline uppercase hover:text-white max-sm:text-[0.7rem]";

const steps = [
  {
    number: "01",
    title: "Select in place",
    body: "Press Ctrl+Shift+D, then click the element you want to change.",
  },
  {
    number: "02",
    title: "Tune the layout",
    body: "Preview spacing, sizing, alignment, and image settings on the live page.",
  },
  {
    number: "03",
    title: "Copy the delta",
    body: "Send the source-aware edit session to Codex, Cursor, or another coding agent.",
  },
] as const;

export function EditorPage() {
  return (
    <>
      <a
        className="fixed top-[max(8px,env(safe-area-inset-top))] left-[max(8px,env(safe-area-inset-left))] z-20 -translate-y-[150%] bg-ink px-3.5 py-2.5 text-canvas focus:translate-y-0"
        href="#main"
      >
        Skip to content
      </a>

      <header className={`${shell} grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center border-b border-line max-sm:min-h-16 max-sm:grid-cols-[1fr_auto] max-sm:gap-4`}>
        <a className={wordmarkClass} href="../" aria-label="uxqa home">
          <span>ux</span>qa<span className="text-white">.</span>
        </a>
        <nav className="flex gap-8 max-sm:gap-5 max-[380px]:gap-3.5" aria-label="Main navigation">
          <a className={navClass} href="../#start">What</a>
          <a className={`${navClass} text-white`} href="./" aria-current="page">Editor</a>
          <a className={navClass} href="../#faq">FAQ</a>
        </nav>
        <a className={`${navClass} justify-self-end max-sm:hidden`} href={EDITOR_REPOSITORY}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main id="main">
        <section className={`${shell} grid gap-x-[clamp(48px,7vw,112px)] gap-y-12 py-[clamp(64px,9vw,126px)] lg:grid-cols-[minmax(340px,.72fr)_minmax(0,1.28fr)]`} id="top">
          <div className="self-center">
            <p className="mb-5 font-mono text-xs tracking-[0.1em] text-faint uppercase">uxqa-editor</p>
            <h1 className="m-0 max-w-[9ch] text-[clamp(3.7rem,7vw,7.8rem)] font-medium leading-[0.98] tracking-[-0.075em] text-balance max-sm:text-[clamp(3rem,15vw,4.8rem)] max-sm:leading-none">
              Edit the page in the page.
            </h1>
            <p className="my-8 max-w-[570px] text-[clamp(1rem,1.35vw,1.2rem)] text-muted max-sm:my-6">
              Select an element in your running Next.js app. Preview the change, then copy an exact source-aware delta to your coding agent.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-5 font-mono text-[0.78rem] font-medium tracking-[0.06em] text-canvas no-underline uppercase transition-[transform,background] duration-[160ms] hover:-translate-y-0.5 hover:bg-white max-sm:w-full"
                href={EDITOR_REPOSITORY}
              >
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center border border-line px-5 font-mono text-[0.78rem] font-medium tracking-[0.04em] text-ink no-underline transition-[transform,border-color] duration-[160ms] hover:-translate-y-0.5 hover:border-edge max-sm:w-full"
                href="#install"
              >
                Install editor
              </a>
            </div>
          </div>

          <figure className="m-0 self-center border border-line bg-panel p-2.5 shadow-[0_30px_90px_rgb(0_0_0_/_42%)] max-sm:p-1.5">
            <img
              className="block h-auto w-full"
              src={editorCardSelected}
              width="1381"
              height="1322"
              alt="uxqa-editor with a selected image, layer tree, contextual toolbar, and properties panel"
            />
          </figure>
        </section>

        <section className={`${shell} border-t border-line py-[clamp(78px,10vw,140px)]`}>
          <h2 className="m-0 max-w-[10ch] text-[clamp(2.8rem,6vw,6.6rem)] font-medium leading-[0.94] tracking-[-0.065em] text-balance">
            Point, change, copy.
          </h2>
          <ol className="mt-[clamp(48px,7vw,92px)] grid list-none grid-cols-3 gap-0 border-t border-line p-0 max-md:grid-cols-1">
            {steps.map((step) => (
              <li className="border-r border-line px-7 py-8 first:pl-0 last:border-r-0 max-md:border-r-0 max-md:border-b max-md:px-0 max-md:last:border-b-0" key={step.number}>
                <span className="font-mono text-xs text-faint">{step.number}</span>
                <h3 className="mt-8 mb-3 text-[clamp(1.4rem,2vw,2rem)] font-medium tracking-[-0.04em]">{step.title}</h3>
                <p className="m-0 max-w-[33ch] text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${shell} border-t border-line py-[clamp(78px,10vw,140px)]`} id="demo">
          <div className="mb-12 max-w-[740px]">
            <h2 className="m-0 text-[clamp(2.8rem,5.6vw,6rem)] font-medium leading-[0.94] tracking-[-0.065em] text-balance">
              Adjust layout without leaving the browser.
            </h2>
            <p className="mt-7 mb-0 max-w-[620px] text-[clamp(1rem,1.3vw,1.18rem)] text-muted">
              Try the live uxqa-editor fixture below. Press Ctrl+Shift+D, select an element, and preview spacing in authored units before any source file changes.
            </p>
          </div>
          <div className="overflow-hidden border border-line bg-panel" aria-label="Interactive uxqa-editor demo">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
              <p className="m-0 font-mono text-xs tracking-[0.08em] text-faint uppercase">
                Live demo · uxqa-editor
              </p>
              <a
                className="font-mono text-xs tracking-[0.06em] text-muted no-underline uppercase hover:text-white"
                href={EDITOR_DEMO_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open fullscreen <span aria-hidden="true">↗</span>
              </a>
            </div>
            <iframe
              className="block h-[min(820px,78vh)] w-full border-0 bg-[#111] max-sm:h-[min(640px,70vh)]"
              src={EDITOR_DEMO_URL}
              title="uxqa-editor interactive demo"
              loading="lazy"
              allow="clipboard-write"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className={`${shell} grid gap-[clamp(42px,8vw,120px)] border-t border-line py-[clamp(78px,10vw,140px)] lg:grid-cols-[1fr_1fr]`} id="install">
          <div>
            <h2 className="m-0 max-w-[10ch] text-[clamp(2.8rem,5.2vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.065em] text-balance">
              Add it to development.
            </h2>
            <p className="mt-7 mb-0 max-w-[560px] text-muted">
              The editor runs beside your Next.js app. It does not replace the dev server, write source during preview, commit, or push.
            </p>
          </div>
          <div className="self-center border border-line bg-panel">
            <div className="border-b border-line px-5 py-3 font-mono text-xs tracking-[0.08em] text-faint uppercase">Quick start</div>
            <pre className="m-0 overflow-x-auto p-6 font-mono text-sm leading-7 text-ink max-sm:p-4 max-sm:text-xs"><code>{`npx uxqa-editor init\nnpm run dev`}</code></pre>
            <a
              className="flex min-h-12 items-center justify-between border-t border-line px-5 font-mono text-xs tracking-[0.06em] text-muted no-underline uppercase hover:text-white"
              href={`${EDITOR_REPOSITORY}#quick-start`}
            >
              Read the setup guide <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className={`${shell} grid grid-cols-[1fr_auto_1fr] items-center border-t border-line py-[30px] pb-[max(30px,env(safe-area-inset-bottom))] font-mono text-xs text-faint max-sm:grid-cols-[1fr_auto] max-sm:gap-4 max-sm:pb-[max(24px,env(safe-area-inset-bottom))]`}>
        <a className={wordmarkClass} href="../">
          <span>ux</span>qa<span className="text-white">.</span>
        </a>
        <p className="m-0 max-sm:hidden">Development-only visual editing for Next.js.</p>
        <div className="flex items-center gap-3 justify-self-end">
          <a href={EDITOR_REPOSITORY}>GitHub ↗</a>
          <a href={X_PROFILE} aria-label="X" className="inline-flex text-faint hover:text-white">
            <svg aria-hidden="true" className="size-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </footer>
    </>
  );
}

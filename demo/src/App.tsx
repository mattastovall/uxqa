import { useState } from "react";
import {
  BrowserSimulator,
  type SimulatorSelection,
} from "uxqa";

const initialSelection: SimulatorSelection = {
  deviceId: "iphone-16",
  browserId: "safari",
  chrome: "auto",
};

export function EmbeddedPage() {
  return (
    <main className="embedded-page">
      <h1>Same-origin preview</h1>
      <p>The simulator iframe remains a normal, interactive web page.</p>
      <button type="button" onClick={(event) => { event.currentTarget.textContent = "Clicked"; }}>Try interaction</button>
      {Array.from({ length: 16 }, (_, index) => <section key={index}><h2>Section {index + 1}</h2><p>Scroll this page to exercise scroll-linked browser chrome.</p></section>)}
    </main>
  );
}

function ContentExample() {
  return <div className="content-example"><strong>React content mode</strong><p>Render a React node when an iframe is unnecessary.</p></div>;
}

export function App() {
  const [selection, setSelection] = useState<SimulatorSelection>(initialSelection);

  return (
    <main className="demo-shell">
      <header><p className="eyebrow">React device and browser simulator</p><h1>uxqa integration demo</h1><p>All examples import only the package's public API and stylesheet.</p></header>
      <section aria-labelledby="default-heading"><h2 id="default-heading">One-component default</h2><div className="simulator-wrap"><BrowserSimulator src="/?embedded=1" title="Interactive same-origin demo" /></div></section>
      <section aria-labelledby="controlled-heading"><h2 id="controlled-heading">Controlled selection</h2><p data-testid="controlled-value">{selection.deviceId} / {selection.browserId} / {selection.chrome}</p><div className="simulator-wrap"><BrowserSimulator src="/?embedded=1" title="Controlled preview" selection={selection} onSelectionChange={setSelection} /></div></section>
      <section aria-labelledby="content-heading"><h2 id="content-heading">Content mode</h2><div className="simulator-wrap simulator-wrap--compact"><BrowserSimulator content={<ContentExample />} controls={false} /></div></section>
    </main>
  );
}

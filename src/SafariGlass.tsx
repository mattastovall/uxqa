import { Fragment, useEffect, useId, useRef, useState, type RefObject } from "react";
import { createCapsuleDisplacementDataUrl, type GlassFilterFrame, type GlassLensMap } from "./glass.js";

type SafariGlassOptions = Readonly<{
  screenRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  transitionMs: number;
  stateKey: string;
}>;

function measureLensMaps({ screen, content }: Readonly<{ screen: HTMLDivElement; content: HTMLDivElement }>): readonly GlassLensMap[] {
  const screenRect = screen.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const scale = screen.offsetWidth === 0 ? 1 : screenRect.width / screen.offsetWidth;
  if (scale === 0) return [];
  const contentX = (contentRect.left - screenRect.left) / scale;
  const contentY = (contentRect.top - screenRect.top) / scale;
  const contentWidth = contentRect.width / scale;
  const contentHeight = contentRect.height / scale;

  const lenses: GlassLensMap[] = [];
  for (const element of screen.querySelectorAll<HTMLElement>(".uxqa-ios26-side, .uxqa-ios26-address")) {
    const rect = element.getBoundingClientRect();
    const width = rect.width / scale;
    const height = rect.height / scale;
    const x = (rect.left - screenRect.left) / scale;
    const y = (rect.top - screenRect.top) / scale;
    if (width < 1 || height < 1 || x >= contentX + contentWidth || y >= contentY + contentHeight || x + width <= contentX || y + height <= contentY) continue;
    const dataUrl = createCapsuleDisplacementDataUrl({ width, height });
    if (dataUrl) lenses.push({ x, y, width, height, dataUrl });
  }
  return lenses;
}

export function useSafariGlass({ screenRef, contentRef, enabled, transitionMs, stateKey }: SafariGlassOptions): GlassFilterFrame | null {
  const baseId = useId().replaceAll(":", "");
  const revisionRef = useRef(0);
  const previousStateKeyRef = useRef(stateKey);
  const [frame, setFrame] = useState<GlassFilterFrame | null>(null);

  useEffect(() => {
    if (!enabled) {
      setFrame(null);
      return;
    }
    const screen = screenRef.current;
    const content = contentRef.current;
    if (!screen || !content) return;
    const duration = previousStateKeyRef.current === stateKey ? 0 : transitionMs;
    previousStateKeyRef.current = stateKey;
    let animationFrame = 0;
    let lastPaintAt = -Infinity;
    const startedAt = performance.now();

    const update = (now: number) => {
      const animationComplete = now - startedAt >= duration;
      if (now - lastPaintAt >= 32 || animationComplete) {
        lastPaintAt = now;
        const lenses = measureLensMaps({ screen, content });
        revisionRef.current += 1;
        setFrame(lenses.length === 0 ? null : {
          id: `uxqa-glass-${baseId}-${revisionRef.current}`,
          width: screen.offsetWidth,
          height: screen.offsetHeight,
          lenses,
        });
      }
      if (!animationComplete) animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [baseId, contentRef, enabled, screenRef, stateKey, transitionMs]);

  return frame;
}

export function SafariGlassFilter({ frame }: Readonly<{ frame: GlassFilterFrame }>) {
  const finalMap = `uxqa-map-${frame.lenses.length - 1}`;
  return (
    <svg aria-hidden="true" className="uxqa-glass-filter-defs" width="0" height="0">
      <defs>
        <filter id={frame.id} x="0" y="0" width={frame.width} height={frame.height} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodColor="rgb(128 128 128)" result="uxqa-map-neutral" />
          {frame.lenses.map((lens, index) => {
            const lensResult = `uxqa-lens-${index}`;
            const mapResult = `uxqa-map-${index}`;
            const previousMap = index === 0 ? "uxqa-map-neutral" : `uxqa-map-${index - 1}`;
            return (
              <Fragment key={`${lens.x}-${lens.y}-${lens.width}-${lens.height}`}>
                <feImage href={lens.dataUrl} x={lens.x} y={lens.y} width={lens.width} height={lens.height} preserveAspectRatio="none" result={lensResult} />
                <feComposite in={lensResult} in2={previousMap} operator="over" result={mapResult} />
              </Fragment>
            );
          })}
          <feDisplacementMap in="SourceGraphic" in2={finalMap} scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

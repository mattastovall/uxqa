export function findViewportScroller(viewport: HTMLElement, target: EventTarget | null, fallback: HTMLElement | null): HTMLElement | null {
  let node = target instanceof Element ? target : null;
  while (node && viewport.contains(node)) {
    if (node instanceof HTMLElement) {
      const { overflowY } = getComputedStyle(node);
      if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") && node.scrollHeight > node.clientHeight) return node;
    }
    node = node.parentElement;
  }
  return fallback;
}

export function isScrollerAtBoundary(scroller: HTMLElement, deltaY: number): boolean {
  const atTop = scroller.scrollTop <= 0;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  return (deltaY < 0 && atTop) || (deltaY > 0 && atBottom);
}

export function handleViewportWheel(viewport: HTMLElement, fallbackScroller: HTMLElement | null, event: WheelEvent): void {
  if (!viewport.contains(event.target as Node)) return;
  event.stopPropagation();
  const scroller = findViewportScroller(viewport, event.target, fallbackScroller);
  if (!scroller || isScrollerAtBoundary(scroller, event.deltaY)) event.preventDefault();
}

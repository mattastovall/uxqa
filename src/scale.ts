import type { Size } from "./profiles.js";

export function calculateScale({ available, screen }: Readonly<{ available: Size; screen: Size }>): number {
  if (![available.width, available.height, screen.width, screen.height].every(Number.isFinite) || available.width <= 0 || available.height <= 0 || screen.width <= 0 || screen.height <= 0) return 0;
  return Math.min(1, available.width / screen.width, available.height / screen.height);
}

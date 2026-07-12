export type GlassLensMap = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string;
}>;

export type GlassFilterFrame = Readonly<{
  id: string;
  width: number;
  height: number;
  lenses: readonly GlassLensMap[];
}>;

export function createCapsuleDisplacementPixels({ width, height }: Readonly<{ width: number; height: number }>): Uint8ClampedArray {
  const pixelWidth = Math.max(1, Math.round(width));
  const pixelHeight = Math.max(1, Math.round(height));
  const pixels = new Uint8ClampedArray(pixelWidth * pixelHeight * 4);
  const radius = pixelHeight / 2;
  const centerY = pixelHeight / 2;
  const segmentStart = Math.min(radius, pixelWidth / 2);
  const segmentEnd = Math.max(pixelWidth - radius, pixelWidth / 2);

  for (let y = 0; y < pixelHeight; y += 1) {
    for (let x = 0; x < pixelWidth; x += 1) {
      const sampleX = x + .5;
      const sampleY = y + .5;
      const nearestX = Math.min(segmentEnd, Math.max(segmentStart, sampleX));
      const dx = sampleX - nearestX;
      const dy = sampleY - centerY;
      const distance = Math.hypot(dx, dy);
      if (distance > radius) continue;

      const edgeStrength = Math.pow(distance / radius, 3.2);
      const normalX = distance === 0 ? 0 : dx / distance;
      const normalY = distance === 0 ? 0 : dy / distance;
      const offset = (y * pixelWidth + x) * 4;
      pixels[offset] = Math.round(128 - normalX * edgeStrength * 127);
      pixels[offset + 1] = Math.round(128 - normalY * edgeStrength * 127);
      pixels[offset + 2] = 128;
      pixels[offset + 3] = 255;
    }
  }

  return pixels;
}

export function createCapsuleDisplacementDataUrl({ width, height }: Readonly<{ width: number; height: number }>): string | null {
  if (typeof document === "undefined" || typeof CanvasRenderingContext2D === "undefined") return null;
  const pixelWidth = Math.max(1, Math.round(width));
  const pixelHeight = Math.max(1, Math.round(height));
  const canvas = document.createElement("canvas");
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(pixelWidth, pixelHeight);
  image.data.set(createCapsuleDisplacementPixels({ width: pixelWidth, height: pixelHeight }));
  context.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

import maplibregl from 'maplibre-gl';

interface PulsingDotOptions {
  size: number;
  color: [number, number, number];
}

export function createPulsingDot(
  map: maplibregl.Map,
  { size, color }: PulsingDotOptions
): maplibregl.StyleImageInterface {
  const [r, g, b] = color;

  return {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    onAdd() {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      (this as any).context = canvas.getContext('2d');
    },

    render() {
      const duration = 1500;
      const t = (performance.now() % duration) / duration;

      const ctx = (this as any).context as CanvasRenderingContext2D;
      const radius = (size / 2) * 0.3;
      const outerRadius = (size / 2) * 0.7 * t + radius;

      ctx.clearRect(0, 0, size, size);

      // Outer ring (fades out)
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${1 - t})`;
      ctx.fill();

      // Inner circle (solid)
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2 + (4 * (1 - t));
      ctx.fill();
      ctx.stroke();

      this.data = ctx.getImageData(0, 0, size, size).data as unknown as Uint8Array;

      map.triggerRepaint();
      return true;
    }
  };
}

export const INTENSITY_CONFIGS = {
  low: { size: 40, color: [255, 235, 59] as [number, number, number] },      // Yellow
  medium: { size: 50, color: [255, 152, 0] as [number, number, number] },     // Orange
  high: { size: 60, color: [244, 67, 54] as [number, number, number] },       // Red
  extreme: { size: 70, color: [183, 28, 28] as [number, number, number] }     // Dark Red
};

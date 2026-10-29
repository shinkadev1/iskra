const paths = {
  search:
    "M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm8.3 13.1 3.2 3.2-1.4 1.4-3.2-3.2a8 8 0 1 1 1.4-1.4z",
  list: "M4 5h16v3H4V5zm0 5.5h10v3H4v-3zM4 16h16v3H4v-3z",
  lock: "M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v2h6V7a3 3 0 0 0-3-3z",
  swap: "M5 7h11.2l-2.6-2.6 1.4-1.4L20.4 8l-5.4 5-1.4-1.4L16.2 9H5V7zm14 10H7.8l2.6 2.6-1.4 1.4L3.6 16l5.4-5 1.4 1.4L7.8 15H19v2z",
  shield:
    "M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3zm-1 13-3.5-3.5 1.4-1.4L11 13.2l4.1-4.1 1.4 1.4L11 16z",
  spark: "M12 3l2.1 4.8L19 9l-3.6 3.2L16.4 18 12 15.6 7.6 18l1-5.8L5 9l4.9-1.2z",
  heart: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z",
  people:
    "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm8-1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zM3 19c.4-3 2.6-4.5 5-4.5S12.6 16 13 19H3zm10 .2c.3-2.2 1.8-3.7 4-3.7 1.6 0 2.9.8 3.6 2.1.2.5-.1 1.1-.7 1.1H13.2z",
  chat: "M5 6.5A3.5 3.5 0 0 1 8.5 3H16a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-4 3v-3.2A3.5 3.5 0 0 1 5 13V6.5z",
  moon: "M14.5 3a7.5 7.5 0 1 0 5.8 12.3A6 6 0 1 1 14.5 3z",
  user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v1.5h16V19c0-2.8-3.6-5-8-5z",
  star: "M12 3l1.6 5.2L19 9.8l-4.2 3.2L16.2 18 12 15.2 7.8 18l1.4-5L5 9.8l5.4-1.6z",
  logo: "M12 2.5l1.7 5.1H19l-4.2 3.1 1.6 5.1L12 13.2 7.6 15.8l1.6-5.1L5 7.6h5.3z",
  vk: "M6.79 7.3H4.05c.13 6.24 3.25 9.99 8.72 9.99h.31v-3.57c2.01.2 3.53 1.67 4.14 3.57h2.84c-.78-2.84-2.83-4.41-4.11-5.01 1.28-.74 3.08-2.54 3.51-4.98h-2.58c-.56 1.98-2.22 3.78-3.8 3.95V7.3H10.5v6.92c-1.6-.4-3.62-2.34-3.71-6.92Z",
  telegram:
    "M21.2 4.2 2.9 11.2c-1.1.4-1.1 1.1-.2 1.3l4.7 1.5 10.8-6.8c.5-.3.9-.1.6.2L9.2 15.1l-.3 4.3c.4 0 .6-.2.8-.4l2.1-2 4.4 3.3c.8.4 1.4.2 1.6-.7l2.8-13.2c.3-1.1-.4-1.7-1.4-1.2z",
  globe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  filter: "M3 4h18l-7 8v6l-4 2v-8z",
  camera: "M8 7h8l2 3h3v9H3V10h3z",
  mic: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM6 11a6 6 0 0 0 12 0M12 17v4",
  crown: "M4 16 7 7l5 5 5-5 3 9z",
  infinity: "M8 8a4 4 0 1 0 0 8c2 0 4-1.5 4-4s2-4 4-4a4 4 0 1 1 0 8c-2 0-4-1.5-4-4s-2-4-4-4z",
} as const;

export type IconName = keyof typeof paths;

const viewBoxes: Partial<Record<IconName, string>> = {
  vk: "3.45 6.7 17.2 11.2",
};

type StrokeShape =
  | { kind: "path"; d: string }
  | { kind: "circle"; cx: number; cy: number; r: number }
  | { kind: "rect"; x: number; y: number; width: number; height: number; rx?: number; ry?: number }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number };

/** Lucide-style outlines for feature cards and the “how it works” steps. */
const strokes: Partial<Record<IconName, StrokeShape[]>> = {
  chat: [{ kind: "path", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }],
  people: [
    { kind: "path", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" },
    { kind: "circle", cx: 9, cy: 7, r: 4 },
    { kind: "path", d: "M22 21v-2a4 4 0 0 0-3-3.87" },
    { kind: "path", d: "M16 3.13a4 4 0 0 1 0 7.75" },
  ],
  search: [
    { kind: "circle", cx: 11, cy: 11, r: 8 },
    { kind: "path", d: "m21 21-4.3-4.3" },
  ],
  list: [
    { kind: "line", x1: 21, y1: 4, x2: 14, y2: 4 },
    { kind: "line", x1: 10, y1: 4, x2: 3, y2: 4 },
    { kind: "line", x1: 21, y1: 12, x2: 12, y2: 12 },
    { kind: "line", x1: 8, y1: 12, x2: 3, y2: 12 },
    { kind: "line", x1: 21, y1: 20, x2: 16, y2: 20 },
    { kind: "line", x1: 12, y1: 20, x2: 3, y2: 20 },
    { kind: "line", x1: 14, y1: 2, x2: 14, y2: 6 },
    { kind: "line", x1: 8, y1: 10, x2: 8, y2: 14 },
    { kind: "line", x1: 16, y1: 18, x2: 16, y2: 22 },
  ],
  lock: [
    { kind: "rect", x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 },
    { kind: "path", d: "M7 11V7a5 5 0 0 1 10 0v4" },
  ],
  swap: [
    { kind: "rect", x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 },
    { kind: "circle", cx: 9, cy: 9, r: 2 },
    { kind: "path", d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" },
  ],
  shield: [
    {
      kind: "path",
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    },
    { kind: "path", d: "m9 12 2 2 4-4" },
  ],
  spark: [
    {
      kind: "path",
      d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
    },
    { kind: "path", d: "M5 3v4" },
    { kind: "path", d: "M19 17v4" },
    { kind: "path", d: "M3 5h4" },
    { kind: "path", d: "M17 19h4" },
  ],
  filter: [
    {
      kind: "path",
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
    },
  ],
  camera: [
    { kind: "path", d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" },
    { kind: "circle", cx: 12, cy: 13, r: 3 },
  ],
  mic: [
    { kind: "path", d: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" },
    { kind: "path", d: "M19 10v2a7 7 0 0 1-14 0v-2" },
    { kind: "line", x1: 12, y1: 19, x2: 12, y2: 22 },
  ],
  crown: [
    {
      kind: "path",
      d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
    },
    { kind: "path", d: "M5 21h14" },
  ],
  infinity: [
    {
      kind: "path",
      d: "M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z",
    },
  ],
  heart: [
    {
      kind: "path",
      d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
    },
  ],
};

export function Icon({ name, stroke = false }: { name: IconName; stroke?: boolean }) {
  const outline = stroke ? strokes[name] : undefined;
  if (outline) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {outline.map((shape, index) => {
          if (shape.kind === "circle") return <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />;
          if (shape.kind === "rect") {
            return (
              <rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
                ry={shape.ry}
              />
            );
          }
          if (shape.kind === "line") {
            return <line key={index} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} />;
          }
          return <path key={index} d={shape.d} />;
        })}
      </svg>
    );
  }

  return (
    <svg viewBox={viewBoxes[name] ?? "0 0 24 24"} aria-hidden="true">
      <path fill="currentColor" d={paths[name]} />
    </svg>
  );
}

export interface DonutRing {
  value: number; // 0-max
  max: number;
  color: string; // any valid CSS color, e.g. "#3b82f6"
  label?: string;
}

export interface DonutChartProps {
  rings: DonutRing[];
  size?: number; // px, defaults to 80
  strokeWidth?: number; // px, defaults to 6
  /** Optional center label, e.g. an overall average score. */
  centerLabel?: string;
}

/**
 * Built with plain SVG + stroke-dasharray rather than a charting library
 * (recharts/chart.js) — for a handful of small, static rings per candidate
 * card, pulling in a full charting dependency is unnecessary weight. Multiple
 * rings are supported (not just one) because the candidate card mockup shows
 * 3 concentric rings (Experience/Skills/Education) in a single visual.
 */
export function DonutChart({ rings, size = 80, strokeWidth = 6, centerLabel }: DonutChartProps) {
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, index) => {
          // Each successive ring sits inside the previous one so they
          // nest visually rather than overlap.
          const radius = center - strokeWidth / 2 - index * (strokeWidth + 2);
          if (radius <= 0) return null;

          const circumference = 2 * Math.PI * radius;
          const progress = Math.min(1, Math.max(0, ring.value / ring.max));
          const dashOffset = circumference * (1 - progress);

          return (
            <g key={index}>
              {/* Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />
              {/* Progress */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </g>
          );
        })}
      </svg>
      {centerLabel && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
          {centerLabel}
        </div>
      )}
    </div>
  );
}
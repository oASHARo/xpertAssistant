import { DonutChart } from "@/components/ui/donut-chart";
import type { CandidateScoreBreakdown } from "@/types/candidate.types";

export interface ScoreDonutGroupProps {
  breakdown: CandidateScoreBreakdown;
}

const RING_CONFIG = [
  { key: "experience" as const, label: "Experience", color: "#3b82f6" },
  { key: "skills" as const, label: "Skills", color: "#f97316" },
  { key: "education" as const, label: "Education", color: "#22c55e" },
];

/**
 * Route-local: this specific 3-ring Experience/Skills/Education combination
 * with this exact legend only makes sense on the candidate card, so it
 * doesn't belong in the global ui/ folder — but it composes the global,
 * reusable DonutChart rather than duplicating SVG logic.
 */
export function ScoreDonutGroup({ breakdown }: ScoreDonutGroupProps) {
  const rings = RING_CONFIG.map((config) => ({
    value: breakdown[config.key],
    max: 10,
    color: config.color,
  }));

  return (
    <div className="flex items-center gap-3">
      <DonutChart rings={rings} size={64} strokeWidth={5} />
      <div className="flex flex-col gap-1">
        {RING_CONFIG.map((config) => (
          <div key={config.key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
            {breakdown[config.key]} {config.label}
          </div>
        ))}
      </div>
    </div>
  );
}
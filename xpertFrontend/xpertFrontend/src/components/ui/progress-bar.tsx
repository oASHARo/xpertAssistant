import { cn } from "@/lib/utils/cn";

export interface RatioBarProps {
  /** 0-100. The remainder is rendered as the rejected (red) segment. */
  matchedPercent: number;
  className?: string;
}

/**
 * A single-purpose component, not a generic <ProgressBar variant="two-tone" />.
 * The "Analysis Ratio" bar in the mockup always represents exactly two
 * complementary percentages (matched vs rejected), so a dedicated component
 * with a clear prop name is more readable at call sites than a generic bar
 * that needs 3 props to configure the same thing.
 */
export function RatioBar({ matchedPercent, className }: RatioBarProps) {
  const clamped = Math.min(100, Math.max(0, matchedPercent));

  return (
    <div
      className={cn("flex h-1.5 w-full items-center", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Analysis ratio: matched vs rejected"
    >
      <div className="h-full rounded-l-full bg-[#37A754] transition-all" style={{ width: `${clamped}%` }} />
      <div className="z-10 -mx-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary ring-2 ring-white" />
      <div className="h-full flex-1 rounded-r-full bg-danger transition-all" />
    </div>
  );
}
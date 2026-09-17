import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import type { JobCriterion } from "@/types/job.types";

export interface CriteriaCardProps {
  criterion: JobCriterion;
  index: number;
  onIdealAnswerChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}

export function CriteriaCard({ criterion, index, onIdealAnswerChange, onDelete }: CriteriaCardProps) {
  return (
    <Card className="p-4 border-none shadow-[0px_4px_10px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-muted">Criteria {index + 1}</p>
          <h4 className="mt-0.5 text-sm font-semibold text-text-main break-words">{criterion.title}</h4>
        </div>
        <button
          onClick={() => onDelete(criterion.id)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-danger-10 text-danger transition-colors hover:bg-[#FFE5E5]"
          aria-label={`Remove ${criterion.title}`}
        >
          <Icon src="/assets/icons/trash.svg" className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-text-muted">Rating Calculation</p>
        <p className="mt-1 text-xs text-text-muted break-words">{criterion.ratingCalculationExplanation}</p>
      </div>
    </Card>
  );
}
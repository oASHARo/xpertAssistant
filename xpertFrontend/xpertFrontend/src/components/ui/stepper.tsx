import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepConfig {
  label: string;
  icon: React.ReactNode;
}

export interface StepperProps {
  steps: StepConfig[];
  /** 0-indexed. Steps before this are "completed", this one is "active". */
  currentStepIndex: number;
}

export function Stepper({ steps, currentStepIndex }: StepperProps) {
  return (
    <div className="flex items-center w-full justify-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = index === currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className={cn("flex items-center")}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  (isCompleted || isActive) ? "bg-[#3BAEEB] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]",
                  isActive && "shadow-md"
                )}
              >
                {step.icon}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap",
                  isActive ? "text-text-main font-semibold" : "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={cn(
                  "mx-4 w-12",
                  (isCompleted || isActive) ? "h-[2px] bg-[#3BAEEB]" : "h-0 border-t-[2px] border-dashed border-[#D9D9D9]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
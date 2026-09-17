import { HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

/**
 * Covers every small pill in the mockups: category tags ("Deep Learning"),
 * skill tags ("WebRTC"), and status pills ("Recommended", "Rejected").
 * One primitive, variant-driven, instead of separate components for each.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-700",
        blue: "bg-primary text-white",
        green: "bg-green-100 text-green-700",   // 🆕 Short-List badge
        cyan: "bg-primary/10 text-primary",      // 🆕 Resume badge + skill pills
        red: "bg-danger-10 text-danger",
        outline: "border border-border-light text-text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  )
);

Badge.displayName = "Badge";
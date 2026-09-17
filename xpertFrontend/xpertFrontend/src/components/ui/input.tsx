import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    // useId generates a stable unique id so <label htmlFor> always matches
    // the input even when the caller doesn't pass an explicit id — avoids
    // silently-broken label associations (a common accessibility bug).
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full relative">
        {label && (
          <label htmlFor={inputId} className="absolute -top-2.5 left-3 bg-white px-1 text-sm text-text-main z-10">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-transparent border border-border-light rounded-md px-4 py-3 text-text-main transition-all",
            "placeholder:text-text-light",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
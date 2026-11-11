import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../cn";

const control =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-fg-muted " +
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50";

interface FieldChrome {
  label: string;
  hint?: string;
  error?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldChrome {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldWrapper id={inputId} label={label} hint={hint} error={error}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${inputId}-msg` : undefined}
        className={cn(control, error && "border-danger", className)}
        {...props}
      />
    </FieldWrapper>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldChrome {
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, id, options, className, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FieldWrapper id={selectId} label={label} hint={hint} error={error}>
      <select ref={ref} id={selectId} className={cn(control, className)} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
});

function FieldWrapper({ id, label, hint, error, children }: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-msg`} className={cn("text-xs", error ? "text-danger" : "text-fg-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-border bg-surface", className)} {...props} />;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, description, actions, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-border px-5 py-4", className)} {...props}>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

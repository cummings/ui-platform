import type { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

/** A live rendering of real @core components, with the code that produces it. */
export function Example({ children, code, title }: { children: ReactNode; code: string; title?: string }) {
  return (
    <div className="my-5">
      <div className="flex flex-wrap items-center gap-3 rounded-t-card border border-b-0 border-border bg-surface px-5 py-6">{children}</div>
      <div className="[&_figure]:my-0 [&_figure]:rounded-t-none">
        <CodeBlock code={code} title={title} />
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { DocsToc } from "@/components/docs/DocsToc";

export const metadata = { title: { default: "Developer docs", template: "%s · Developer docs" } };

const CONTENT_ID = "docs-content";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 xl:grid-cols-[minmax(0,48rem)_13rem] xl:justify-center">
      <article id={CONTENT_ID} className="min-w-0 pb-16">
        {children}
        <footer className="mt-16 border-t border-border pt-4 text-xs text-fg-muted">
          These docs ship with the core repo (<code>apps/home/src/app/docs</code>). Found something wrong? Open a PR or
          ask in #platform.
        </footer>
      </article>
      {/* Right-hand table of contents on wide screens. */}
      <aside className="hidden xl:block">
        <DocsToc contentId={CONTENT_ID} />
      </aside>
    </div>
  );
}

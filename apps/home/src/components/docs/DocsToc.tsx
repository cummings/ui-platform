"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@core/ui";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * "On this page" list for the current docs page, built from its h2/h3 headings (ids come from
 * mdx-components). Highlights the section currently being read.
 */
export function DocsToc({ contentId }: { contentId: string }) {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const root = document.getElementById(contentId);
    if (!root) return;
    const headings = [...root.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")];
    setItems(headings.map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H2" ? 2 : 3 })));
    setActiveId(location.hash.slice(1) || headings[0]?.id);

    // The active section is the last heading that has scrolled past the top bar.
    const onScroll = () => {
      const offset = 120;
      let current = headings[0]?.id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - offset <= 0) current = h.id;
        else break;
      }
      // At the very bottom, the last section wins even if its heading never reaches the top.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = headings.at(-1)?.id;
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [contentId, pathname]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-22 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">On this page</p>
      <ul className="flex flex-col gap-1 border-l border-border text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === activeId ? "location" : undefined}
              onClick={() => setActiveId(item.id)}
              className={cn(
                "-ml-px block border-l-2 py-1 leading-snug transition-colors",
                item.level === 3 ? "pl-6 text-[13px]" : "pl-3",
                item.id === activeId
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-fg-muted hover:border-border hover:text-fg",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { codeToHtml } from "shiki";
import { CopyButton } from "./CopyButton";

export interface CodeBlockProps {
  code: string;
  lang?: string;
  /** Shown in the header, e.g. "src/proxy.ts". */
  title?: string;
}

/** Syntax-highlighted code, rendered on the server (no highlighting JS ships to the browser). */
export async function CodeBlock({ code, lang = "tsx", title }: CodeBlockProps) {
  const source = code.replace(/\n$/, "");
  let html: string;
  try {
    html = await codeToHtml(source, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  } catch {
    html = `<pre><code>${escape(source)}</code></pre>`;
  }
  return (
    <figure className="docs-code my-5 overflow-hidden rounded-card border border-border bg-surface-muted">
      <figcaption className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="font-mono text-xs text-fg-muted">{title ?? lang}</span>
        <CopyButton text={source} />
      </figcaption>
      <div className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}

const escape = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

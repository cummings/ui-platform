import type { MDXComponents } from "mdx/types";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { CodeBlock } from "@/components/docs/CodeBlock";

/** Plain text of a heading, including text inside inline elements such as `code`. */
const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return "";
};

const slug = (children: ReactNode) =>
  textOf(children)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Platform styling for docs written in MDX. Fenced code blocks become highlighted CodeBlocks;
 * a first line of `// file: path` (or `# file: path`) becomes the block's title.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h1 className="mb-2 text-3xl font-semibold tracking-tight text-fg">{children}</h1>,
    h2: ({ children }) => (
      <h2 id={slug(children)} className="mb-3 mt-12 scroll-mt-20 border-b border-border pb-2 text-xl font-semibold text-fg">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slug(children)} className="mb-2 mt-8 scroll-mt-20 text-base font-semibold text-fg">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="my-3 leading-7 text-fg">{children}</p>,
    a: ({ href, children }) => (
      <a href={href} className="font-medium text-brand underline-offset-2 hover:underline">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 leading-7 text-fg">{children}</ul>,
    ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6 leading-7 text-fg">{children}</ol>,
    strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
    blockquote: ({ children }) => <blockquote className="my-4 border-l-4 border-border pl-4 text-fg-muted">{children}</blockquote>,
    hr: () => <hr className="my-10 border-border" />,
    code: ({ children }) => (
      <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[0.85em] text-fg">{children}</code>
    ),
    pre: ({ children }) => {
      if (!isValidElement(children)) return <pre>{children}</pre>;
      const { className, children: text } = (children as ReactElement<{ className?: string; children?: string }>).props;
      let code = String(text ?? "");
      let title: string | undefined;
      const first = code.match(/^(?:\/\/|#) file: (.+)\n/);
      if (first) {
        title = first[1];
        code = code.slice(first[0].length);
      }
      return <CodeBlock code={code} lang={className?.replace("language-", "") ?? "txt"} title={title} />;
    },
    table: ({ children }) => (
      <div className="my-5 overflow-x-auto rounded-card border border-border bg-surface">
        <table className="w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-muted">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2 font-medium">{children}</th>,
    tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
    td: ({ children }) => <td className="px-4 py-2.5 align-top text-fg">{children}</td>,
    ...components,
  };
}

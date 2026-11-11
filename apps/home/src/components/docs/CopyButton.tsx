"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md px-2 py-1 text-xs text-fg-muted hover:bg-surface hover:text-fg"
      aria-label="Copy code"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

import { useEffect, useRef, type ReactNode } from "react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Modal built on the native <dialog> element (focus trap, Esc and backdrop for free). */
export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="core-dialog-title"
      className="m-auto w-full max-w-md rounded-card border border-border bg-surface p-0 text-fg shadow-xl backdrop:bg-black/40"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 id="core-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
    </dialog>
  );
}

"use client";

import { useState } from "react";
import { Button, Dialog } from "@core/ui";

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel order ORD-1006?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep order
            </Button>
            <Button variant="danger" onClick={() => setOpen(false)}>
              Cancel order
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">The customer will be notified. This can't be undone.</p>
      </Dialog>
    </>
  );
}

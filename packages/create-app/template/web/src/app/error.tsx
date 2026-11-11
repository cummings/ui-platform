"use client";

import { Button, Card, EmptyState } from "@core/ui";

// Keeps the platform chrome on screen when a backend this page depends on fails.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <EmptyState
        title="This page couldn't load its data"
        description={`A service it depends on is unavailable. The rest of the platform still works.${error.digest ? ` Reference: ${error.digest}` : ""}`}
        action={<Button onClick={reset}>Try again</Button>}
      />
    </Card>
  );
}

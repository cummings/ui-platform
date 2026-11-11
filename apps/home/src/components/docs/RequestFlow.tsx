/** Static diagram of a request through the platform. Colours come from the theme tokens. */
export function RequestFlow() {
  const box = "fill-[var(--core-surface)] stroke-[var(--core-border)]";
  const label = "fill-[var(--core-fg)] text-[13px] font-semibold";
  const sub = "fill-[var(--core-fg-muted)] text-[11px]";
  return (
    <figure className="my-6 overflow-x-auto rounded-card border border-border bg-surface-muted p-4">
      <svg viewBox="0 0 720 270" className="mx-auto w-full min-w-[560px] max-w-[720px]" role="img" aria-labelledby="flow-title">
        <title id="flow-title">Browser to gateway to team apps and APIs, with Auth0 sign-in on Home</title>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-[var(--core-fg-muted)]" />
          </marker>
        </defs>
        <g className="stroke-[var(--core-fg-muted)]" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)">
          <path d="M360 52 V80" />
          <path d="M250 128 L120 168" />
          <path d="M360 128 V168" />
          <path d="M470 128 L600 168" />
          <path d="M460 198 H498" />
        </g>
        <rect x="230" y="12" width="260" height="40" rx="10" className={box} />
        <text x="360" y="37" textAnchor="middle" className={label}>Browser · /&lt;app&gt;/…</text>

        <rect x="170" y="82" width="380" height="46" rx="10" className="fill-[var(--core-brand-subtle)] stroke-[var(--core-brand)]" />
        <text x="360" y="102" textAnchor="middle" className={label}>Gateway (Nginx) · routes.yaml</text>
        <text x="360" y="119" textAnchor="middle" className={sub}>path routing · request id · security headers</text>

        <rect x="20" y="170" width="200" height="56" rx="10" className={box} />
        <text x="120" y="193" textAnchor="middle" className={label}>Home  /  and  /auth</text>
        <text x="120" y="211" textAnchor="middle" className={sub}>sign-in (Auth0 / mock) · docs</text>

        <rect x="260" y="170" width="200" height="56" rx="10" className={box} />
        <text x="360" y="193" textAnchor="middle" className={label}>Team web app  /orders</text>
        <text x="360" y="211" textAnchor="middle" className={sub}>Next.js + @core/shell, ui, sdk, auth</text>

        <rect x="500" y="170" width="200" height="56" rx="10" className={box} />
        <text x="600" y="193" textAnchor="middle" className={label}>Team API  /api/orders</text>
        <text x="600" y="211" textAnchor="middle" className={sub}>Fastify + @core/server-auth</text>

        <text x="480" y="252" textAnchor="middle" className={sub}>web → API: server-side, with the user&apos;s bearer token</text>
        <text x="120" y="252" textAnchor="middle" className={sub}>one session cookie for every app</text>
      </svg>
    </figure>
  );
}

# @core/shell

The platform chrome (top bar, app launcher, in-app nav, user menu) every app renders.

```tsx
// app/layout.tsx (Server Component)
import Link from "next/link";
import { PlatformShell } from "@core/shell";
import { loadAppRegistry } from "@core/shell/server";

<PlatformShell user={session.user} apps={await loadAppRegistry()} appId="orders" nav={nav} linkComponent={Link}>
  {children}
</PlatformShell>
```

```css
@import "tailwindcss";
@import "@core/ui/styles.css";
@import "@core/shell/styles.css";
```

Cross-app links are plain `<a>` (full navigation between independently deployed zones);
in-app nav uses the `linkComponent` you pass. The launcher reads the gateway's
`/platform/apps.json` registry at request time (`PLATFORM_REGISTRY_URL`).

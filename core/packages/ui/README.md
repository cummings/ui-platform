# @core/ui

The platform design system. Components are styled with Tailwind CSS v4 utilities against
token variables, so every app looks the same and themes (light/dark, future tenant branding) are
a CSS-variable swap.

```css
/* app/globals.css */
@import "tailwindcss";
@import "@core/ui/styles.css";
```

Token utilities: `bg-surface`, `bg-surface-muted`, `text-fg`, `text-fg-muted`, `border-border`,
`bg-brand`, `text-brand`, `text-success|warning|danger`, `rounded-card`.

Components: `Button`, `Spinner`, `Card` / `CardHeader` / `CardBody`, `Badge`, `Input`, `Select`,
`Table`, `Stat`, `EmptyState`, `Dialog`, `PageHeader`.

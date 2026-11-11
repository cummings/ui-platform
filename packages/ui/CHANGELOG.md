# @core/ui

## 0.1.1

### Patch Changes

- Layout and data-display components (`Card`, `Table`, `Stat`, `Badge`, `EmptyState`, `PageHeader`) are no longer behind a `"use client"` boundary, so Server Components can use them, including `Table` column `cell` functions. Interactive components move to the `@core/ui/client` entry and are still re-exported from `@core/ui`.

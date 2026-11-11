# @core/shell

## 0.2.1

### Patch Changes

- The in-app nav is now sticky on desktop and shows as a scrollable row on phones (it used to be hidden below `md`). Active items set `aria-current="page"`.

## 0.2.0

### Minor Changes

- `NavItem.exact` highlights an item only on an exact path match (useful for section index pages). Prefix matching now also requires a path boundary, so `/order` no longer highlights on `/orders`.

## 0.1.2

### Patch Changes

- `loadAppRegistry()` skips the network call during `next build`.

## 0.1.1

### Patch Changes

- Updated dependencies
  - @core/sdk@0.2.0

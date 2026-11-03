# @core/create-app

## 0.1.2

### Patch Changes

- Document using `authenticate` / `requireScopes` as `onRequest` hooks so authorization runs before body validation (unauthorised writes get 403, not 400). The app template now does this.

## 0.1.1

### Patch Changes

- Template API tsconfig sets its own `rootDir`/`outDir` (pairs with `@core/config@0.1.1`).

# @core/create-app

## 0.1.5

### Patch Changes

- Template README links to the platform developer docs at `/docs`.

## 0.1.4

### Patch Changes

- Template ships an `app/error.tsx` boundary so backend outages render inside the platform chrome.

## 0.1.3

### Patch Changes

- `requireSession()` redirects to the platform login with an absolute URL, so apps with a `basePath` no longer send users to `/<app>/auth/login`. The template's proxy matcher now includes `"/"` so the bare app root is protected by the proxy.

## 0.1.2

### Patch Changes

- Document using `authenticate` / `requireScopes` as `onRequest` hooks so authorization runs before body validation (unauthorised writes get 403, not 400). The app template now does this.

## 0.1.1

### Patch Changes

- Template API tsconfig sets its own `rootDir`/`outDir` (pairs with `@core/config@0.1.1`).

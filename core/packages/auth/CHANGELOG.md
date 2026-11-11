# @core/auth

## 0.1.2

### Patch Changes

- `requireSession()` redirects to the platform login with an absolute URL, so apps with a `basePath` no longer send users to `/<app>/auth/login`. The template's proxy matcher now includes `"/"` so the bare app root is protected by the proxy.

## 0.1.1

### Patch Changes

- Updated dependencies
  - @core/sdk@0.2.0

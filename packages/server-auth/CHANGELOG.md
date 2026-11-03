# @core/server-auth

## 0.2.1

### Patch Changes

- Document using `authenticate` / `requireScopes` as `onRequest` hooks so authorization runs before body validation (unauthorised writes get 403, not 400). The app template now does this.

## 0.2.0

### Minor Changes

- Add `@core/server-auth/testing` with `createTestToken()` for minting mock-mode bearer tokens in API tests.

# @core/sdk

- `@core/sdk` (isomorphic): `createApiClient`, `ApiError`, `createEventBus`, platform types.
- `@core/sdk/client` (client components): `PlatformProvider`, `usePlatform`, `useUser`, `useHasRole`,
  `useFeatureFlag`, `usePlatformEvent`, `usePlatformEvents`, and re-exported `useQuery` / `useMutation`.

Declare your app's events by augmenting `PlatformEventMap` (see `src/events.ts`).

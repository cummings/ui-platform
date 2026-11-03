import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
// Imported via the package name (not "./events") so the client entry shares one type identity with
// the main entry — that is what makes `declare module "@core/sdk"` augmentation reach these hooks.
import {
  createEventBus,
  type PlatformContextValue,
  type PlatformEventBus,
  type PlatformEventEnvelope,
  type PlatformEventName,
} from "@core/sdk";

// Re-exported so every app uses the same React Query instance the provider sets up.
export { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface InternalContext extends PlatformContextValue {
  events: PlatformEventBus;
}

const PlatformContext = createContext<InternalContext | null>(null);

export interface PlatformProviderProps extends PlatformContextValue {
  children: ReactNode;
}

/** Wrap every app's root layout in this. Values come from the server (session + registry). */
export function PlatformProvider({ children, ...value }: PlatformProviderProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }),
  );
  const busRef = useRef<PlatformEventBus | null>(null);
  if (!busRef.current && typeof window !== "undefined") busRef.current = createEventBus(value.appId);

  const ctx: InternalContext = { ...value, events: busRef.current ?? noopBus };
  return (
    <PlatformContext.Provider value={ctx}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PlatformContext.Provider>
  );
}

const noopBus: PlatformEventBus = { emit: () => {}, on: () => () => {} };

export function usePlatform(): PlatformContextValue {
  return useInternal();
}

export function useUser() {
  return useInternal().user;
}

export function useHasRole(role: string): boolean {
  return useInternal().user.roles.includes(role);
}

export function useFeatureFlag(flag: string): boolean {
  return useInternal().flags[flag] ?? false;
}

export function usePlatformEvents(): PlatformEventBus {
  return useInternal().events;
}

/** Subscribe to a platform event for the lifetime of the component. */
export function usePlatformEvent<K extends PlatformEventName>(
  type: K,
  handler: (event: PlatformEventEnvelope<K>) => void,
) {
  const { events } = useInternal();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => events.on(type, (e) => handlerRef.current(e)), [events, type]);
}

function useInternal(): InternalContext {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("Platform hooks must be used inside <PlatformProvider>.");
  return ctx;
}

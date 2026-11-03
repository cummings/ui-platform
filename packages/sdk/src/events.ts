/**
 * Typed cross-app event bus.
 *
 * Apps are separate pages, so events are delivered to the current window and, via
 * BroadcastChannel, to every other platform tab on the same origin.
 *
 * Teams add their own events through declaration merging:
 *
 *   declare module "@core/sdk" {
 *     interface PlatformEventMap { "orders.created": { id: string; total: number } }
 *   }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlatformEventMap {}

export type PlatformEventName = keyof PlatformEventMap & string;

export interface PlatformEventEnvelope<K extends PlatformEventName = PlatformEventName> {
  type: K;
  payload: PlatformEventMap[K];
  source: string;
  at: string;
}

type Listener<K extends PlatformEventName> = (event: PlatformEventEnvelope<K>) => void;

const CHANNEL = "core-platform-events";
const DOM_EVENT = "core-platform-event";

export interface PlatformEventBus {
  emit<K extends PlatformEventName>(type: K, payload: PlatformEventMap[K]): void;
  on<K extends PlatformEventName>(type: K, listener: Listener<K>): () => void;
}

export function createEventBus(source: string, target: EventTarget | undefined = globalThis): PlatformEventBus {
  const channel = typeof BroadcastChannel === "undefined" ? undefined : new BroadcastChannel(CHANNEL);
  const local = new EventTarget();

  const deliver = (envelope: PlatformEventEnvelope) => {
    local.dispatchEvent(new CustomEvent(envelope.type, { detail: envelope }));
  };
  channel?.addEventListener("message", (msg: MessageEvent<PlatformEventEnvelope>) => deliver(msg.data));

  return {
    emit(type, payload) {
      const envelope = { type, payload, source, at: new Date().toISOString() } as PlatformEventEnvelope;
      deliver(envelope);
      channel?.postMessage(envelope);
      target?.dispatchEvent?.(new CustomEvent(DOM_EVENT, { detail: envelope }));
    },
    on(type, listener) {
      const handler = (e: Event) => listener((e as CustomEvent).detail);
      local.addEventListener(type, handler);
      return () => local.removeEventListener(type, handler);
    },
  };
}

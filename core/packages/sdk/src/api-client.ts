export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    readonly requestId?: string,
  ) {
    super(`API request failed with ${status}`);
    this.name = "ApiError";
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  /** Supplies the bearer token. Called per request so refreshed tokens are picked up. */
  getToken?: () => string | undefined | Promise<string | undefined>;
  /** Propagated as `x-request-id` for end-to-end tracing through gateway → app → API. */
  requestId?: string;
  fetch?: typeof fetch;
}

export interface ApiClient {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  delete<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const doFetch = options.fetch ?? fetch;

  async function request<T>(method: string, path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (body !== undefined) headers.set("content-type", "application/json");
    const token = await options.getToken?.();
    if (token) headers.set("authorization", `Bearer ${token}`);
    if (options.requestId) headers.set("x-request-id", options.requestId);

    const url = options.baseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);
    const res = await doFetch(url, {
      ...init,
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await res.text();
    const data: unknown = text ? safeJson(text) : undefined;
    if (!res.ok) throw new ApiError(res.status, data, res.headers.get("x-request-id") ?? options.requestId);
    return data as T;
  }

  return {
    get: (path, init) => request("GET", path, undefined, init),
    post: (path, body, init) => request("POST", path, body, init),
    put: (path, body, init) => request("PUT", path, body, init),
    patch: (path, body, init) => request("PATCH", path, body, init),
    delete: (path, init) => request("DELETE", path, undefined, init),
  };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

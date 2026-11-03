/** The signed-in user as every platform app sees it, regardless of identity provider. */
export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  roles: string[];
}

export interface PlatformSession {
  user: PlatformUser;
  /** Bearer token for backend calls. Server-side only — never pass it to client components. */
  accessToken: string;
  /** Epoch seconds. */
  expiresAt: number;
}

/** One entry in the gateway's runtime app registry (`/platform/apps.json`). */
export interface PlatformApp {
  id: string;
  title: string;
  description?: string;
  basePath: string;
  icon?: string;
  team?: string;
}

export interface PlatformContextValue {
  user: PlatformUser;
  /** The app currently rendering, e.g. "orders". */
  appId: string;
  apps: PlatformApp[];
  flags: Record<string, boolean>;
  tenant?: string;
}

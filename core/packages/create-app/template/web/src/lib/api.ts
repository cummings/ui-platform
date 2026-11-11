import { getRequestId, requireSession } from "@core/auth";
import { createApiClient } from "@core/sdk";

/** Server-side client for this team's API, authenticated as the signed-in user. */
export async function getApi() {
  const [session, requestId] = await Promise.all([requireSession(), getRequestId()]);
  return createApiClient({
    baseUrl: process.env.__ENV_PREFIX___API_URL ?? "http://localhost:__API_DEV_PORT__",
    getToken: () => session.accessToken,
    requestId,
  });
}

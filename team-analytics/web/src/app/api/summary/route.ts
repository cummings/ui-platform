import { getApi } from "@/lib/api";
import type { Summary } from "@/lib/types";

export const dynamic = "force-dynamic";

// Backend-for-frontend: the browser polls this (same origin, session cookie); the access token
// stays on the server.
export async function GET() {
  const api = await getApi();
  return Response.json(await api.get<Summary>("/api/analytics/summary"));
}

import { MOCK_PERSONAS } from "./token";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Self-contained persona picker served at /auth/login in mock mode. */
export function renderMockLoginPage(returnTo: string): string {
  const items = MOCK_PERSONAS.map((p) => {
    const href = `/auth/login?persona=${encodeURIComponent(p.id)}&returnTo=${encodeURIComponent(returnTo)}`;
    return `<a class="persona" href="${escape(href)}">
      <span class="avatar">${escape(p.name[0] ?? "?")}</span>
      <span><strong>${escape(p.name)}</strong><br><small>${escape(p.email)} · ${escape(p.roles.join(", "))}</small></span>
    </a>`;
  }).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in · Core Platform</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1729;font-family:ui-sans-serif,system-ui,sans-serif;color:#121826}
  main{background:#fff;border-radius:14px;padding:32px;width:min(420px,calc(100vw - 32px));box-shadow:0 20px 60px rgba(0,0,0,.35)}
  h1{margin:0 0 4px;font-size:20px} p{margin:0 0 20px;color:#5b6474;font-size:14px}
  .persona{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid #e2e6ec;border-radius:10px;margin-bottom:10px;color:inherit;text-decoration:none}
  .persona:hover{border-color:#2453d6;background:#f5f8ff}
  .avatar{width:36px;height:36px;border-radius:50%;background:#2453d6;color:#fff;display:grid;place-items:center;font-weight:600}
  small{color:#5b6474} .tag{display:inline-block;font-size:11px;background:#fff4e0;color:#a35d00;border-radius:99px;padding:2px 8px;margin-bottom:12px}
</style></head><body><main>
<span class="tag">Mock auth · local development</span>
<h1>Sign in to Core Platform</h1>
<p>Pick a persona. In production this page is replaced by Auth0 Universal Login.</p>
${items}
</main></body></html>`;
}

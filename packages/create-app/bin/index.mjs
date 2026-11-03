#!/usr/bin/env node
// pnpm create @core/app <id> [--title "Orders"] [--team "Team Orders"] [--web-port 3101] [--api-port 4101] [--icon 📦] [--dir ./team-orders]
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: "string" },
    team: { type: "string" },
    "web-port": { type: "string", default: "3101" },
    "api-port": { type: "string", default: "4101" },
    icon: { type: "string", default: "▢" },
    dir: { type: "string" },
    registry: { type: "string", default: process.env.CORE_REGISTRY_URL ?? "http://localhost:4873" },
  },
});

const id = positionals[0];
if (!id || !/^[a-z][a-z0-9-]{1,30}$/.test(id)) {
  console.error("Usage: pnpm create @core/app <id>   (id: lowercase letters, digits, dashes — becomes /<id>)");
  process.exit(1);
}

const title = values.title ?? id.replace(/(^|-)(\w)/g, (_, s, c) => (s ? " " : "") + c.toUpperCase());
const team = values.team ?? `Team ${title}`;
const target = resolve(values.dir ?? `team-${id}`);
if (existsSync(target) && readdirSync(target).length > 0) {
  console.error(`${target} already exists and is not empty.`);
  process.exit(1);
}

// Pin the current published @core/* versions so new apps start on the latest contract.
const corePackages = ["config", "ui", "sdk", "shell", "auth", "server-auth"];
const versions = {};
for (const pkg of corePackages) versions[pkg] = await latest(`@core/${pkg}`);

const replacements = {
  __APP_ID__: id,
  __APP_TITLE__: title,
  __TEAM__: team,
  __ICON__: values.icon,
  __BASE_PATH__: `/${id}`,
  __API_PATH__: `/api/${id}`,
  __ENV_PREFIX__: id.toUpperCase().replace(/-/g, "_"),
  __WEB_DEV_PORT__: values["web-port"],
  __API_DEV_PORT__: values["api-port"],
  ...Object.fromEntries(corePackages.map((p) => [`__CORE_${p.toUpperCase().replace("-", "_")}_VERSION__`, versions[p]])),
};

const templateDir = join(dirname(fileURLToPath(import.meta.url)), "..", "template");
cpSync(templateDir, target, { recursive: true });

// npm strips dotfiles like .gitignore/.npmrc from published packages, so the template stores them as _name.
walk(target, (file) => {
  const base = file.split("/").pop();
  if (base.startsWith("_") && !base.startsWith("__")) {
    const renamed = join(dirname(file), "." + base.slice(1));
    renameSync(file, renamed);
    file = renamed;
  }
  let text = readFileSync(file, "utf8");
  for (const [k, v] of Object.entries(replacements)) text = text.replaceAll(k, v);
  writeFileSync(file, text);
});

console.log(`
Created ${title} (${team}) in ${target}

  web  → http://localhost:${values["web-port"]}/${id}   (behind the gateway: /${id})
  api  → http://localhost:${values["api-port"]}/api/${id}

Next steps:
  cd ${target}
  git init && pnpm install
  pnpm dev
  Open a PR to platform-gateway adding route.yaml's entry to routes.yaml.
`);

async function latest(name) {
  try {
    const res = await fetch(`${values.registry.replace(/\/$/, "")}/${name.replace("/", "%2f")}`);
    if (!res.ok) throw new Error(String(res.status));
    const body = await res.json();
    return `^${body["dist-tags"].latest}`;
  } catch {
    console.warn(`! could not resolve ${name} from ${values.registry}; defaulting to ^0.1.0`);
    return "^0.1.0";
  }
}

function walk(dir, fn) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, fn);
    else fn(p);
  }
}

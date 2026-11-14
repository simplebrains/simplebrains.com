/**
 * Ensure the notes vault is an omgbase workspace the local loader can open.
 * Idempotent: first run ingests; later runs freshness-sweep.
 *
 * No-op when OMG_URL is set (remote MCP) unless OMG_WORKSPACE is also set
 * and you force local setup with OMG_SETUP_WORKSPACE=1.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Workspace, ingestDirectory, freshnessSweep } from "@omgbase/core";

/** Lightweight `.env` loader so setup matches Astro/Vite before astro starts. */
function loadDotEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i <= 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

const remoteUrl = process.env.OMG_URL?.trim();
const workspace = process.env.OMG_WORKSPACE?.trim();
const force = process.env.OMG_SETUP_WORKSPACE === "1";

if (remoteUrl && !workspace && !force) {
  console.log(`skipping local workspace setup (OMG_URL set)`);
  process.exit(0);
}

const root = resolve(workspace || "/Users/brendan/notes");
const repoSlug = process.env.OMG_REPO ?? "notes";

const ws = Workspace.open(root);
const existing = ws.repoBySlug(repoSlug);

if (!existing) {
  console.log(`ingesting ${root} as repo '${repoSlug}'`);
  ingestDirectory(ws.store, repoSlug, root);
} else {
  console.log(`refreshing repo '${repoSlug}'`);
  freshnessSweep(ws.store, existing.repoId, existing.rootPath ?? root);
}

if (!existsSync(resolve(root, ".omgbase"))) {
  throw new Error(`setup failed: ${root}/.omgbase was not created`);
}

ws.store.close();
console.log("workspace ready:", root);

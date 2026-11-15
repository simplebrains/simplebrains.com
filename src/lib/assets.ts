import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const digestByPath = new Map<string, string>();

/**
 * Public-asset URL with a content digest query string for cache busting.
 * Example: `/brand/mark.svg` → `/brand/mark.svg?v=a1b2c3d4e5`
 */
export function publicAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  let digest = digestByPath.get(normalized);
  if (!digest) {
    const file = join(process.cwd(), "public", normalized.slice(1));
    digest = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10);
    digestByPath.set(normalized, digest);
  }
  return `${normalized}?v=${digest}`;
}

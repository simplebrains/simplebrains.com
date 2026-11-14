import { loadEnv } from "vite";

export type OmgConfig = {
  url?: string;
  workspace?: string;
  repo: string;
  token?: string;
  includeDrafts: boolean;
};

const DEFAULT_REPO = "notes";

export const WEBSITE_TYPE = {
  page: "/terms/types/website-page.md",
  project: "/terms/types/website-project.md",
  post: "/terms/types/website-post.md",
} as const;

/**
 * Resolve omg connection + publication preview flags from `.env` / process env.
 */
export function loadOmgConfig(purpose = "load website content"): OmgConfig {
  const env = {
    ...loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), ""),
    ...process.env,
  };

  const url = env.OMG_URL?.trim() || undefined;
  const workspace = env.OMG_WORKSPACE?.trim() || undefined;
  if (!url && !workspace) {
    throw new Error(
      `Set OMG_URL (remote MCP) or OMG_WORKSPACE (local vault) to ${purpose}.`,
    );
  }

  const includeDrafts =
    env.OMG_INCLUDE_DRAFTS === "1" ||
    env.OMG_INCLUDE_DRAFTS === "true" ||
    (env.OMG_INCLUDE_DRAFTS !== "0" &&
      env.OMG_INCLUDE_DRAFTS !== "false" &&
      (env.NODE_ENV ?? "development") !== "production");

  return {
    ...(url ? { url } : {}),
    ...(workspace ? { workspace } : {}),
    repo: env.OMG_REPO ?? DEFAULT_REPO,
    ...(env.OMG_TOKEN ? { token: env.OMG_TOKEN } : {}),
    includeDrafts,
  };
}

/**
 * OQX for the homepage-first launch: only the CMS home page.
 * Other website drafts may remain in the vault but stay out of Astro builds
 * until deliberately admitted. Paths use absolute reference form (`/…`).
 */
export function websiteContentQuery(includeDrafts: boolean): string {
  const statusClause = includeDrafts
    ? `(publication_status == "draft" || publication_status == "ready" || publication_status == "published")`
    : `publication_status == "published"`;

  return [
    "docs {",
    "  select _path, _title, type, publication_status, slug, summary, published_at, product_stage, post_kind",
    `  where _path == "/content/simplebrains/website/pages/home.md"`,
    `    and type == ${JSON.stringify(WEBSITE_TYPE.page)}`,
    `    and ${statusClause}`,
    "}",
  ].join("\n");
}

/** Authored public slug without leading/trailing slashes (`""` = home). */
export function publicSlugFromProperties(
  properties: Record<string, Record<string, unknown>>,
  path: string,
): string {
  const authored = properties.frontmatter?.slug;
  if (typeof authored === "string" && authored.length > 0) {
    return authored.replace(/^\/+|\/+$/g, "");
  }
  const normalized = path.replace(/^\//, "").replace(/\.md$/i, "");
  if (normalized.endsWith("pages/home")) return "";
  const pages = normalized.match(/(?:^|\/)pages\/([^/]+)$/);
  if (pages) return pages[1] === "home" ? "" : pages[1]!;
  const projects = normalized.match(/(?:^|\/)projects\/([^/]+)$/);
  if (projects) return `projects/${projects[1]}`;
  const posts = normalized.match(/(?:^|\/)posts\/\d{4}\/([^/]+)$/);
  if (posts) return `blog/${posts[1]}`;
  return normalized;
}

export function publicHrefFromSlug(slug: string): string {
  return slug === "" ? "/" : `/${slug}/`;
}

import { getCollection, type CollectionEntry } from "astro:content";
import { WEBSITE_TYPE } from "./omg";

export type SiteEntry = CollectionEntry<"site">;

export async function allSiteEntries(): Promise<SiteEntry[]> {
  return getCollection("site");
}

export async function entriesOfType(
  type: (typeof WEBSITE_TYPE)[keyof typeof WEBSITE_TYPE],
): Promise<SiteEntry[]> {
  return (await allSiteEntries()).filter((e) => e.data.type === type);
}

export async function entryBySlug(slug: string): Promise<SiteEntry | undefined> {
  return (await allSiteEntries()).find((e) => e.data.slug === slug);
}

export async function homeEntry(): Promise<SiteEntry | undefined> {
  return entryBySlug("");
}

export function hrefOf(entry: SiteEntry): string {
  return entry.data.slug === "" ? "/" : `/${entry.data.slug}/`;
}

export function stageLabel(stage: string | undefined): string | null {
  if (!stage) return null;
  const labels: Record<string, string> = {
    available: "Available",
    development: "In development",
    preview: "Preview",
    experimental: "Experimental",
    planned: "Planned",
    paused: "Paused",
  };
  return labels[stage] ?? stage;
}

export function kindLabel(kind: string | undefined): string | null {
  if (!kind) return null;
  if (kind === "build-note") return "Build note";
  if (kind === "essay") return "Essay";
  return kind;
}

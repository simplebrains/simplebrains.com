import { defineCollection, z } from "astro:content";
import { omgLoader } from "@omgbase/astro";
import {
  loadOmgConfig,
  publicHrefFromSlug,
  publicSlugFromProperties,
  websiteContentQuery,
} from "./lib/omg";

/**
 * Homepage-first launch: the collection query admits only the CMS home page.
 * Inter-doc rewrite stays wired for when more public pages are added later.
 */
const omg = loadOmgConfig("define website collections");

const shared = {
  repo: omg.repo,
  query: websiteContentQuery(omg.includeDrafts),
  slug: ({
    path,
    properties,
  }: {
    path: string;
    properties: Record<string, Record<string, unknown>>;
  }) => publicSlugFromProperties(properties, path),
  href: ({ slug }: { slug: string }) => publicHrefFromSlug(slug),
};

const loader = omg.url
  ? omgLoader({
      ...shared,
      url: omg.url,
      ...(omg.token ? { token: omg.token } : {}),
    })
  : omgLoader({
      ...shared,
      workspace: omg.workspace!,
    });

const site = defineCollection({
  loader,
  schema: z
    .object({
      title: z.string(),
      type: z.string(),
      publication_status: z.string().optional(),
      slug: z.string(),
      summary: z.string().optional(),
      published_at: z.union([z.string(), z.number()]).optional(),
      product_stage: z.string().optional(),
      post_kind: z.string().optional(),
      social_image: z.string().optional(),
      path: z.string(),
      docId: z.string(),
      contentHash: z.string().nullable(),
    })
    .passthrough(),
});

export const collections = { site };

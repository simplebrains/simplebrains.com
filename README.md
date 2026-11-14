# Simplebrains Website

Static site for [simplebrains.com](https://simplebrains.com).

**Current launch scope:** a polished homepage only. Blog, projects, and product pages stay out of the build until deliberately admitted. Content for `/` lives in the notes CMS at `/content/simplebrains/website/pages/home.md` and loads at build time through [`@omgbase/astro`](https://www.npmjs.com/package/@omgbase/astro).

## Setup

```bash
cp .env.example .env
# default: OMG_WORKSPACE pointing at your notes vault
npm install
npm run dev
```

`npm run setup:workspace` (also run by `dev`/`build`) opens the notes vault as an omgbase workspace and freshness-sweeps it when using `OMG_WORKSPACE`. Set `OMG_URL` (+ optional `OMG_TOKEN`) for a remote Streamable HTTP MCP endpoint instead — local setup is skipped in that case. Remote loads use the minimal MCP tool profile (`query` + `docs_read`).

This repo currently depends on a local checkout of `@omgbase/astro` (`file:../../omgbase/astro/packages/astro`) built against `@omgbase/core` ^0.37 for notes schema v18.

### Publication filter

- `astro dev` includes `draft`, `ready`, and `published` by default (the homepage is still draft until launch).
- `astro build` / `NODE_ENV=production` includes only `publication_status == published`, unless `OMG_INCLUDE_DRAFTS=1`.
- The collection query admits **only** the homepage path, so other CMS drafts cannot leak into HTML output.

## Brand & typography

Aligned to the geometric rounded wordmark:

- **Wordmark** — `public/brand/simplebrains-wordmark.png` (teal `#008c96` + coral `#fa503c`)
- **Palette** — navy ink + soft teal paper; teal as the primary accent; coral only for rare signals (e.g. draft banner)
- **Outfit** — display + body
- **IBM Plex Mono** — code / rare meta

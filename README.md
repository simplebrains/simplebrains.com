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

## Deploy (Firebase Hosting)

This repo is the source of truth for [simplebrains.com](https://simplebrains.com). Hosting project: **`simplebrains-dotcom`**. Output dir: `dist/`.

```bash
# One-time: firebase login
npx firebase login
npx firebase use simplebrains-dotcom

# Build + deploy hosting only
OMG_INCLUDE_DRAFTS=1 npm run deploy
# or: npm run build && npx firebase deploy --only hosting
```

Keep `.env` local (gitignored). Never commit `OMG_TOKEN`.

CI Hosting deploy is not wired yet: `@omgbase/astro` is still a local `file:` dependency, so GitHub Actions cannot build until that package is published or vendored.

## Brand & typography

Signal Studio palette (tokens in `src/styles/tokens.css`):

- **Azure** `#0076F5` — primary signature (CTAs, “simple”, left brain, italic signal)
- **Coral** `#FF4365` — expressive secondary (“brains”, right brain, sparse accents)
- **Mint** `#24D8A8` — occasional spark
- **Ink** `#151823` / **Paper** `#F7FBFF`
- Wordmark + brain SVGs in `public/brand/`; serif/sans stack unchanged from Editorial Ink

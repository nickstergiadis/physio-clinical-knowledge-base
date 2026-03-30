# Physio Clinical Knowledge Base (Static GitHub Pages Edition)

This repository now builds as a **fully static Next.js export** for deployment on **GitHub Pages project sites**.

## What changed

- Removed runtime backend requirements (PostgreSQL, Prisma, API routes, server-side assistant, and admin dashboard).
- Added a build-time markdown pipeline that reads source files and emits static pages.
- Added build-time JSON artifacts for client search and precomputed related-content links.
- Configured Next.js with `output: 'export'` and project-subpath support (`basePath` / `assetPrefix`).
- Added GitHub Actions workflow to build and deploy `/out` to Pages.

## Source of truth

Markdown files in `/knowledge_base_source` are the source of truth.

In this repository, `knowledge_base_source` points to `physio_kb_clinical_handbook`.
You can override with:

```bash
KNOWLEDGE_BASE_SOURCE=/absolute/path/to/knowledge_base_source
```

## Static content pipeline

### Build-time parsing

The pipeline in `lib/kb.ts`:

1. Recursively reads markdown from `knowledge_base_source`.
2. Parses frontmatter when present.
3. Infers fallback metadata when frontmatter is missing:
   - title
   - section
   - region
   - aliases/tags/summary/excerpt
4. Extracts citations from markdown links.
5. Precomputes related-content links for condition pages:
   - assessment tools
   - exercise frameworks
   - evidence updates
   - post-op annexes

### JSON output for client search

`npm run build:index` (also run automatically in `prebuild`) generates:

- `public/data/search-index.json`
- `public/data/related-content.json`

Search is fully client-side over:

- title
- aliases
- tags
- summary
- excerpt

Common aliases/abbreviations are included (GTPS, FAIS, OA, ACLR, RCRSP, TKA, THA, TMJ/TMD).

## Run locally

```bash
npm install
npm run dev
```

## Build static export

```bash
npm run build
```

This outputs static assets to:

```text
/out
```

## GitHub Pages deployment

Workflow: `.github/workflows/deploy-pages.yml`

- Builds with `NEXT_PUBLIC_BASE_PATH=/<repo-name>`.
- Runs `next build` with static export.
- Uploads `./out` as Pages artifact.
- Deploys using `actions/deploy-pages`.

## Limitations of the static version

- No runtime database updates; content changes require rebuild/redeploy.
- No server API routes or server actions.
- Search ranking is client-side heuristic instead of PostgreSQL full-text ranking.
- Favorites are local-only via `localStorage`.

## Accessibility and UI guarantees

- Semantic headings and landmarks.
- Keyboard navigation with visible focus styles.
- Responsive mobile navigation.
- Print-friendly detail pages.
- Clinical/minimal presentation with preserved source-file references and citations.

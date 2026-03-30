# Physio Clinical Knowledge Base (v1)

A production-style, accessible **Next.js + TypeScript + PostgreSQL + Prisma** application that imports markdown clinical content and serves it as a searchable knowledge base.

## Stack

- Next.js (App Router)
- TypeScript
- PostgreSQL
- Prisma ORM

## Source of truth

Importer reads markdown recursively from:

1. `KNOWLEDGE_BASE_SOURCE` env var (recommended), otherwise
2. `./knowledge_base_source`, otherwise
3. `./physio_kb_clinical_handbook` (fallback for this repository)

## Data model

- `Region`
- `ContentType`
- `ContentItem`
- `Tag`
- `Citation`
- `RelatedLink`
- `SavedPage`

`ContentItem` preserves original markdown and source path.

## Features delivered

- Home page with:
  - search bar
  - browse by body region
  - browse by content type
  - recently updated content
- Search page:
  - PostgreSQL full-text search over title + content + tags
  - weighted ranking for exact/prefix title matches
  - diagnostic-intent boost for condition pages
  - acronym alias expansion (GTPS, FAIS, OA, ACLR, RCRSP)
  - filters for region and content type
- Content detail page:
  - markdown rendering
  - metadata display (type, region, source file)
  - quick facts summary for condition pages
  - related assessment and related rehab progression sections
  - related content links grouped by assessment/rehab/evidence/postop
  - citations/evidence section
  - client-side favorites toggle
- Navigation and workflow:
  - structured sidebar + mobile toggle navigation
  - local-persistence favorites panel (localStorage)
  - skip link and improved focus handling
- Accessibility and print:
  - semantic landmarks + heading structure
  - keyboard-accessible controls with visible focus states
  - improved contrast and minimum touch target sizing
  - print-optimized detail pages (clean margins, less page breaking)

## Setup

### 1) Install dependencies

```bash
npm run install:deps
```

### 2) Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL `DATABASE_URL` and optional `KNOWLEDGE_BASE_SOURCE`.

### 3) Generate Prisma client and migrate database

```bash
npm run db:generate
npm run db:migrate -- --name init
```

### 4) Import the markdown knowledge base

```bash
npm run import:kb
```

### 5) Start development server

```bash
npm run dev
```

Open <http://localhost:3000>

## Scripts

- `npm run install:deps` – install dependencies
- `npm run db:generate` – generate Prisma client
- `npm run db:migrate` – run Prisma migrations
- `npm run import:kb` – import markdown from source directory
- `npm run seed` – run importer via Prisma seed hook
- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run typecheck` – TypeScript check

## Importer hardening and metadata normalization

Importer now adds defensive behavior for common fragility points:

- Region inference checks both paths and title text (not just folder naming).
- Slug collision handling appends deterministic numeric suffixes.
- Metadata values are normalized for spacing and separators.
- Tag extraction supports acronym aliases and clinical synonym expansion.
- Citation extraction deduplicates repeated links/lines.
- Related link inference still includes explicit markdown cross-links + regional cluster relationships.

## Error handling

- Importer exits non-zero on critical failures.
- Empty source directory surfaces a clear import error.
- DB calls use explicit includes/selects and defensive null rendering.

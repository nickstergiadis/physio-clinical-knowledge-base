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
  - filters for region and content type
- Content detail page:
  - markdown rendering
  - metadata display (type, region, source file)
  - related content
  - citations/evidence section
  - assessment/rehab/evidence/postop related links where available
- Structured left sidebar + mobile toggle navigation
- Accessibility basics:
  - semantic landmarks
  - keyboard-accessible controls
  - visible focus states
  - readable typography/line length
- Print mode for clean clinical printing

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

## Notes on importer behavior

- Recursively scans all `.md` files.
- Extracts and normalizes:
  - title
  - slug
  - source path and filename
  - body region inference (path/filename)
  - content type inference (top-level folder)
  - tags (keyword extraction)
  - citations/evidence links (markdown links + evidence sections)
  - related links (cross-links + inferred cluster links)
- Preserves full original markdown body in DB.

## Error handling

- Importer exits non-zero on critical failures.
- Empty source directory surfaces a clear import error.
- DB calls use explicit includes/selects and defensive null rendering.

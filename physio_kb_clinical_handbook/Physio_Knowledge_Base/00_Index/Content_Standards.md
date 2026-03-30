---
title: Content Standards
page_type: index_standard
region: General
tags: [standards, governance, authoring]
aliases: [KB standards]
status: active
last_reviewed: 2026-03-30
evidence_level: n/a
related_pages: [KB_Index, Build_Roadmap]
---

# Content Standards

## Naming conventions
- Folders: `Title_Case_With_Underscores`.
- Files: `Topic_Name.md`, concise and explicit.
- Prefer one condition/page concept per file.
- Keep legacy raw summaries inside `99_Legacy/`.

## Required frontmatter fields
- `title`
- `page_type` (condition, assessment, post_op, outcome_measure, index, evidence_note, template)
- `region`
- `tags`
- `aliases`
- `status` (draft, active, needs_evidence_refresh)
- `last_reviewed` (YYYY-MM-DD)
- `evidence_level` (high, moderate, mixed, limited, pragmatic, n/a)
- `related_pages`

## Citation and reference rules
- Do not fabricate references, dates, psychometric values, or return-to-sport criteria.
- If an evidence statement is uncertain, label with one of:
  - `Evidence update needed`
  - `Psychometric values to verify`
  - `Clinical pragmatism note`
- Keep references in plain markdown style; remove inline export artifacts.

## Page archetypes
- Condition page: use 15-section structure in template.
- Assessment page: use 12-section structure in template.
- Post-op page: use 11-section structure in template.
- Outcome measure page: use 9-section structure in template.

## Review/update process
1. Clinical editor performs content update.
2. Evidence pass confirms guideline year and evidence strength language.
3. Update `last_reviewed`, `status`, and `evidence_level`.
4. Add/refresh `related_pages` links.
5. Move superseded raw notes to `99_Legacy`.

## Internal linking conventions
- Use relative markdown links.
- Add `Related pages` section to every core page.
- Favor links by workflow:
  - condition -> assessment -> outcome measure -> post-op/evidence note

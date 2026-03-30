import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { excerptFromMarkdown, normalizeLabel, slugify, titleFromFilename } from '../lib/utils';

const prisma = new PrismaClient();

const SOURCE_ROOT =
  process.env.KNOWLEDGE_BASE_SOURCE ||
  (existsSync('./knowledge_base_source') ? './knowledge_base_source' : './physio_kb_clinical_handbook');

const CONTENT_TYPE_MAP: Record<string, string> = {
  '00_index': 'index',
  '01_foundations': 'foundation',
  '02_conditions': 'condition',
  '03_assessment_tools': 'assessment',
  '04_exercise_library': 'rehab',
  '05_evidence_updates': 'evidence',
  '06_protocol_annexes': 'postop',
};

const REGION_PATTERNS: Record<string, RegExp[]> = {
  ankle: [/\bankle\b/i, /\bfoot\b/i],
  cervical: [/\bcervical\b/i, /\bneck\b/i],
  elbow_forearm: [/\belbow\b/i, /\bforearm\b/i],
  hand_wrist: [/\bhand\b/i, /\bwrist\b/i],
  hip: [/\bhip\b/i],
  knee: [/\bknee\b/i],
  lumbar: [/\blumbar\b/i, /\blow\s+back\b/i, /\bspine\b/i],
  shoulder: [/\bshoulder\b/i],
  tmj: [/\btmj\b/i, /\btemporomandibular\b/i],
};

const TAG_ALIASES: Record<string, string[]> = {
  gtps: ['greater trochanteric pain syndrome', 'lateral hip pain'],
  fais: ['femoroacetabular impingement syndrome', 'hip impingement'],
  oa: ['osteoarthritis'],
  aclr: ['anterior cruciate ligament reconstruction', 'acl reconstruction'],
  rcrsp: ['rotator cuff related shoulder pain', 'rotator cuff pain'],
};

type ParsedItem = {
  title: string;
  slug: string;
  sourcePath: string;
  sourceFilename: string;
  markdown: string;
  excerpt: string;
  regionName: string | null;
  contentTypeName: string | null;
  tags: string[];
  citations: { label: string; url?: string; note?: string }[];
  relatedSlugs: { slug: string; kind: string }[];
  metadata: Record<string, unknown>;
  mtime: Date;
};

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function inferRegion(parts: string[], title: string): string | null {
  const joined = `${parts.join(' ')} ${title}`.replace(/[_-]+/g, ' ');

  for (const [regionKey, patterns] of Object.entries(REGION_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(joined))) {
      return normalizeLabel(regionKey === 'lumbar' ? 'lumbar spine' : regionKey);
    }
  }

  return null;
}

function extractTitle(markdown: string, filename: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || titleFromFilename(filename);
}

function normalizeMetadataValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeMetadataValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, normalizeMetadataValue(nested)]),
    );
  }
  return value;
}

function extractTagsAndCitations(markdown: string, title: string): {
  tags: string[];
  citations: { label: string; url?: string; note?: string }[];
} {
  const tags = new Set<string>();
  const citationsMap = new Map<string, { label: string; url?: string; note?: string }>();

  const baseKeywords = [
    'ankle', 'cervical', 'elbow', 'forearm', 'hand', 'wrist', 'hip', 'knee', 'lumbar', 'shoulder', 'tmj',
    'pain', 'rehab', 'assessment', 'strength', 'mobility', 'post-op', 'post op', 'osteoarthritis',
  ];

  for (const keyword of baseKeywords) {
    if (new RegExp(`\\b${keyword.replace(/[- ]/g, '[- ]?')}\\b`, 'i').test(markdown) || new RegExp(`\\b${keyword.replace(/[- ]/g, '[- ]?')}\\b`, 'i').test(title)) {
      tags.add(normalizeLabel(keyword));
    }
  }

  for (const [alias, expansions] of Object.entries(TAG_ALIASES)) {
    const aliasRegex = new RegExp(`\\b${alias}\\b`, 'i');
    if (aliasRegex.test(markdown) || aliasRegex.test(title)) {
      tags.add(alias.toUpperCase());
      for (const expansion of expansions) {
        tags.add(normalizeLabel(expansion));
      }
    }
    for (const expansion of expansions) {
      if (new RegExp(`\\b${expansion.replace(/\s+/g, '\\s+')}\\b`, 'i').test(markdown) || new RegExp(`\\b${expansion.replace(/\s+/g, '\\s+')}\\b`, 'i').test(title)) {
        tags.add(normalizeLabel(expansion));
      }
    }
  }

  for (const match of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)) {
    const label = match[1].trim();
    const url = match[2].trim();
    const key = `${label}::${url}`.toLowerCase();
    citationsMap.set(key, { label, url });
  }

  const evidenceSection = markdown.match(/(?:^|\n)#{1,3}\s*(?:citations?|references?|evidence)\s*\n([\s\S]*?)(?:\n#{1,3}\s|$)/i)?.[1];
  if (evidenceSection) {
    for (const line of evidenceSection.split('\n').map((l) => l.trim()).filter(Boolean)) {
      const clean = line.replace(/^[-*]\s*/, '');
      if (!clean.includes('http')) {
        const key = `${clean}::`.toLowerCase();
        citationsMap.set(key, { label: clean });
      }
    }
  }

  return { tags: [...tags], citations: [...citationsMap.values()] };
}

function inferRelatedSlugs(markdown: string): { slug: string; kind: string }[] {
  const slugs: { slug: string; kind: string }[] = [];
  for (const match of markdown.matchAll(/\[[^\]]+\]\((?!https?:\/\/)([^)#?]+)(?:#[^)]+)?\)/g)) {
    const maybe = path.basename(match[1], '.md');
    if (maybe) {
      slugs.push({ slug: slugify(maybe), kind: 'cross_reference' });
    }
  }
  return slugs;
}

async function parseFile(filePath: string, root: string): Promise<ParsedItem> {
  const stat = await fs.stat(filePath);
  const markdown = await fs.readFile(filePath, 'utf8');
  const relPath = path.relative(root, filePath);
  const relParts = relPath.split(path.sep);
  const filename = path.basename(filePath);
  const topLevel = relParts[0] ?? 'misc';

  const title = extractTitle(markdown, filename);
  const slug = slugify(path.basename(filename, '.md'));
  const regionName = inferRegion(relParts.concat([filename]), title) || null;
  const contentTypeName = CONTENT_TYPE_MAP[topLevel] ? normalizeLabel(CONTENT_TYPE_MAP[topLevel]) : normalizeLabel(topLevel);
  const { tags, citations } = extractTagsAndCitations(markdown, title);

  return {
    title,
    slug,
    sourcePath: relPath,
    sourceFilename: filename,
    markdown,
    excerpt: excerptFromMarkdown(markdown),
    regionName,
    contentTypeName,
    tags,
    citations,
    relatedSlugs: inferRelatedSlugs(markdown),
    metadata: normalizeMetadataValue({
      folderSegments: relParts.slice(0, -1),
      topLevelFolder: topLevel,
      titleNormalized: normalizeLabel(title),
      importVersion: 2,
    }) as Record<string, unknown>,
    mtime: stat.mtime,
  };
}

function ensureUniqueSlugs(parsed: ParsedItem[]): ParsedItem[] {
  const seen = new Map<string, number>();
  return parsed.map((item) => {
    const count = seen.get(item.slug) ?? 0;
    seen.set(item.slug, count + 1);
    if (count === 0) return item;

    return {
      ...item,
      slug: `${item.slug}-${count + 1}`,
      metadata: { ...item.metadata, slugCollisionResolved: true },
    };
  });
}

async function main() {
  const root = path.resolve(SOURCE_ROOT);
  console.log(`Importing markdown from: ${root}`);

  const files = await collectMarkdownFiles(root);
  if (!files.length) {
    throw new Error(`No markdown files found in: ${root}`);
  }

  const parsed = ensureUniqueSlugs(await Promise.all(files.map((file) => parseFile(file, root))));

  await prisma.$transaction(async (tx) => {
    await tx.relatedLink.deleteMany();
    await tx.citation.deleteMany();
    await tx.contentItemTag.deleteMany();
    await tx.savedPage.deleteMany();
    await tx.contentItem.deleteMany();

    for (const item of parsed) {
      const region = item.regionName
        ? await tx.region.upsert({
            where: { slug: slugify(item.regionName) },
            update: { name: item.regionName },
            create: { name: item.regionName, slug: slugify(item.regionName) },
          })
        : null;

      const contentType = item.contentTypeName
        ? await tx.contentType.upsert({
            where: { slug: slugify(item.contentTypeName) },
            update: { name: item.contentTypeName },
            create: { name: item.contentTypeName, slug: slugify(item.contentTypeName) },
          })
        : null;

      const createdItem = await tx.contentItem.create({
        data: {
          title: item.title,
          slug: item.slug,
          sourcePath: item.sourcePath,
          sourceFilename: item.sourceFilename,
          markdown: item.markdown,
          excerpt: item.excerpt,
          metadata: item.metadata,
          updatedAtSource: item.mtime,
          regionId: region?.id,
          contentTypeId: contentType?.id,
        },
      });

      for (const tagName of item.tags.slice(0, 40)) {
        const tag = await tx.tag.upsert({
          where: { slug: slugify(tagName) },
          update: { name: tagName },
          create: { name: tagName, slug: slugify(tagName) },
        });

        await tx.contentItemTag.create({
          data: { contentItemId: createdItem.id, tagId: tag.id },
        });
      }

      for (const citation of item.citations.slice(0, 25)) {
        await tx.citation.create({
          data: {
            contentItemId: createdItem.id,
            label: citation.label,
            url: citation.url,
            note: citation.note,
          },
        });
      }
    }

    const bySlug = new Map((await tx.contentItem.findMany({ select: { id: true, slug: true } })).map((it) => [it.slug, it.id]));

    for (const item of parsed) {
      const sourceId = bySlug.get(item.slug);
      if (!sourceId) continue;

      const candidateLinks = new Set<string>();
      for (const r of item.relatedSlugs) {
        if (r.slug !== item.slug) {
          candidateLinks.add(`${r.slug}::${r.kind}`);
        }
      }

      const siblings = parsed.filter(
        (other) =>
          other.slug !== item.slug &&
          other.contentTypeName !== item.contentTypeName &&
          other.regionName &&
          other.regionName === item.regionName,
      );
      for (const sib of siblings.slice(0, 7)) {
        candidateLinks.add(`${sib.slug}::cluster_related`);
      }

      for (const encoded of candidateLinks) {
        const [targetSlug, kind] = encoded.split('::');
        const targetId = bySlug.get(targetSlug);
        if (!targetId || targetId === sourceId) continue;

        await tx.relatedLink.upsert({
          where: {
            sourceItemId_targetItemId_kind: {
              sourceItemId: sourceId,
              targetItemId: targetId,
              kind,
            },
          },
          update: {},
          create: {
            sourceItemId: sourceId,
            targetItemId: targetId,
            kind,
          },
        });
      }
    }
  });

  console.log(`Imported ${parsed.length} markdown files.`);
}

main()
  .catch((err) => {
    console.error('Import failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

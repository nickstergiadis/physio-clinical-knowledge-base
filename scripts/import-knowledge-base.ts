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

function inferRegion(parts: string[]): string | null {
  const known = new Set([
    'ankle',
    'cervical',
    'elbow_forearm',
    'hand_wrist',
    'hip',
    'knee',
    'lumbar',
    'shoulder',
    'tmj',
    'spine',
  ]);

  for (const part of parts) {
    if (known.has(part)) {
      return normalizeLabel(part === 'spine' ? 'lumbar spine' : part);
    }
  }

  return null;
}

function extractTitle(markdown: string, filename: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || titleFromFilename(filename);
}

function extractTagsAndCitations(markdown: string): {
  tags: string[];
  citations: { label: string; url?: string; note?: string }[];
} {
  const tags = new Set<string>();
  const citations: { label: string; url?: string; note?: string }[] = [];

  for (const match of markdown.matchAll(/\b(ankle|cervical|elbow|forearm|hand|wrist|hip|knee|lumbar|shoulder|tmj|pain|rehab|assessment|strength|mobility|post[- ]?op)\b/gi)) {
    tags.add(normalizeLabel(match[1]));
  }

  for (const match of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)) {
    citations.push({ label: match[1].trim(), url: match[2].trim() });
  }

  const evidenceSection = markdown.match(/(?:^|\n)#{1,3}\s*(?:citations?|references?|evidence)\s*\n([\s\S]*?)(?:\n#{1,3}\s|$)/i)?.[1];
  if (evidenceSection) {
    for (const line of evidenceSection.split('\n').map((l) => l.trim()).filter(Boolean)) {
      if (!line.includes('http')) {
        citations.push({ label: line.replace(/^[-*]\s*/, '') });
      }
    }
  }

  return { tags: [...tags], citations };
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
  const regionName = inferRegion(relParts.concat([filename])) || null;
  const contentTypeName = CONTENT_TYPE_MAP[topLevel] ? normalizeLabel(CONTENT_TYPE_MAP[topLevel]) : normalizeLabel(topLevel);
  const { tags, citations } = extractTagsAndCitations(markdown);

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
    metadata: {
      folderSegments: relParts.slice(0, -1),
      topLevelFolder: topLevel,
    },
    mtime: stat.mtime,
  };
}

async function main() {
  const root = path.resolve(SOURCE_ROOT);
  console.log(`Importing markdown from: ${root}`);

  const files = await collectMarkdownFiles(root);
  if (!files.length) {
    throw new Error(`No markdown files found in: ${root}`);
  }

  const parsed = await Promise.all(files.map((file) => parseFile(file, root)));

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

      for (const tagName of item.tags) {
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

      // infer cluster-level relationships based on shared folder + region.
      const siblings = parsed.filter(
        (other) =>
          other.slug !== item.slug &&
          other.contentTypeName !== item.contentTypeName &&
          other.regionName &&
          other.regionName === item.regionName,
      );
      for (const sib of siblings.slice(0, 5)) {
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

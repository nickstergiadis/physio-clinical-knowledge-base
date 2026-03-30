import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { excerptFromMarkdown, normalizeLabel, slugify, titleFromFilename } from '../lib/utils';

const prisma = new PrismaClient();

const SOURCE_ROOT =
  process.env.KNOWLEDGE_BASE_SOURCE ||
  (existsSync('./knowledge_base_source') ? './knowledge_base_source' : './physio_kb_clinical_handbook');

const STATUS_PATH = path.resolve('.kb-admin/import-status.json');

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

type Frontmatter = Record<string, string | string[] | undefined>;

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
  warnings: string[];
};

type ImportStatus = {
  sourceRoot: string;
  generatedAt: string;
  lastImportAt: string | null;
  status: 'imported' | 'skipped' | 'failed';
  fileCount: number;
  changed: boolean;
  summary: {
    missingTitles: string[];
    duplicateSlugs: { slug: string; files: string[] }[];
    missingInference: { sourcePath: string; missing: ('region' | 'type')[] }[];
    brokenRelatedLinks: { sourcePath: string; link: string }[];
    frontmatterConsistency: { sourcePath: string; issue: string }[];
  };
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

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: raw };

  const data: Frontmatter = {};
  let activeKey = '';
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1].toLowerCase();
      const value = kv[2].trim();
      activeKey = key;
      if (!value) {
        data[key] = [];
      } else {
        data[key] = value.replace(/^['\"]|['\"]$/g, '');
      }
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem && activeKey) {
      const current = data[activeKey];
      const list = Array.isArray(current) ? current : [];
      list.push(listItem[1].trim().replace(/^['\"]|['\"]$/g, ''));
      data[activeKey] = list;
    }
  }

  return { frontmatter: data, body: raw.slice(match[0].length) };
}

function extractTitle(markdown: string, filename: string, frontmatter: Frontmatter): { title: string; missingTitle: boolean } {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const fmTitle = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : '';
  const fallback = titleFromFilename(filename);

  if (heading) return { title: heading, missingTitle: false };
  if (fmTitle) return { title: fmTitle, missingTitle: false };
  return { title: fallback, missingTitle: true };
}

function normalizeMetadataValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeMetadataValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, normalizeMetadataValue(nested)]));
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
    'ankle',
    'cervical',
    'elbow',
    'forearm',
    'hand',
    'wrist',
    'hip',
    'knee',
    'lumbar',
    'shoulder',
    'tmj',
    'pain',
    'rehab',
    'assessment',
    'strength',
    'mobility',
    'post-op',
    'post op',
    'osteoarthritis',
  ];

  for (const keyword of baseKeywords) {
    if (
      new RegExp(`\\b${keyword.replace(/[- ]/g, '[- ]?')}\\b`, 'i').test(markdown) ||
      new RegExp(`\\b${keyword.replace(/[- ]/g, '[- ]?')}\\b`, 'i').test(title)
    ) {
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
      if (
        new RegExp(`\\b${expansion.replace(/\s+/g, '\\s+')}\\b`, 'i').test(markdown) ||
        new RegExp(`\\b${expansion.replace(/\s+/g, '\\s+')}\\b`, 'i').test(title)
      ) {
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
    for (const line of evidenceSection
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)) {
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

function inferType(topLevelFolder: string): string | null {
  if (CONTENT_TYPE_MAP[topLevelFolder]) {
    return normalizeLabel(CONTENT_TYPE_MAP[topLevelFolder]);
  }
  if (/^[0-9]{2}_/.test(topLevelFolder)) {
    return null;
  }
  return normalizeLabel(topLevelFolder);
}

async function parseFile(filePath: string, root: string): Promise<ParsedItem> {
  const stat = await fs.stat(filePath);
  const raw = await fs.readFile(filePath, 'utf8');
  const { frontmatter, body: markdown } = parseFrontmatter(raw);
  const relPath = path.relative(root, filePath);
  const relParts = relPath.split(path.sep);
  const filename = path.basename(filePath);
  const topLevel = relParts[0] ?? 'misc';

  const titleInfo = extractTitle(markdown, filename, frontmatter);
  const slug =
    (typeof frontmatter.slug === 'string' && slugify(frontmatter.slug)) || slugify(path.basename(filename, '.md'));

  const inferredRegion = inferRegion(relParts.concat([filename]), titleInfo.title) || null;
  const inferredType = inferType(topLevel);

  const fmRegion = typeof frontmatter.region === 'string' ? normalizeLabel(frontmatter.region) : null;
  const fmType = typeof frontmatter.type === 'string' ? normalizeLabel(frontmatter.type) : null;

  const regionName = fmRegion || inferredRegion;
  const contentTypeName = fmType || inferredType;
  const { tags, citations } = extractTagsAndCitations(markdown, titleInfo.title);

  const warnings: string[] = [];
  if (titleInfo.missingTitle) warnings.push('missing_title');
  if (!regionName) warnings.push('missing_region_inference');
  if (!contentTypeName) warnings.push('missing_type_inference');

  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (typeof frontmatter.title === 'string' && h1 && frontmatter.title.trim() !== h1) {
    warnings.push('frontmatter_title_mismatch');
  }
  if (typeof frontmatter.region === 'string' && inferredRegion && normalizeLabel(frontmatter.region) !== inferredRegion) {
    warnings.push('frontmatter_region_mismatch');
  }
  if (typeof frontmatter.type === 'string' && inferredType && normalizeLabel(frontmatter.type) !== inferredType) {
    warnings.push('frontmatter_type_mismatch');
  }

  return {
    title: titleInfo.title,
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
      titleNormalized: normalizeLabel(titleInfo.title),
      importVersion: 3,
      warnings,
    }) as Record<string, unknown>,
    mtime: stat.mtime,
    warnings,
  };
}

function buildStatusReport(items: ParsedItem[], files: string[], root: string): ImportStatus {
  const filesBySlug = new Map<string, string[]>();
  const fileSet = new Set(items.map((item) => item.sourcePath));

  for (const item of items) {
    const acc = filesBySlug.get(item.slug) ?? [];
    acc.push(item.sourcePath);
    filesBySlug.set(item.slug, acc);
  }

  const brokenRelatedLinks: { sourcePath: string; link: string }[] = [];
  const missingTitles = items.filter((item) => item.warnings.includes('missing_title')).map((item) => item.sourcePath);
  const missingInference = items
    .filter((item) => item.warnings.includes('missing_region_inference') || item.warnings.includes('missing_type_inference'))
    .map((item) => ({
      sourcePath: item.sourcePath,
      missing: [
        item.warnings.includes('missing_region_inference') ? 'region' : null,
        item.warnings.includes('missing_type_inference') ? 'type' : null,
      ].filter(Boolean) as ('region' | 'type')[],
    }));

  for (const item of items) {
    for (const match of item.markdown.matchAll(/\[[^\]]+\]\((?!https?:\/\/)([^)#?]+)(?:#[^)]+)?\)/g)) {
      const candidate = match[1];
      const normalized = path
        .normalize(path.join(path.dirname(item.sourcePath), candidate))
        .replace(/\\/g, '/');
      const withExt = normalized.endsWith('.md') ? normalized : `${normalized}.md`;
      if (!fileSet.has(withExt)) {
        brokenRelatedLinks.push({ sourcePath: item.sourcePath, link: candidate });
      }
    }
  }

  const frontmatterConsistency: { sourcePath: string; issue: string }[] = [];
  for (const item of items) {
    for (const warning of item.warnings) {
      if (warning.startsWith('frontmatter_')) {
        frontmatterConsistency.push({ sourcePath: item.sourcePath, issue: warning });
      }
    }
  }

  const duplicateSlugs = [...filesBySlug.entries()]
    .filter(([, slugFiles]) => slugFiles.length > 1)
    .map(([slug, slugFiles]) => ({ slug, files: slugFiles }));


  return {
    sourceRoot: root,
    generatedAt: new Date().toISOString(),
    lastImportAt: null,
    status: 'skipped',
    fileCount: files.length,
    changed: true,
    summary: {
      missingTitles,
      duplicateSlugs,
      missingInference,
      brokenRelatedLinks,
      frontmatterConsistency,
    },
  };
}

async function readExistingStatus(): Promise<ImportStatus | null> {
  try {
    const raw = await fs.readFile(STATUS_PATH, 'utf8');
    return JSON.parse(raw) as ImportStatus;
  } catch {
    return null;
  }
}

async function writeStatus(status: ImportStatus): Promise<void> {
  await fs.mkdir(path.dirname(STATUS_PATH), { recursive: true });
  await fs.writeFile(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
}

async function importIntoDb(parsed: ParsedItem[]) {
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
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const validateOnly = args.has('--validate');
  const force = args.has('--force');

  const root = path.resolve(SOURCE_ROOT);
  console.log(`Importing markdown from: ${root}`);

  const files = await collectMarkdownFiles(root);
  if (!files.length) {
    throw new Error(`No markdown files found in: ${root}`);
  }

  const parsed = await Promise.all(files.map((file) => parseFile(file, root)));
  const status = buildStatusReport(parsed, files, root);
  const existing = await readExistingStatus();

  const latestFileMtime = Math.max(...parsed.map((item) => item.mtime.getTime()));
  const previousImportAt = existing?.lastImportAt ? new Date(existing.lastImportAt).getTime() : 0;
  const hasChanges = latestFileMtime > previousImportAt || files.length !== (existing?.fileCount ?? 0);
  status.changed = hasChanges;

  if (validateOnly) {
    status.status = 'skipped';
    await writeStatus(status);
    console.log('Validation complete.');
    return;
  }

  if (!hasChanges && !force) {
    status.status = 'skipped';
    status.lastImportAt = existing?.lastImportAt ?? null;
    await writeStatus(status);
    console.log('No source changes detected. Skipping import.');
    return;
  }

  await importIntoDb(parsed);

  status.status = 'imported';
  status.lastImportAt = new Date().toISOString();
  await writeStatus(status);

  console.log(`Imported ${parsed.length} markdown files.`);
  if (status.summary.duplicateSlugs.length || status.summary.missingTitles.length || status.summary.missingInference.length || status.summary.brokenRelatedLinks.length || status.summary.frontmatterConsistency.length) {
    console.log('Import warnings detected. Review .kb-admin/import-status.json');
  }
}

main()
  .catch(async (err) => {
    const fallback: ImportStatus = {
      sourceRoot: path.resolve(SOURCE_ROOT),
      generatedAt: new Date().toISOString(),
      lastImportAt: null,
      status: 'failed',
      fileCount: 0,
      changed: true,
      summary: {
        missingTitles: [],
        duplicateSlugs: [],
        missingInference: [],
        brokenRelatedLinks: [],
        frontmatterConsistency: [],
      },
    };
    await writeStatus(fallback);
    console.error('Import failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import fs from 'node:fs';
import path from 'node:path';
import { excerptFromMarkdown, normalizeLabel, slugify, titleFromFilename } from '@/lib/utils';

export type KbSection = 'foundations' | 'conditions' | 'assessment-tools' | 'exercise-frameworks' | 'evidence-updates' | 'post-op-annexes' | 'index';

export type KbItem = {
  id: string;
  slug: string;
  title: string;
  section: KbSection;
  sectionLabel: string;
  region: string;
  aliases: string[];
  tags: string[];
  summary: string;
  excerpt: string;
  markdown: string;
  sourcePath: string;
  citations: Array<{ label: string; url?: string }>;
  related: {
    assessmentTools: string[];
    exerciseFrameworks: string[];
    evidenceUpdates: string[];
    postOpAnnexes: string[];
  };
};

type Frontmatter = Record<string, string | string[] | undefined>;

const SOURCE_ROOT = path.resolve(
  process.env.KNOWLEDGE_BASE_SOURCE ||
    (fs.existsSync(path.resolve('knowledge_base_source')) ? 'knowledge_base_source' : 'physio_kb_clinical_handbook'),
);

const SECTION_MAP: Record<string, KbSection> = {
  '00_index': 'index',
  '01_foundations': 'foundations',
  '02_conditions': 'conditions',
  '03_assessment_tools': 'assessment-tools',
  '04_exercise_library': 'exercise-frameworks',
  '05_evidence_updates': 'evidence-updates',
  '06_protocol_annexes': 'post-op-annexes',
};

const ALIAS_MAP: Record<string, string[]> = {
  gtps: ['greater trochanteric pain syndrome'],
  fais: ['femoroacetabular impingement syndrome', 'hip impingement'],
  oa: ['osteoarthritis', 'degenerative joint disease'],
  aclr: ['anterior cruciate ligament reconstruction'],
  rcrsp: ['rotator cuff related shoulder pain'],
  tka: ['total knee arthroplasty', 'total knee replacement'],
  tha: ['total hip arthroplasty', 'total hip replacement'],
  tmj: ['temporomandibular joint disorder', 'temporomandibular'],
  tmd: ['temporomandibular disorder'],
};

const SECTION_LABELS: Record<KbSection, string> = {
  foundations: 'Foundations',
  conditions: 'Conditions',
  'assessment-tools': 'Assessment Tools',
  'exercise-frameworks': 'Exercise Frameworks',
  'evidence-updates': 'Evidence Updates',
  'post-op-annexes': 'Post-op Annexes',
  index: 'Index',
};

function collectMarkdownFiles(rootDir: string): string[] {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdownFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(fullPath);
  }

  return files;
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: raw };

  const frontmatter: Frontmatter = {};
  let activeKey = '';

  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      activeKey = kv[1].toLowerCase();
      const value = kv[2].trim();
      frontmatter[activeKey] = value ? value.replace(/^['"]|['"]$/g, '') : [];
      continue;
    }

    const listItem = line.match(/^\s*[-*]\s+(.+)$/);
    if (listItem && activeKey) {
      const existing = frontmatter[activeKey];
      const values: string[] = Array.isArray(existing) ? [...existing] : [];
      values.push(listItem[1].trim().replace(/^['"]|['"]$/g, ''));
      frontmatter[activeKey] = values;
    }
  }

  return { frontmatter, body: raw.slice(match[0].length) };
}

function inferRegion(sourcePath: string, title: string): string {
  const value = `${sourcePath} ${title}`.toLowerCase();
  if (value.includes('lumbar') || value.includes('low_back') || value.includes('spine')) return 'Lumbar Spine';
  if (value.includes('elbow') || value.includes('forearm')) return 'Elbow & Forearm';
  if (value.includes('hand') || value.includes('wrist')) return 'Hand & Wrist';
  if (value.includes('tmj') || value.includes('temporomandibular')) return 'TMJ';
  const known = ['ankle', 'cervical', 'hip', 'knee', 'shoulder'];
  const region = known.find((item) => value.includes(item));
  return region ? normalizeLabel(region) : 'General';
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(',').map((item) => item.trim()).filter(Boolean);
}

function inferAliases(title: string, markdown: string, tags: string[]): string[] {
  const haystack = `${title} ${markdown} ${tags.join(' ')}`.toLowerCase();
  const aliases = new Set<string>();

  for (const [short, expansions] of Object.entries(ALIAS_MAP)) {
    if (haystack.includes(short) || expansions.some((full) => haystack.includes(full))) {
      aliases.add(short.toUpperCase());
      expansions.forEach((entry) => aliases.add(entry));
    }
  }

  return [...aliases];
}

function inferCitations(markdown: string): Array<{ label: string; url?: string }> {
  const map = new Map<string, { label: string; url?: string }>();
  for (const match of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)) {
    const label = match[1].trim();
    const url = match[2].trim();
    map.set(`${label}:${url}`.toLowerCase(), { label, url });
  }
  return [...map.values()];
}

function relatedForCondition(item: KbItem, items: KbItem[]) {
  const sameRegion = (section: KbSection) =>
    items
      .filter((candidate) => candidate.slug !== item.slug && candidate.section === section && candidate.region === item.region)
      .slice(0, 6)
      .map((candidate) => candidate.slug);

  return {
    assessmentTools: sameRegion('assessment-tools'),
    exerciseFrameworks: sameRegion('exercise-frameworks'),
    evidenceUpdates: sameRegion('evidence-updates'),
    postOpAnnexes: items
      .filter((candidate) => candidate.slug !== item.slug && candidate.section === 'post-op-annexes')
      .filter((candidate) => candidate.region === item.region || candidate.aliases.some((a) => item.aliases.includes(a)))
      .slice(0, 6)
      .map((candidate) => candidate.slug),
  };
}

let cache: KbItem[] | null = null;

export function getKnowledgeBaseItems(): KbItem[] {
  if (cache) return cache;

  const files = collectMarkdownFiles(SOURCE_ROOT);
  const items = files.map((filePath) => {
    const relPath = path.relative(SOURCE_ROOT, filePath);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(raw);
    const title = (typeof frontmatter.title === 'string' && frontmatter.title.trim()) || body.match(/^#\s+(.+)$/m)?.[1] || titleFromFilename(path.basename(filePath));
    const section = SECTION_MAP[relPath.split(path.sep)[0] || ''] || 'index';
    const tags = [...new Set(toArray(frontmatter.tags).map((tag) => normalizeLabel(tag)))];

    const item: KbItem = {
      id: slugify(relPath),
      slug: (typeof frontmatter.slug === 'string' ? slugify(frontmatter.slug) : slugify(path.basename(filePath, '.md'))),
      title,
      section,
      sectionLabel: SECTION_LABELS[section],
      region: inferRegion(relPath, title),
      aliases: [],
      tags,
      summary: (typeof frontmatter.summary === 'string' && frontmatter.summary) || excerptFromMarkdown(body, 180),
      excerpt: excerptFromMarkdown(body),
      markdown: body,
      sourcePath: relPath,
      citations: inferCitations(body),
      related: { assessmentTools: [], exerciseFrameworks: [], evidenceUpdates: [], postOpAnnexes: [] },
    };

    item.aliases = inferAliases(item.title, body, item.tags);
    return item;
  });

  const bySlug = new Map(items.map((item) => [item.slug, item]));
  for (const item of items) {
    if (item.section === 'conditions') {
      item.related = relatedForCondition(item, items);
      item.related.assessmentTools = item.related.assessmentTools.filter((slug) => bySlug.has(slug));
      item.related.exerciseFrameworks = item.related.exerciseFrameworks.filter((slug) => bySlug.has(slug));
      item.related.evidenceUpdates = item.related.evidenceUpdates.filter((slug) => bySlug.has(slug));
      item.related.postOpAnnexes = item.related.postOpAnnexes.filter((slug) => bySlug.has(slug));
    }
  }

  cache = items.sort((a, b) => a.title.localeCompare(b.title));
  return cache;
}

export function getNavigationData() {
  const items = getKnowledgeBaseItems();
  const regions = [...new Set(items.map((item) => item.region))].sort();
  const sections = Object.entries(SECTION_LABELS)
    .filter(([key]) => key !== 'index')
    .map(([slug, name]) => ({ slug, name, count: items.filter((item) => item.section === slug).length }));

  return {
    regions: regions.map((name) => ({ slug: slugify(name), name, count: items.filter((item) => item.region === name).length })),
    sections,
  };
}

export function getItemBySlug(slug: string) {
  return getKnowledgeBaseItems().find((item) => item.slug === slug);
}

export function getItemsBySlugs(slugs: string[]) {
  const map = new Map(getKnowledgeBaseItems().map((item) => [item.slug, item]));
  return slugs.map((slug) => map.get(slug)).filter(Boolean) as KbItem[];
}

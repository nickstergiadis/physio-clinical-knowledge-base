import { slugify } from '@/lib/utils';
import { getKnowledgeBaseItems, type KbItem } from '@/lib/kb';

const REQUIRED_SECTIONS = [
  'clinical question',
  'key findings',
  'study/guideline quality signal',
  'clinical bottom line',
  'applicability / caveats',
  'controversies / limitations',
  'linked related condition, treatment, test, and progression pages',
  'references',
] as const;

export type EvidenceSummarySectionKey = typeof REQUIRED_SECTIONS[number];

export type EvidenceSummaryPageData = {
  item: KbItem;
  sections: Record<EvidenceSummarySectionKey, string>;
  linkedPageCount: number;
  referenceCount: number;
};

function normalizeHeading(value: string) {
  return value.trim().toLowerCase();
}

function splitByHeading(markdown: string) {
  const parts = markdown.split(/\n(?=##\s+)/);
  return parts
    .map((part) => {
      const heading = part.match(/^##\s+(.+)$/m)?.[1]?.trim();
      if (!heading) return null;
      const content = part.replace(/^##\s+.+$/m, '').trim();
      return { heading: normalizeHeading(heading), content };
    })
    .filter(Boolean) as Array<{ heading: string; content: string }>;
}

function extractSectionContent(markdown: string): Record<EvidenceSummarySectionKey, string> {
  const sections = splitByHeading(markdown);
  const map = new Map(sections.map((section) => [section.heading, section.content]));

  return REQUIRED_SECTIONS.reduce((acc, key) => {
    acc[key] = map.get(key) || '';
    return acc;
  }, {} as Record<EvidenceSummarySectionKey, string>);
}

function countMarkdownLinks(markdownSection: string) {
  return [...markdownSection.matchAll(/\[[^\]]+\]\((https?:\/\/|\/)[^)]+\)/g)].length;
}

export function isEvidenceSummaryItem(item: KbItem) {
  return item.section === 'evidence-updates' && REQUIRED_SECTIONS.every((section) => item.markdown.toLowerCase().includes(`## ${section}`));
}

export function getEvidenceSummaryItems() {
  return getKnowledgeBaseItems().filter(isEvidenceSummaryItem);
}

export function getEvidenceSummaryBySlug(slug: string): EvidenceSummaryPageData | undefined {
  const item = getEvidenceSummaryItems().find((entry) => entry.slug === slug || slugify(entry.slug) === slug);
  if (!item) return undefined;

  const sections = extractSectionContent(item.markdown);
  return {
    item,
    sections,
    linkedPageCount: countMarkdownLinks(sections['linked related condition, treatment, test, and progression pages']),
    referenceCount: countMarkdownLinks(sections.references),
  };
}


function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function getEvidenceSummariesForConditionLabels(labels: string[]) {
  const normalized = labels.map(normalize).filter(Boolean);
  return getEvidenceSummaryItems().filter((item) => {
    const haystack = normalize(`${item.title} ${item.summary} ${item.markdown} ${item.aliases.join(' ')}`);
    return normalized.some((label) => haystack.includes(label) || label.includes(normalize(item.title)));
  });
}

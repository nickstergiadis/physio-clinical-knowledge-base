import { BODY_REGION_HUBS } from '@/lib/bodyRegionHubs';
import { clinicalSeed } from '@/lib/clinicalSeed';
import { getKnowledgeBaseItems } from '@/lib/kb';

function normalizeEntityLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findKbSlugForLabels(labels: string[]) {
  const normalizedLabels = labels.map((label) => normalizeEntityLabel(label)).filter(Boolean);
  const candidates = getKnowledgeBaseItems();

  for (const normalizedLabel of normalizedLabels) {
    const exact = candidates.find((item) =>
      normalizeEntityLabel(item.title) === normalizedLabel
      || item.aliases.some((alias) => normalizeEntityLabel(alias) === normalizedLabel),
    );
    if (exact) return exact.slug;
  }

  for (const normalizedLabel of normalizedLabels) {
    const fuzzy = candidates.find((item) => {
      const normalizedTitle = normalizeEntityLabel(item.title);
      return (
        normalizedTitle.includes(normalizedLabel)
        || normalizedLabel.includes(normalizedTitle)
        || item.aliases.some((alias) => {
          const normalizedAlias = normalizeEntityLabel(alias);
          return normalizedAlias.includes(normalizedLabel) || normalizedLabel.includes(normalizedAlias);
        })
      );
    });

    if (fuzzy) return fuzzy.slug;
  }

  return undefined;
}

function buildEntityRouteMap() {
  const routeMap = new Map<string, string>();

  const register = (label: string, href: string) => {
    const normalized = normalizeEntityLabel(label);
    if (!normalized || routeMap.has(normalized)) return;
    routeMap.set(normalized, href);
  };

  for (const condition of getKnowledgeBaseItems().filter((item) => item.section === 'conditions')) {
    const href = `/content/${condition.slug}`;
    register(condition.title, href);
    for (const alias of condition.aliases) register(alias, href);
  }

  for (const condition of clinicalSeed.conditions) {
    const slug = findKbSlugForLabels([condition.title, ...condition.aliases]);
    if (!slug) continue;
    const href = `/content/${slug}`;
    register(condition.title, href);
    for (const alias of condition.aliases) register(alias, href);
  }

  for (const test of clinicalSeed.specialTests) {
    const href = `/special-tests/${test.id}`;
    register(test.title, href);
    for (const alias of test.aliases) register(alias, href);
  }

  for (const treatment of clinicalSeed.treatments) {
    const href = `/treatments/${treatment.id}`;
    register(treatment.title, href);
    for (const alias of treatment.aliases) register(alias, href);
  }

  for (const progression of clinicalSeed.exerciseProgressions) {
    const href = `/exercise-progressions/${progression.id}`;
    register(progression.title, href);
    for (const alias of progression.aliases) register(alias, href);
  }

  for (const measure of clinicalSeed.outcomeMeasures) {
    const href = `/outcome-measures/${measure.id}`;
    register(measure.title, href);
    for (const alias of measure.aliases) register(alias, href);
  }

  for (const region of BODY_REGION_HUBS) {
    register(region.name, `/body-regions/${region.slug}`);
  }

  register('Red flags / referral', '/red-flags-referral');
  register('Red flags referral', '/red-flags-referral');
  register('Evidence library', '/evidence-library');

  return routeMap;
}

const ENTITY_ROUTE_MAP = buildEntityRouteMap();
const ENTITY_ROUTE_ENTRIES = Array.from(ENTITY_ROUTE_MAP.entries());

function buildLabelVariants(label: string) {
  const variants = new Set<string>([label]);
  const noParen = label.replace(/\s*\([^)]*\)/g, '').trim();
  if (noParen) variants.add(noParen);

  for (const candidate of Array.from(variants)) {
    const slashParts = candidate.split(/\s*\/\s*/).map((part) => part.trim()).filter(Boolean);
    if (slashParts.length > 1) {
      for (const part of slashParts) variants.add(part);
    }
  }

  return Array.from(variants).map((value) => normalizeEntityLabel(value)).filter(Boolean);
}

export function getEntityHref(label: string) {
  for (const normalizedLabel of buildLabelVariants(label)) {
    const direct = ENTITY_ROUTE_MAP.get(normalizedLabel);
    if (direct) return direct;

    const fuzzy = ENTITY_ROUTE_ENTRIES
      .filter(([key]) => key.includes(normalizedLabel) || normalizedLabel.includes(key))
      .sort((a, b) => Math.abs(a[0].length - normalizedLabel.length) - Math.abs(b[0].length - normalizedLabel.length))[0];

    if (fuzzy) return fuzzy[1];
  }

  return undefined;
}

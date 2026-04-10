import { BODY_REGION_HUBS } from '@/lib/bodyRegionHubs';
import { clinicalSeed } from '@/lib/clinicalSeed';
import { getKnowledgeBaseItems } from '@/lib/kb';

function normalizeEntityLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findKbSlugForLabel(label: string) {
  const normalizedLabel = normalizeEntityLabel(label);
  const candidates = getKnowledgeBaseItems();

  const exact = candidates.find((item) => normalizeEntityLabel(item.title) === normalizedLabel);
  if (exact) return exact.slug;

  const aliasMatch = candidates.find((item) => item.aliases.some((alias) => normalizeEntityLabel(alias) === normalizedLabel));
  if (aliasMatch) return aliasMatch.slug;

  return candidates.find((item) => {
    const normalizedTitle = normalizeEntityLabel(item.title);
    return normalizedTitle.includes(normalizedLabel) || normalizedLabel.includes(normalizedTitle);
  })?.slug;
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
    const slug = findKbSlugForLabel(condition.title);
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

export function getEntityHref(label: string) {
  return ENTITY_ROUTE_MAP.get(normalizeEntityLabel(label));
}

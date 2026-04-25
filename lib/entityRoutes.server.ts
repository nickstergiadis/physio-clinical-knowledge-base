import { getKnowledgeBaseItems } from '@/lib/kb';
import { isEvidenceSummaryItem } from '@/lib/evidenceSummaries';

function normalizeEntityLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function buildKnowledgeBaseEntityRoutes() {
  const routeMap = new Map<string, string>();

  const register = (label: string, href: string) => {
    const normalized = normalizeEntityLabel(label);
    if (!normalized || routeMap.has(normalized)) return;
    routeMap.set(normalized, href);
  };

  for (const item of getKnowledgeBaseItems()) {
    const href = isEvidenceSummaryItem(item)
      ? `/evidence-library/${item.slug}`
      : `/content/${item.slug}`;

    register(item.title, href);
    for (const alias of item.aliases) register(alias, href);
  }

  return routeMap;
}

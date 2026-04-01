import { Suspense } from 'react';
import { SearchClient } from '@/components/SearchClient';
import { getKnowledgeBaseItems, getNavigationData } from '@/lib/kb';

export default function SearchPage() {
  const nav = getNavigationData();
  const items = getKnowledgeBaseItems().map((item) => ({
    slug: item.slug,
    title: item.title,
    section: item.section,
    sectionLabel: item.sectionLabel,
    region: item.region,
    aliases: item.aliases,
    tags: item.tags,
    summary: item.summary,
    excerpt: item.excerpt,
    sourcePath: item.sourcePath,
  }));

  return (
    <Suspense fallback={<section className="search-loading" role="status" aria-live="polite">Loading search index…</section>}>
      <SearchClient regions={nav.regions} sections={nav.sections} items={items} />
    </Suspense>
  );
}

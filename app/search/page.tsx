import { Suspense } from 'react';
import { SearchClient } from '@/components/SearchClient';
import { getSearchCatalog } from '@/lib/search';

export default function SearchPage() {
  const { items, regions, sections } = getSearchCatalog();

  return (
    <Suspense fallback={<section className="search-loading" role="status" aria-live="polite">Loading search index and preparing ranked results…</section>}>
      <SearchClient regions={regions} sections={sections} items={items} />
    </Suspense>
  );
}

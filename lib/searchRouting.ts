export type SearchRouteParams = {
  q?: string;
  region?: string;
  section?: string;
};

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\\+$/g, '');
}

export function buildSearchRoute(params: SearchRouteParams): string {
  const search = new URLSearchParams();
  const query = normalizeSearchQuery(params.q || '');

  if (query) search.set('q', query);
  if (params.region) search.set('region', params.region);
  if (params.section) search.set('section', params.section);

  const serialized = search.toString();
  return serialized ? `/search/?${serialized}` : '/search/';
}

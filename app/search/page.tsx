import Link from 'next/link';
import { FavoriteButton } from '@/components/FavoriteButton';
import { getNavigationData, searchContent } from '@/lib/data';

type SearchPageProps = {
  searchParams: Promise<{ q?: string; region?: string; type?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const [nav, results] = await Promise.all([
    getNavigationData(),
    searchContent({ q: params.q, region: params.region, type: params.type }),
  ]);

  return (
    <>
      <h1>Search</h1>
      <form className="card" style={{ marginBottom: '1rem' }} role="search" aria-label="Clinical content search">
        <div className="grid two">
          <div>
            <label htmlFor="q">Keyword</label>
            <input id="q" name="q" type="search" defaultValue={params.q || ''} />
          </div>
          <div>
            <label htmlFor="region">Body region</label>
            <select id="region" name="region" defaultValue={params.region || ''}>
              <option value="">All regions</option>
              {nav.regions.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="type">Content type</label>
            <select id="type" name="type" defaultValue={params.type || ''}>
              <option value="">All types</option>
              {nav.types.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button type="submit">Apply filters</button>
        </div>
      </form>

      <p aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'} found.</p>

      <ul className="clean grid" aria-label="Search results">
        {results.map((item) => (
          <li key={item.id} className="card result-card">
            <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>
              <Link href={`/content/${item.slug}`}>{item.title}</Link>
            </h2>
            <p>{item.excerpt}</p>
            <p>
              <strong>Region:</strong> {item.region?.name || 'General'} · <strong>Type:</strong> {item.contentType?.name || 'Other'}
            </p>
            {item.tags.length > 0 && (
              <p>
                <strong>Tags:</strong> {item.tags.map((t) => t.tag.name).join(', ')}
              </p>
            )}
            <FavoriteButton slug={item.slug} title={item.title} />
          </li>
        ))}
      </ul>
    </>
  );
}

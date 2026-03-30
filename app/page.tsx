import Link from 'next/link';
import { getNavigationData, getRecentContent } from '@/lib/data';

export default async function HomePage() {
  const [nav, recent] = await Promise.all([getNavigationData(), getRecentContent(10)]);

  return (
    <>
      <header>
        <h1>Clinical Knowledge Base</h1>
        <p>Search and browse physiotherapy references by region, condition, assessment, rehab and evidence updates.</p>
      </header>

      <section className="card" aria-labelledby="home-search-title" style={{ marginBottom: '1rem' }}>
        <h2 id="home-search-title">Quick search</h2>
        <form action="/search" role="search">
          <label htmlFor="q">Search title, content, and tags</label>
          <input id="q" name="q" type="search" placeholder="e.g. patellofemoral pain, rotator cuff, outcome measures" />
        </form>
      </section>

      <div className="grid two" style={{ marginBottom: '1rem' }}>
        <section className="card" aria-labelledby="regions-title">
          <h2 id="regions-title">Browse by body region</h2>
          <ul>
            {nav.regions.map((r) => (
              <li key={r.slug}>
                <Link href={`/search?region=${r.slug}`}>{r.name}</Link> ({r.count})
              </li>
            ))}
          </ul>
        </section>

        <section className="card" aria-labelledby="types-title">
          <h2 id="types-title">Browse by content type</h2>
          <ul>
            {nav.types.map((t) => (
              <li key={t.slug}>
                <Link href={`/search?type=${t.slug}`}>{t.name}</Link> ({t.count})
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" aria-labelledby="recent-title">
        <h2 id="recent-title">Recently updated</h2>
        <ul>
          {recent.map((item) => (
            <li key={item.id}>
              <Link href={`/content/${item.slug}`}>{item.title}</Link>
              {' · '}
              <span>{item.region?.name || 'General'}</span>
              {' · '}
              <span>{item.contentType?.name || 'Other'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

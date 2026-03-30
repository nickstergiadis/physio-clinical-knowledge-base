import Link from 'next/link';
import { getKnowledgeBaseItems, getNavigationData } from '@/lib/kb';

export default function HomePage() {
  const nav = getNavigationData();
  const recent = [...getKnowledgeBaseItems()].reverse().slice(0, 10);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <>
      <header>
        <h1>Clinical Knowledge Base</h1>
        <p>Static physiotherapy references from markdown source files, organized for fast point-of-care browsing.</p>
      </header>

      <section className="card" aria-labelledby="home-search-title" style={{ marginBottom: '1rem' }}>
        <h2 id="home-search-title">Quick search</h2>
        <form action={`${basePath}/search`} role="search">
          <label htmlFor="q">Search title, aliases, tags, and summary</label>
          <input id="q" name="q" type="search" placeholder="e.g. GTPS, patellofemoral pain, outcome measures" />
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

        <section className="card" aria-labelledby="sections-title">
          <h2 id="sections-title">Browse by section</h2>
          <ul>
            {nav.sections.map((s) => (
              <li key={s.slug}>
                <Link href={`/search?section=${s.slug}`}>{s.name}</Link> ({s.count})
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" aria-labelledby="recent-title">
        <h2 id="recent-title">Reference pages</h2>
        <ul>
          {recent.map((item) => (
            <li key={item.id}>
              <Link href={`/content/${item.slug}`}>{item.title}</Link>
              {' · '}
              <span>{item.region}</span>
              {' · '}
              <span>{item.sectionLabel}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

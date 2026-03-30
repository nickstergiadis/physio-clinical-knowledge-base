'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FavoriteButton } from '@/components/FavoriteButton';

type SearchItem = {
  slug: string;
  title: string;
  section: string;
  sectionLabel: string;
  region: string;
  aliases: string[];
  tags: string[];
  summary: string;
  excerpt: string;
  sourcePath: string;
};

const ALIAS_EXPANSIONS: Record<string, string[]> = {
  gtps: ['greater trochanteric pain syndrome'],
  fais: ['femoroacetabular impingement syndrome', 'hip impingement'],
  oa: ['osteoarthritis'],
  aclr: ['anterior cruciate ligament reconstruction'],
  rcrsp: ['rotator cuff related shoulder pain'],
  tka: ['total knee arthroplasty'],
  tha: ['total hip arthroplasty'],
  tmj: ['temporomandibular joint disorder'],
  tmd: ['temporomandibular disorder'],
};

function expandedTerms(query: string): string[] {
  const base = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded = base.flatMap((term) => [term, ...(ALIAS_EXPANSIONS[term] || [])]);
  return [...new Set(expanded.map((term) => term.toLowerCase()))];
}

export function SearchClient({
  regions,
  sections,
  items,
}: {
  regions: { slug: string; name: string }[];
  sections: { slug: string; name: string }[];
  items: SearchItem[];
}) {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [region, setRegion] = useState(params.get('region') || '');
  const [section, setSection] = useState(params.get('section') || '');

  const results = useMemo(() => {
    const terms = expandedTerms(q);
    return items.filter((item) => {
      const regionMatch = !region || item.region.toLowerCase().replace(/\s+/g, '-') === region;
      const sectionMatch = !section || item.section === section;
      if (!regionMatch || !sectionMatch) return false;
      if (!terms.length) return true;

      const haystack = [item.title, item.aliases.join(' '), item.tags.join(' '), item.summary, item.excerpt]
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [items, q, region, section]);

  return (
    <>
      <h1>Search</h1>

      <form className="card" style={{ marginBottom: '1rem' }} role="search" aria-label="Clinical content search" onSubmit={(e) => e.preventDefault()}>
        <div className="grid two">
          <div>
            <label htmlFor="q">Keyword</label>
            <input id="q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label htmlFor="region">Body region</label>
            <select id="region" name="region" value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">All regions</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="section">Section</label>
            <select id="section" name="section" value={section} onChange={(e) => setSection(e.target.value)}>
              <option value="">All sections</option>
              {sections.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <p aria-live="polite">{results.length} result{results.length === 1 ? '' : 's'} found.</p>

      <ul className="clean grid" aria-label="Search results">
        {results.map((item) => (
          <li key={item.slug} className="card result-card">
            <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>
              <Link href={`/content/${item.slug}`}>{item.title}</Link>
            </h2>
            <p>{item.excerpt}</p>
            <p>
              <strong>Region:</strong> {item.region} · <strong>Section:</strong> {item.sectionLabel}
            </p>
            {item.tags.length > 0 && <p><strong>Tags:</strong> {item.tags.join(', ')}</p>}
            <p className="muted"><code>{item.sourcePath}</code></p>
            <FavoriteButton slug={item.slug} title={item.title} />
          </li>
        ))}
      </ul>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDeferredValue, useMemo, useState } from 'react';
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
  contentType: 'condition' | 'symptom-pattern' | 'body-region' | 'special-test' | 'treatment' | 'outcome-measure' | 'exercise-progression' | 'red-flag-topic' | 'general';
  phases: Array<'acute' | 'subacute' | 'chronic'>;
  population: 'sport' | 'general' | 'mixed';
  managementTrack: 'post-op' | 'non-op' | 'mixed';
};

const ALIAS_EXPANSIONS: Record<string, string[]> = {
  gtps: ['greater trochanteric pain syndrome'],
  fais: ['femoroacetabular impingement syndrome', 'hip impingement'],
  oa: ['osteoarthritis', 'degenerative joint disease'],
  aclr: ['anterior cruciate ligament reconstruction'],
  rcrsp: ['rotator cuff related shoulder pain', 'subacromial pain syndrome'],
  tka: ['total knee arthroplasty', 'total knee replacement'],
  tha: ['total hip arthroplasty', 'total hip replacement'],
  tmj: ['temporomandibular joint disorder'],
  tmd: ['temporomandibular disorder'],
  impingement: ['subacromial pain syndrome', 'painful arc', 'rotator cuff related shoulder pain'],
};

const QUICK_JUMPS: Array<{ match: RegExp; label: string; targetType?: SearchItem['contentType']; hint?: string }> = [
  { match: /hawkins|hawkins-kennedy/i, label: 'Jump to Hawkins-Kennedy special test', targetType: 'special-test' },
  { match: /cauda\s*equina/i, label: 'Jump to red flag referral topics', targetType: 'red-flag-topic' },
  { match: /ankle\s*sprain\s*timeline/i, label: 'Jump to lateral ankle sprain condition and timeline', targetType: 'condition' },
  { match: /patellofemoral.*progress/i, label: 'Jump to patellofemoral exercise progressions', targetType: 'exercise-progression' },
];

const CONTENT_TYPE_LABELS: Record<SearchItem['contentType'], string> = {
  condition: 'Condition',
  'symptom-pattern': 'Symptom / Pattern',
  'body-region': 'Body Region',
  'special-test': 'Special Test',
  treatment: 'Treatment',
  'outcome-measure': 'Outcome Measure',
  'exercise-progression': 'Exercise Progression',
  'red-flag-topic': 'Red Flag Topic',
  general: 'General',
};

function expandedTerms(query: string): string[] {
  const raw = query.toLowerCase().trim();
  if (!raw) return [];
  const base = raw.split(/\s+/).filter(Boolean);
  const expanded = base.flatMap((term) => [term, ...(ALIAS_EXPANSIONS[term] || [])]);
  const phraseExpansions = Object.entries(ALIAS_EXPANSIONS)
    .filter(([key]) => raw.includes(key))
    .flatMap(([, values]) => values);
  return [...new Set([...expanded, ...phraseExpansions].map((term) => term.toLowerCase()))];
}

function toRegionSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function tokenize(value: string): string[] {
  return value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function scoreItem(item: SearchItem, q: string, terms: string[], quickJumpType?: SearchItem['contentType']): number {
  if (!q.trim()) return 0;
  const query = q.toLowerCase().trim();
  const title = item.title.toLowerCase();
  const aliases = item.aliases.join(' ').toLowerCase();
  const tags = item.tags.join(' ').toLowerCase();
  const summary = `${item.summary} ${item.excerpt}`.toLowerCase();
  const tokens = new Set([...tokenize(title), ...tokenize(aliases), ...tokenize(tags), ...tokenize(summary)]);

  let score = 0;
  if (title === query) score += 120;
  if (title.includes(query)) score += 80;
  if (aliases.includes(query)) score += 65;
  if (tags.includes(query)) score += 35;

  for (const term of terms) {
    if (title.includes(term)) score += 22;
    if (aliases.includes(term)) score += 18;
    if (tags.includes(term)) score += 10;
    if (summary.includes(term)) score += 8;
    if (tokens.has(term)) score += 6;
  }

  if (query.includes('pain') && item.contentType === 'condition') score += 15;
  if (query.includes('test') && item.contentType === 'special-test') score += 25;
  if (query.includes('progress') && item.contentType === 'exercise-progression') score += 24;
  if (query.includes('red flag') && item.contentType === 'red-flag-topic') score += 28;
  if (quickJumpType && item.contentType === quickJumpType) score += 30;
  return score;
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
  const [contentType, setContentType] = useState('');
  const [phase, setPhase] = useState('');
  const [population, setPopulation] = useState('');
  const [managementTrack, setManagementTrack] = useState('');
  const deferredQuery = useDeferredValue(q);

  const quickJump = useMemo(() => QUICK_JUMPS.find((rule) => rule.match.test(deferredQuery)), [deferredQuery]);

  const groupedResults = useMemo(() => {
    const terms = expandedTerms(deferredQuery);
    const queryActive = !!deferredQuery.trim();
    const filtered = items
      .filter((item) => {
        const regionMatch = !region || toRegionSlug(item.region) === region;
        const sectionMatch = !section || item.section === section;
        const typeMatch = !contentType || item.contentType === contentType;
        const phaseMatch = !phase || item.phases.includes(phase as 'acute' | 'subacute' | 'chronic');
        const populationMatch = !population || item.population === population || item.population === 'mixed';
        const trackMatch = !managementTrack || item.managementTrack === managementTrack || item.managementTrack === 'mixed';
        if (!regionMatch || !sectionMatch || !typeMatch || !phaseMatch || !populationMatch || !trackMatch) return false;
        if (!queryActive) return true;

        const haystack = [item.title, item.aliases.join(' '), item.tags.join(' '), item.summary, item.excerpt].join(' ').toLowerCase();
        return terms.some((term) => haystack.includes(term)) || haystack.includes(deferredQuery.toLowerCase());
      })
      .map((item) => ({ item, score: scoreItem(item, deferredQuery, terms, quickJump?.targetType) }))
      .filter((result) => (!queryActive ? true : result.score >= 20))
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

    const grouped = new Map<SearchItem['contentType'], Array<typeof filtered[number]>>();
    for (const result of filtered) {
      const existing = grouped.get(result.item.contentType) || [];
      existing.push(result);
      grouped.set(result.item.contentType, existing);
    }

    return grouped;
  }, [items, deferredQuery, region, section, contentType, phase, population, managementTrack, quickJump]);

  const total = [...groupedResults.values()].reduce((count, group) => count + group.length, 0);
  const activeFilters = [q.trim(), region, section, contentType, phase, population, managementTrack].filter(Boolean).length;

  function clearFilters() {
    setQ('');
    setRegion('');
    setSection('');
    setContentType('');
    setPhase('');
    setPopulation('');
    setManagementTrack('');
  }

  return (
    <>
      <h1>Search</h1>

      <form className="card search-toolbar" role="search" aria-label="Clinical content search" onSubmit={(e) => e.preventDefault()}>
        <p className="muted" style={{ marginTop: 0 }}>
          Use 1-3 filters for high-signal results. Over-filtering can hide clinically useful alternatives.
        </p>
        <div className="filter-grid">
          <div>
            <label htmlFor="q">Clinical query</label>
            <input id="q" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. rotator cuff, lateral shoulder pain, Hawkins-Kennedy" />
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
          <div>
            <label htmlFor="content-type">Content type</label>
            <select id="content-type" value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="">All content types</option>
              {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="phase">Stage</label>
            <select id="phase" value={phase} onChange={(e) => setPhase(e.target.value)}>
              <option value="">Any stage</option>
              <option value="acute">Acute</option>
              <option value="subacute">Subacute</option>
              <option value="chronic">Chronic</option>
            </select>
          </div>
          <div>
            <label htmlFor="population">Population</label>
            <select id="population" value={population} onChange={(e) => setPopulation(e.target.value)}>
              <option value="">All populations</option>
              <option value="general">General</option>
              <option value="sport">Sport</option>
            </select>
          </div>
          <div>
            <label htmlFor="track">Management</label>
            <select id="track" value={managementTrack} onChange={(e) => setManagementTrack(e.target.value)}>
              <option value="">Post-op + Non-op</option>
              <option value="post-op">Post-op</option>
              <option value="non-op">Non-op</option>
            </select>
          </div>
        </div>
        <div className="search-toolbar__actions">
          <button type="button" onClick={clearFilters}>Clear all filters</button>
          <span className="muted" aria-live="polite">{activeFilters} active filter{activeFilters === 1 ? '' : 's'}</span>
        </div>
      </form>

      <p className="search-summary" aria-live="polite">{total} result{total === 1 ? '' : 's'} found.</p>

      {quickJump && total > 0 && (
        <section className="search-empty" aria-live="polite">
          <h2>{quickJump.label}</h2>
          <p className="muted">Top results are boosted to clinically relevant matches for this common query.</p>
        </section>
      )}

      {!q.trim() && !region && !section && !contentType && !phase && !population && !managementTrack && (
        <section className="search-empty" aria-live="polite">
          <h2>Start with a clinical entry point</h2>
          <p className="muted">Try: rotator cuff, lateral shoulder pain, Hawkins-Kennedy, ankle sprain timeline, patellofemoral progressions, or cauda equina red flags.</p>
        </section>
      )}

      {total === 0 && (q.trim() || region || section || contentType || phase || population || managementTrack) && (
        <section className="search-empty" aria-live="polite">
          <h2>No clinically relevant matches yet</h2>
          <p className="muted">Try a broader symptom pattern, remove a stage filter, or switch content type (e.g., condition ↔ special test).</p>
        </section>
      )}

      {[...groupedResults.entries()].map(([group, groupItems]) => (
        <section key={group} className="search-group">
          <h2>{CONTENT_TYPE_LABELS[group]} ({groupItems.length})</h2>
          <ul className="clean grid" aria-label={`${CONTENT_TYPE_LABELS[group]} search results`}>
            {groupItems.map(({ item }) => (
              <li key={item.slug} className="card result-card">
                <h3 className="result-title">
                  <Link href={`/content/${item.slug}`}>{item.title}</Link>
                </h3>
                <p>{item.excerpt}</p>
                <div className="search-result-meta">
                  <span className="meta-pill">{item.region}</span>
                  <span className="meta-pill">{item.sectionLabel}</span>
                  <span className="meta-pill">{CONTENT_TYPE_LABELS[item.contentType]}</span>
                  {item.phases.map((stage) => (
                    <span key={stage} className="meta-pill">{stage}</span>
                  ))}
                  {item.managementTrack !== 'mixed' && <span className="meta-pill">{item.managementTrack}</span>}
                </div>
                {item.tags.length > 0 && <p className="muted">Tags: {item.tags.slice(0, 5).join(' · ')}</p>}
                <p className="muted search-result-source"><code>{item.sourcePath}</code></p>
                <FavoriteButton slug={item.slug} title={item.title} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

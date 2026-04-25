import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { KbEntityLink } from '@/components/kb/KbEntityLink';

const CLINICAL_ENTRY_POINTS = [
  { title: 'Conditions', href: '/conditions', summary: 'Differential anchors, exam priorities, and first-line management.' },
  { title: 'Body Regions', href: '/body-regions', summary: 'Region-first access when symptoms are unclear at presentation.' },
  { title: 'Special Tests', href: '/special-tests', summary: 'Purpose, interpretation, and clinical utility for test selection.' },
  { title: 'Treatments', href: '/treatments', summary: 'Practical intervention options with progression logic.' },
  { title: 'Exercise Progressions', href: '/exercise-progressions', summary: 'Exercise dosage and staged progressions for rehab planning.' },
  { title: 'Outcome Measures', href: '/outcome-measures', summary: 'Track baseline status and response to treatment over time.' },
  { title: 'Red Flags / Referral', href: '/red-flags-referral', summary: 'Escalation signals and referral pathways at point of care.' },
] as const;

const COMMON_BODY_REGIONS = [
  { label: 'Low Back', href: '/body-regions#lumbar-spine' },
  { label: 'Shoulder', href: '/body-regions#shoulder' },
  { label: 'Knee', href: '/body-regions#knee' },
  { label: 'Neck / Cervical', href: '/body-regions#cervical-spine' },
  { label: 'Hip', href: '/body-regions#hip' },
  { label: 'Ankle / Foot', href: '/body-regions#ankle-foot' },
] as const;

const CLINICAL_LOOKUPS = [
  { label: 'During assessment', items: ['Screen red flags quickly', 'Choose high-yield special tests', 'Check likely regional differentials'] },
  { label: 'During follow-up', items: ['Progress exercise dosage', 'Re-check objective outcomes', 'Adjust treatment plan quickly'] },
  { label: 'For study / prep', items: ['Review evidence library', 'Compare test interpretation details', 'Refresh condition management pathways'] },
] as const;

const COMMON_CONDITIONS_BY_REGION = [
  { region: 'Shoulder', conditions: ['Rotator cuff related shoulder pain', 'Adhesive capsulitis', 'Shoulder instability'] },
  { region: 'Knee', conditions: ['Patellofemoral pain', 'ACL injury / post-op', 'Knee osteoarthritis'] },
  { region: 'Lumbar', conditions: ['Nonspecific low back pain', 'Lumbar radicular pain', 'Lumbar stenosis'] },
] as const;

export default function HomePage() {
  return (
    <div className="section-stack">
      <section className="hero-search card" aria-labelledby="home-title">
        <h1 id="home-title">What do you need to look up?</h1>
        <p className="muted">Search is the fastest path. Use quick entry points below when you already know your clinical direction.</p>
        <SearchForm
          className="home-search"
          ariaLabel="Homepage clinical search"
          inputId="home-search-input"
          label="Search clinical knowledge base"
          placeholder="Search condition, test, region, treatment, outcome measure…"
        />
      </section>

      <section aria-labelledby="entry-points-title">
        <h2 id="entry-points-title">Common clinical entry points</h2>
        <div className="grid three">
          {CLINICAL_ENTRY_POINTS.map((item) => (
            <Link key={item.href} href={item.href} className="card link-card quick-card">
              <h3>{item.title}</h3>
              <p className="muted">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid two" aria-label="Homepage modules">
        <article className="card">
          <h2>Common body regions</h2>
          <ul className="clean quick-list">
            {COMMON_BODY_REGIONS.map((region) => (
              <li key={region.label}>
                <Link href={region.href}>{region.label}</Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Common clinical lookups</h2>
          <div className="lookup-stacks">
            {CLINICAL_LOOKUPS.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="grid two" aria-label="Condition and activity modules">
        <article className="card">
          <h2>Common conditions by region</h2>
          {COMMON_CONDITIONS_BY_REGION.map((group) => (
            <section key={group.region} className="condition-group">
              <h3>{group.region}</h3>
              <ul>
                {group.conditions.map((condition) => <li key={condition}><KbEntityLink label={condition} /></li>)}
              </ul>
            </section>
          ))}
        </article>

        <article className="card">
          <h2>Recently viewed / pinned</h2>
          <div className="empty-state" role="status" aria-live="polite">
            <p>No saved items yet.</p>
            <p className="muted">Pin frequently used pages from search results to keep high-value references one tap away.</p>
            <Link href={{ pathname: '/search' }}>Go to search</Link>
          </div>
        </article>
      </section>
    </div>
  );
}

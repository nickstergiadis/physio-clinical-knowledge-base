import Link from 'next/link';

const TOP_LEVEL_NAV = [
  { href: '/conditions', label: 'Conditions' },
  { href: '/body-regions', label: 'Body Regions' },
  { href: '/special-tests', label: 'Special Tests' },
  { href: '/treatments', label: 'Treatments' },
  { href: '/exercise-progressions', label: 'Exercise Progressions' },
  { href: '/outcome-measures', label: 'Outcome Measures' },
  { href: '/red-flags-referral', label: 'Red Flags / Referral' },
  { href: '/evidence-library', label: 'Evidence Library' },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header no-print">
      <div className="site-header__inner">
        <div className="site-branding">
          <Link href="/" className="site-title">Physio Clinical KB</Link>
          <p className="site-tagline">Clinical lookup tool for rapid point-of-care decisions.</p>
        </div>

        <form action="/search" role="search" className="site-search" aria-label="Search clinical content">
          <label htmlFor="site-search-input" className="sr-only">Search conditions, tests, treatments, and outcomes</label>
          <input
            id="site-search-input"
            name="q"
            type="search"
            placeholder="Search condition, body region, test, treatment…"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <nav aria-label="Primary" className="top-nav">
        <ul className="top-nav__list">
          {TOP_LEVEL_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export { TOP_LEVEL_NAV };

import Link from 'next/link';
import { TOP_LEVEL_NAV } from '@/components/SiteHeader';

const workflowUses = ['Assessment', 'Follow-up', 'Study / review'];

const quickAccess = [
  {
    title: 'Common condition lookup',
    description: 'Start with likely differential, key exam priorities, and first-line management pointers.',
    href: '/conditions',
  },
  {
    title: 'Special test selection',
    description: 'Quickly verify purpose, interpretation, and when each test is clinically useful.',
    href: '/special-tests',
  },
  {
    title: 'Treatment planning',
    description: 'Check practical treatment options and progression logic before or during follow-up visits.',
    href: '/treatments',
  },
] as const;

export default function HomePage() {
  return (
    <>
      <header>
        <h1>Clinical Physiotherapy Knowledge Base</h1>
        <p>
          A lean, evidence-based clinical reference built for fast point-of-care lookup.
          Use it during consults for quick decisions, then switch to deeper review for prep and study.
        </p>
      </header>

      <section className="card" aria-labelledby="value-title" style={{ marginBottom: '1rem' }}>
        <h2 id="value-title">Built for real clinical workflow</h2>
        <ul>
          <li>Fast evidence-based lookup for conditions, tests, treatments, and progressions.</li>
          <li>Two-mode clinical pages: <strong>Quick View</strong> (one-screen summary) and <strong>Deep View</strong> (expandable detail).</li>
          <li>Useful across {workflowUses.join(', ')}.</li>
        </ul>
      </section>

      <section className="card" aria-labelledby="ia-title" style={{ marginBottom: '1rem' }}>
        <h2 id="ia-title">Information architecture</h2>
        <p className="muted">Minimal top-level navigation focused on clinical decisions and evidence.</p>
        <div className="grid two">
          {TOP_LEVEL_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="card link-card">
              <h3>{item.label}</h3>
              <p className="muted">Open {item.label.toLowerCase()} index</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid two" aria-label="Quick access modules">
        {quickAccess.map((item) => (
          <article key={item.title} className="card">
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link href={item.href}>Open {item.title.toLowerCase()} →</Link>
          </article>
        ))}
      </section>
    </>
  );
}

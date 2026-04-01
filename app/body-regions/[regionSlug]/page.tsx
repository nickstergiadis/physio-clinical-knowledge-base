import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BODY_REGION_HUBS, getBodyRegionHubBySlug } from '@/lib/bodyRegionHubs';

type RegionPageProps = {
  params: Promise<{ regionSlug: string }>;
  searchParams: Promise<{ mode?: string }>;
};

const SECTION_DEFINITIONS = [
  { key: 'commonConditions', label: 'Common conditions' },
  { key: 'highYieldSpecialTests', label: 'High-yield special tests' },
  { key: 'commonDifferentials', label: 'Common differentials' },
  { key: 'commonTreatments', label: 'Common treatments' },
  { key: 'exerciseProgressionCategories', label: 'Exercise progression categories' },
  { key: 'keyRedFlags', label: 'Key red flags' },
  { key: 'relevantOutcomeMeasures', label: 'Relevant outcome measures' },
] as const;

export function generateStaticParams() {
  return BODY_REGION_HUBS.map((hub) => ({ regionSlug: hub.slug }));
}

export default async function BodyRegionHubDetailPage({ params, searchParams }: RegionPageProps) {
  const { regionSlug } = await params;
  const { mode } = await searchParams;
  const isStudyMode = mode === 'study';

  const hub = getBodyRegionHubBySlug(regionSlug);
  if (!hub) return notFound();

  return (
    <article className="grid">
      <header className="card">
        <p className="eyebrow">Body Region Hub</p>
        <h1>{hub.name}</h1>
        <p className="muted">
          Default view stays point-of-care focused. Study Mode is intentionally lightweight for quick structured review.
        </p>
        <div className="mode-toggle" role="navigation" aria-label="View mode">
          <Link className={!isStudyMode ? 'active' : ''} href={`/body-regions/${hub.slug}`}>Clinical View</Link>
          <Link className={isStudyMode ? 'active' : ''} href={`/body-regions/${hub.slug}?mode=study`}>Study Mode</Link>
        </div>
      </header>

      {isStudyMode ? (
        <>
          <section className="card">
            <h2>High-yield summary</h2>
            <ul>
              {hub.highYieldSummary.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section className="grid two" aria-label="Self-test recall cards">
            {hub.recallCards.map((card) => (
              <details key={card.prompt} className="card recall-card">
                <summary>{card.prompt}</summary>
                <p>{card.answer}</p>
              </details>
            ))}
          </section>
        </>
      ) : null}

      <section className="grid two">
        {SECTION_DEFINITIONS.map((section) => (
          <section key={section.key} className="card">
            <h2>{section.label}</h2>
            <ul>
              {hub[section.key].map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </article>
  );
}

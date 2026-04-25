'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useSearchParams } from 'next/navigation';
import type { BodyRegionHub } from '@/lib/bodyRegionHubs';
import { KbEntityLink } from '@/components/kb/KbEntityLink';

const SECTION_DEFINITIONS = [
  { key: 'commonConditions', label: 'Common conditions' },
  { key: 'highYieldSpecialTests', label: 'High-yield special tests' },
  { key: 'commonDifferentials', label: 'Common differentials' },
  { key: 'commonTreatments', label: 'Common treatments' },
  { key: 'exerciseProgressionCategories', label: 'Exercise progression categories' },
  { key: 'keyRedFlags', label: 'Key red flags' },
  { key: 'relevantOutcomeMeasures', label: 'Relevant outcome measures' },
] as const satisfies ReadonlyArray<{ key: keyof BodyRegionHub; label: string }>;

type BodyRegionHubDetailClientProps = {
  hub: BodyRegionHub;
};

export function BodyRegionHubDetailClient({ hub }: BodyRegionHubDetailClientProps) {
  const searchParams = useSearchParams();
  const isStudyMode = searchParams.get('mode') === 'study';

  return (
    <>
      <header className="card">
        <p className="eyebrow">Body Region Hub</p>
        <h1>{hub.name}</h1>
        <p className="muted">
          Default view stays point-of-care focused. Study Mode is intentionally lightweight for quick structured review.
        </p>
        <div className="hub-card-actions">
          <div className="mode-toggle" role="navigation" aria-label="View mode">
            <Link className={!isStudyMode ? 'active' : ''} href={`/body-regions/${hub.slug}` as Route}>Clinical View</Link>
            <Link className={isStudyMode ? 'active' : ''} href={`/body-regions/${hub.slug}?mode=study` as Route}>Study Mode</Link>
          </div>
          {hub.referralPageHref ? <Link href={hub.referralPageHref as Route}>Red flags / referral pathway</Link> : null}
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
                {card.relatedEntities?.length ? (
                  <ul className="clean quick-list">
                    {card.relatedEntities.map((entity) => (
                      <li key={entity}>
                        <KbEntityLink label={entity} />
                      </li>
                    ))}
                  </ul>
                ) : null}
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
                <li key={entry}><KbEntityLink label={entry} /></li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </>
  );
}

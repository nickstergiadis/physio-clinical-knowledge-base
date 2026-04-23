'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { KbItem } from '@/lib/kb';
import type { ConditionPageSchema } from '@/lib/conditionPage';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ConditionStageCards } from '@/components/clinical/ConditionStageCards';
import { EditorialWarning } from '@/components/evidence/EditorialWarning';
import { KbEntityLink } from '@/components/kb/KbEntityLink';
import type { getStageReasoningCardsForConditionSlug } from '@/lib/clinicalModules';

type RelatedItem = { slug: string; title: string };

export function ConditionPageShell({
  item,
  schema,
  related,
  stageReasoning,
}: {
  item: KbItem;
  schema: ConditionPageSchema;
  related: {
    assessments: RelatedItem[];
    frameworks: RelatedItem[];
    evidence: RelatedItem[];
    postop: RelatedItem[];
  };
  stageReasoning: ReturnType<typeof getStageReasoningCardsForConditionSlug>;
}) {
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');

  const navItems = useMemo(
    () =>
      mode === 'quick'
        ? [
            ['clinical-snapshot', 'Definition / clinical framing'],
            ['typical-pattern', 'Common presentation'],
            ['key-differentials', 'Key differentials'],
            ['exam-priorities', 'Exam priorities'],
            ['special-tests', 'High-yield tests / interpretation'],
            ['first-line-treatment', 'First-line management'],
            ['stage-based-rehab', 'Stage-based rehab'],
            ['healing-timeline', 'Prognosis / timeline snapshot'],
            ['red-flags', 'Red flags / reconsider'],
          ]
        : schema.deepView.map((block) => [block.id, block.title]),
    [mode, schema.deepView],
  );

  return (
    <article className="condition-layout">
      <header className="card condition-header">
        <p className="eyebrow">Condition · {item.region}</p>
        <h1>{item.title}</h1>
        <p className="muted">{item.summary}</p>
        <div className="condition-header__meta">
          <FavoriteButton href={`/content/${item.slug}`} title={item.title} />
          <span className={clsx('evidence-badge', `strength-${schema.evidenceStrength.toLowerCase()}`)}>
            Evidence: {schema.evidenceStrength}
          </span>
        </div>
        {item.citations.length === 0 && (
          <EditorialWarning message="This condition page is not citation-complete yet. Add references before treating it as final." />
        )}
        <EditorialWarning message="Clinical support tool only: not a standalone diagnosis or prognosis. Pair with patient-specific reassessment and local referral protocols." />
        {schema.certaintyWarnings.length > 0 && (
          <EditorialWarning message={schema.certaintyWarnings.join(' ')} />
        )}
        {(!schema.stageCompleteness.hasAcute || !schema.stageCompleteness.hasSubacute || !schema.stageCompleteness.hasLate) && (
          <EditorialWarning message="Stage-based rehab content is incomplete for at least one phase. Use this page with caution and progress by objective response." />
        )}
        <div className="view-toggle" role="tablist" aria-label="Condition view mode">
          <button role="tab" aria-selected={mode === 'quick'} onClick={() => setMode('quick')}>
            Quick View
          </button>
          <button role="tab" aria-selected={mode === 'deep'} onClick={() => setMode('deep')}>
            Deep View
          </button>
        </div>
      </header>

      <div className="condition-content-grid">
        <aside className="card section-nav" aria-label="In-page section navigation">
          <h2>On this page</h2>
          <ul className="clean">
            {navItems.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ul>
          <hr />
          <p className="muted" style={{ marginBottom: '0.45rem' }}>Safety routes</p>
          <ul className="clean">
            <li><Link href="/red-flags-referral">Red flags / referral hub</Link></li>
            <li><a href="#red-flags">This page: red flags section</a></li>
          </ul>
        </aside>

        <section className="condition-main">
          {mode === 'quick' ? <QuickView schema={schema} /> : <DeepView schema={schema} item={item} />}
          {stageReasoning && (
            <ConditionStageCards
              conditionTitle={stageReasoning.conditionTitle}
              treatmentCards={stageReasoning.treatmentCards}
              progressionCards={stageReasoning.progressionCards}
            />
          )}

          <details className="card reference-drawer" open>
            <summary>References / linked evidence ({item.citations.length})</summary>
            <p className="muted">Prioritize primary sources and publication recency before applying recommendations.</p>
            <ul>
              {item.citations.map((citation) => (
                <li key={`${citation.label}-${citation.url || 'none'}`}>
                  {citation.url ? <a href={citation.url}>{citation.label}</a> : citation.label}
                  {!citation.url ? <span className="muted"> · URL not provided</span> : null}
                </li>
              ))}
            </ul>
            <RelatedLinks related={related} />
          </details>
        </section>
      </div>
    </article>
  );
}

function QuickView({ schema }: { schema: ConditionPageSchema }) {
  const q = schema.quickView;
  return (
    <div className="quick-view-grid">
      <Card id="clinical-snapshot" title="Definition / clinical framing" items={q.clinicalSnapshot} />
      <Card id="typical-pattern" title="Common presentation" items={q.typicalPattern} />
      <Card id="key-differentials" title="Key differentials" items={q.keyDifferentials} />
      <Card id="exam-priorities" title="Exam priorities" items={q.examPriorities} />
      <Card id="special-tests" title="High-yield tests and interpretation" items={q.specialTests} />
      <Card id="first-line-treatment" title="First-line management" items={q.firstLineTreatment} />
      <section className="card" id="stage-based-rehab">
        <h2>Stage-based rehab summary</h2>
        <div className="timeline">
          {q.stageBasedRehab.map((stage) => (
            <section key={stage.stage} className="timeline-stage">
              <h3>{stage.stage}</h3>
              <ul>{stage.focus.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          ))}
        </div>
      </section>
      <Card id="healing-timeline" title="Prognosis / timeline snapshot" items={q.healingTimeline} />
      <Card id="red-flags" title="Red flags / when to reconsider" items={q.redFlags} />
      <section className="card">
        <h2>Referral pathway reminder</h2>
        <p>
          If progressive neurologic deficit, systemic red flags, or disproportionate symptoms are present,
          use the <Link href="/red-flags-referral">red flags / referral pathway</Link> immediately.
        </p>
      </section>
    </div>
  );
}

function DeepView({ schema, item }: { schema: ConditionPageSchema; item: KbItem }) {
  return (
    <div className="deep-view-stack">
      {schema.deepView.map((block) => (
        <Card key={block.id} id={block.id} title={block.title} items={block.items} />
      ))}
      {schema.residualMarkdown && (
        <section className="card" id="additional-notes">
          <h2>Additional notes</h2>
          <p className="muted">Source: <code>{item.sourcePath}</code></p>
        </section>
      )}
    </div>
  );
}

function Card({ id, title, items }: { id: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="card" id={id}>
      <h2>{title}</h2>
      <ul>
        {items.map((entry) => (
          <li key={entry}><KbEntityLink label={entry} /></li>
        ))}
      </ul>
    </section>
  );
}

function RelatedLinks({ related }: { related: ConditionPageShellProps['related'] }) {
  const sections = [
    ['Assessment tools', related.assessments],
    ['Exercise progressions', related.frameworks],
    ['Evidence updates', related.evidence],
    ['Post-op annexes', related.postop],
  ] as const;

  return (
    <div className="related-links-grid">
      {sections.map(([title, items]) =>
        items.length > 0 ? (
          <section key={title}>
            <h3>{title}</h3>
            <ul>
              {items.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/content/${entry.slug}`}>{entry.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  );
}

type ConditionPageShellProps = Parameters<typeof ConditionPageShell>[0];

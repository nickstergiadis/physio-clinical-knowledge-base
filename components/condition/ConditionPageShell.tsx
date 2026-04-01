'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { KbItem } from '@/lib/kb';
import type { ConditionPageSchema } from '@/lib/conditionPage';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ConditionStageCards } from '@/components/clinical/ConditionStageCards';
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
            ['clinical-snapshot', 'Clinical snapshot'],
            ['typical-pattern', 'Typical pattern'],
            ['key-differentials', 'Key differentials'],
            ['exam-priorities', 'Top exam priorities'],
            ['special-tests', 'Most useful special tests'],
            ['first-line-treatment', 'First-line treatment'],
            ['stage-based-rehab', 'Stage-based rehab'],
            ['healing-timeline', 'Healing / recovery timeline'],
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
          <FavoriteButton slug={item.slug} title={item.title} />
          <span className={clsx('evidence-badge', `strength-${schema.evidenceStrength.toLowerCase()}`)}>
            Evidence: {schema.evidenceStrength}
          </span>
        </div>
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
            <summary>References / linked evidence</summary>
            <ul>
              {item.citations.map((citation) => (
                <li key={`${citation.label}-${citation.url || 'none'}`}>
                  {citation.url ? <a href={citation.url}>{citation.label}</a> : citation.label}
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
      <Card id="clinical-snapshot" title="Clinical snapshot" items={q.clinicalSnapshot} />
      <Card id="typical-pattern" title="Typical pattern" items={q.typicalPattern} />
      <Card id="key-differentials" title="Key differentials" items={q.keyDifferentials} />
      <Card id="exam-priorities" title="Top exam priorities" items={q.examPriorities} />
      <Card id="special-tests" title="Most useful special tests" items={q.specialTests} />
      <Card id="first-line-treatment" title="First-line treatment approach" items={q.firstLineTreatment} />
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
      <Card id="healing-timeline" title="Healing / recovery timeline" items={q.healingTimeline} />
      <Card id="red-flags" title="Red flags / when to reconsider" items={q.redFlags} />
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
          <li key={entry}>{entry}</li>
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

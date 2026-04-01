'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ConditionStage } from '@/lib/clinicalContentModel';
import type { TreatmentWithContext } from '@/lib/clinicalModules';
import { StageBadge } from '@/components/clinical/StageBadge';

export function TreatmentsLibrary({
  treatments,
  regions,
  conditions,
}: {
  treatments: TreatmentWithContext[];
  regions: Array<{ id: string; name: string }>;
  conditions: Array<{ id: string; title: string }>;
}) {
  const [region, setRegion] = useState('all');
  const [condition, setCondition] = useState('all');
  const [stage, setStage] = useState<'all' | ConditionStage>('all');

  const filtered = useMemo(
    () =>
      treatments.filter((item) => {
        const regionOk = region === 'all' || item.bodyRegionIds.includes(region);
        const conditionOk = condition === 'all' || item.relatedConditions.some((entry) => entry.id === condition);
        const stageOk = stage === 'all' || item.stageRelevance.includes(stage);
        return regionOk && conditionOk && stageOk;
      }),
    [condition, region, stage, treatments],
  );

  return (
    <section className="grid" aria-label="Treatments library with clinical filters">
      <article className="card filter-grid">
        <label>Body region<select value={region} onChange={(e) => setRegion(e.target.value)}><option value="all">All regions</option>{regions.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
        <label>Condition<select value={condition} onChange={(e) => setCondition(e.target.value)}><option value="all">All conditions</option>{conditions.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
        <label>Rehab stage<select value={stage} onChange={(e) => setStage(e.target.value as 'all' | ConditionStage)}><option value="all">All stages</option><option value="acute-irritable">Acute / irritable</option><option value="subacute">Subacute</option><option value="chronic">Chronic / persistent</option><option value="post-op-early">Post-op early</option><option value="post-op-late">Post-op late</option><option value="return-to-sport">Return to sport</option></select></label>
      </article>

      {filtered.map((item) => (
        <article className="card" key={item.id}>
          <h2><Link href={`/treatments/${item.id}`}>{item.title}</Link></h2>
          <p className="muted">{item.whatItIs}</p>
          <p><strong>Useful when:</strong> {item.whenToUse[0]}</p>
          <div className="badge-row">{item.stageRelevance.map((entry) => <StageBadge key={`${item.id}-${entry}`} stage={entry} />)}</div>
        </article>
      ))}
    </section>
  );
}

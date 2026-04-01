'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ConditionStage } from '@/lib/clinicalContentModel';
import type { ExerciseProgressionWithContext } from '@/lib/clinicalModules';
import { StageBadge } from '@/components/clinical/StageBadge';

export function ExerciseProgressionsLibrary({
  progressions,
  regions,
  conditions,
}: {
  progressions: ExerciseProgressionWithContext[];
  regions: Array<{ id: string; name: string }>;
  conditions: Array<{ id: string; title: string }>;
}) {
  const [region, setRegion] = useState('all');
  const [condition, setCondition] = useState('all');
  const [stage, setStage] = useState<'all' | ConditionStage>('all');

  const filtered = useMemo(
    () =>
      progressions.filter((item) => {
        const regionOk = region === 'all' || item.bodyRegionIds.includes(region);
        const conditionOk = condition === 'all' || item.targetConditions.some((entry) => entry.id === condition);
        const stageOk = stage === 'all' || item.stage === stage;
        return regionOk && conditionOk && stageOk;
      }),
    [condition, progressions, region, stage],
  );

  return (
    <section className="grid" aria-label="Exercise progression library with stage filtering">
      <article className="card filter-grid">
        <label>Body region<select value={region} onChange={(e) => setRegion(e.target.value)}><option value="all">All regions</option>{regions.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
        <label>Condition<select value={condition} onChange={(e) => setCondition(e.target.value)}><option value="all">All conditions</option>{conditions.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>
        <label>Rehab stage<select value={stage} onChange={(e) => setStage(e.target.value as 'all' | ConditionStage)}><option value="all">All stages</option><option value="acute-irritable">Acute / irritable</option><option value="subacute">Subacute</option><option value="chronic">Chronic / persistent</option><option value="post-op-early">Post-op early</option><option value="post-op-late">Post-op late</option><option value="return-to-sport">Return to sport</option></select></label>
      </article>

      {filtered.map((item) => (
        <article className="card" key={item.id}>
          <h2><Link href={`/exercise-progressions/${item.id}`}>{item.title}</Link></h2>
          <p className="muted">{item.targetTissuesFunctions.join(' · ')}</p>
          <div className="badge-row"><StageBadge stage={item.stage} /></div>
          <p><strong>Criteria to advance:</strong> {item.criteriaToAdvance[0]}</p>
        </article>
      ))}
    </section>
  );
}

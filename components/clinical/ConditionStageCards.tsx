import Link from 'next/link';
import type { ExerciseProgressionWithContext, TreatmentWithContext } from '@/lib/clinicalModules';
import { StageBadge } from '@/components/clinical/StageBadge';

export function ConditionStageCards({
  conditionTitle,
  treatmentCards,
  progressionCards,
}: {
  conditionTitle: string;
  treatmentCards: TreatmentWithContext[];
  progressionCards: ExerciseProgressionWithContext[];
}) {
  if (!treatmentCards.length && !progressionCards.length) return null;

  return (
    <section className="card" aria-label="Stage-based clinical reasoning cards">
      <h2>Stage-based progression guidance</h2>
      <p className="muted">Linked from the treatment and exercise progression libraries for {conditionTitle}.</p>
      <div className="grid two">
        {treatmentCards.map((item) => (
          <article className="card" key={item.id}>
            <h3><Link href={`/treatments/${item.id}`}>{item.title}</Link></h3>
            <div className="badge-row">{item.stageRelevance.map((stage) => <StageBadge key={`${item.id}-${stage}`} stage={stage} />)}</div>
            <p><strong>Indications:</strong> {item.indications[0]}</p>
          </article>
        ))}
        {progressionCards.map((item) => (
          <article className="card" key={item.id}>
            <h3><Link href={`/exercise-progressions/${item.id}`}>{item.title}</Link></h3>
            <div className="badge-row"><StageBadge stage={item.stage} /></div>
            <p><strong>Progress next when:</strong> {item.criteriaToAdvance[0]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

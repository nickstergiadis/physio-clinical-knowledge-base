import { notFound } from 'next/navigation';
import { StageBadge } from '@/components/clinical/StageBadge';
import { CitationList } from '@/components/evidence/CitationList';
import { EditorialWarning } from '@/components/evidence/EditorialWarning';
import { EvidenceSummaryCard } from '@/components/evidence/EvidenceSummaryCard';
import { KbEntityLink } from '@/components/kb/KbEntityLink';
import { buildEvidenceProfile } from '@/lib/clinicalEvidence';
import { getExerciseProgressionsWithContext } from '@/lib/clinicalModules';

export function generateStaticParams() {
  return getExerciseProgressionsWithContext().map((progression) => ({ progressionId: progression.id }));
}

export default async function ExerciseProgressionDetailPage({ params }: { params: Promise<{ progressionId: string }> }) {
  const { progressionId } = await params;
  const progression = getExerciseProgressionsWithContext().find((entry) => entry.id === progressionId);
  if (!progression) return notFound();

  const evidenceProfile = buildEvidenceProfile(progression.referenceIds);

  return (
    <article className="grid">
      <header className="card">
        <p className="eyebrow">Exercise progression</p>
        <h1>{progression.title}</h1>
        <p className="muted">Target: {progression.targetTissuesFunctions.join(' · ')}</p>
        <StageBadge stage={progression.stage} />
      </header>

      <EditorialWarning message={evidenceProfile.editorialWarning} />
      <EvidenceSummaryCard profile={evidenceProfile} lastReviewedIso={progression.lastReviewed?.reviewedAtIso} />

      <section className="grid two">
        <section className="card"><h2>Target condition(s)</h2><ul>{progression.targetConditions.map((condition) => <li key={condition.id}><KbEntityLink label={condition.title} /></li>)}</ul></section>
        <section className="card"><h2>Example dosage</h2><ul>{progression.dosageSuggestions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Progression options</h2><ul>{progression.progressionOptions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Regression options</h2><ul>{progression.regressionOptions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Common compensations</h2><ul>{progression.commonCompensations.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Criteria to advance</h2><ul>{progression.criteriaToAdvance.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
      </section>

      <section className="card"><h2>Return-to-function relevance</h2><p>{progression.returnToFunctionRelevance}</p></section>
      <section className="card"><h2>Evidence summary narrative</h2><p>{progression.evidenceNotes}</p></section>
      <CitationList references={evidenceProfile.references} title="References / linked evidence" />
    </article>
  );
}

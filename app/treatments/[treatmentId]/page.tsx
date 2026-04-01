import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StageBadge } from '@/components/clinical/StageBadge';
import { CitationList } from '@/components/evidence/CitationList';
import { EditorialWarning } from '@/components/evidence/EditorialWarning';
import { EvidenceStrengthTags } from '@/components/evidence/EvidenceStrengthTags';
import { EvidenceSummaryCard } from '@/components/evidence/EvidenceSummaryCard';
import { buildEvidenceProfile } from '@/lib/clinicalEvidence';
import { getTreatmentsWithContext } from '@/lib/clinicalModules';

export function generateStaticParams() {
  return getTreatmentsWithContext().map((treatment) => ({ treatmentId: treatment.id }));
}

export default async function TreatmentDetailPage({ params }: { params: Promise<{ treatmentId: string }> }) {
  const { treatmentId } = await params;
  const treatment = getTreatmentsWithContext().find((entry) => entry.id === treatmentId);
  if (!treatment) return notFound();

  const evidenceProfile = buildEvidenceProfile(treatment.referenceIds);

  return (
    <article className="grid">
      <header className="card">
        <p className="eyebrow">Treatment</p>
        <h1>{treatment.title}</h1>
        <p className="muted">{treatment.whatItIs}</p>
        <div className="badge-row">{treatment.stageRelevance.map((stage) => <StageBadge key={stage} stage={stage} />)}</div>
        <EvidenceStrengthTags tags={evidenceProfile.strongestLevel === 'clinical-practice-guideline' ? ['high'] : ['moderate']} />
      </header>
      <EditorialWarning message={evidenceProfile.editorialWarning} />
      <EvidenceSummaryCard profile={evidenceProfile} lastReviewedIso={treatment.lastReviewed?.reviewedAtIso} />
      <section className="grid two">
        <section className="card"><h2>When it is useful</h2><ul>{treatment.whenToUse.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Key indications</h2><ul>{treatment.indications.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Precautions / contraindications</h2><ul>{treatment.contraindicationsPrecautions.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Practical notes</h2><ul>{treatment.practicalNotes.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
      </section>
      <section className="card"><h2>Evidence summary narrative</h2><p>{treatment.evidenceSummary}</p></section>
      <CitationList references={evidenceProfile.references} title="References / linked evidence" />
      <section className="card">
        <h2>Related conditions</h2>
        <ul>
          {treatment.relatedConditions.map((condition) => (
            <li key={condition.id}>{condition.slug ? <Link href={`/content/${condition.slug}`}>{condition.title}</Link> : condition.title}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

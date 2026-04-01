import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CitationList } from '@/components/evidence/CitationList';
import { EditorialWarning } from '@/components/evidence/EditorialWarning';
import { EvidenceSummaryCard } from '@/components/evidence/EvidenceSummaryCard';
import { buildEvidenceProfile } from '@/lib/clinicalEvidence';
import { getOutcomeMeasureById, getOutcomeMeasures } from '@/lib/outcomeMeasures';

export function generateStaticParams() {
  return getOutcomeMeasures().map((measure) => ({ measureId: measure.id }));
}

export default async function OutcomeMeasureDetailPage({ params }: { params: Promise<{ measureId: string }> }) {
  const { measureId } = await params;
  const measure = getOutcomeMeasureById(measureId);
  if (!measure) return notFound();

  const evidenceProfile = buildEvidenceProfile(measure.referenceIds);

  return (
    <article className="grid">
      <header className="card">
        <p><Link href="/outcome-measures">← Back to outcome measures</Link></p>
        <h1>{measure.title}</h1>
        <p className="muted">{measure.population}</p>
      </header>

      <EditorialWarning message={evidenceProfile.editorialWarning} />
      <EvidenceSummaryCard profile={evidenceProfile} lastReviewedIso={measure.lastReviewed?.reviewedAtIso} />

      <section className="grid two">
        <section className="card"><h2>Administration</h2><ul>{measure.administration.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Scoring</h2><ul>{measure.scoring.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>MCID / MDC</h2><ul>{measure.mcidMdc.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
        <section className="card"><h2>Interpretation</h2><ul>{measure.interpretation.map((entry) => <li key={entry}>{entry}</li>)}</ul></section>
      </section>

      <section className="card">
        <h2>Condition relevance</h2>
        <ul>
          {measure.relatedConditions.map((condition) => (
            <li key={condition.id}>{condition.title}</li>
          ))}
        </ul>
      </section>

      <CitationList references={evidenceProfile.references} title="References / linked evidence" />
    </article>
  );
}

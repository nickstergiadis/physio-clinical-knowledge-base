import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CitationList } from '@/components/evidence/CitationList';
import { EditorialWarning } from '@/components/evidence/EditorialWarning';
import { EvidenceSummaryCard } from '@/components/evidence/EvidenceSummaryCard';
import { buildEvidenceProfile } from '@/lib/clinicalEvidence';
import { getSpecialTestById, getSpecialTests } from '@/lib/specialTests';

export function generateStaticParams() {
  return getSpecialTests().map((test) => ({ testId: test.id }));
}

export default async function SpecialTestDetailPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getSpecialTestById(testId);
  if (!test) return notFound();

  const evidenceProfile = buildEvidenceProfile(test.referenceIds);

  return (
    <article className="grid">
      <header className="card">
        <p><Link href="/special-tests">← Back to special tests library</Link></p>
        <h1>{test.title}</h1>
        <p className="muted"><strong>Region:</strong> {test.bodyRegionName}</p>
        <p><strong>What question does this help answer?</strong> {test.testPurpose}</p>
      </header>

      <EditorialWarning message={evidenceProfile.editorialWarning} />
      <EvidenceSummaryCard profile={evidenceProfile} lastReviewedIso={test.lastReviewed?.reviewedAtIso} />

      <section className="grid two">
        <article className="card">
          <h2>How to perform</h2>
          <p><strong>Patient position:</strong> {test.patientPosition}</p>
          <ol>
            {test.clinicianAction.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="card">
          <h2>Interpretation at point of care</h2>
          <p><strong>Positive finding:</strong> {test.positiveFinding}</p>
          <p><strong>Interpretation:</strong> {test.interpretation}</p>
          <h3>Limitations</h3>
          <ul>
            {test.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>Pair with these findings</h2>
          <ul>
            {test.diagnosticUtilityNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p><strong>Evidence note:</strong> {test.evidenceNotes}</p>
        </article>

        <article className="card">
          <h2>Related conditions</h2>
          <ul>
            {test.relatedConditions.map((condition) => (
              <li key={condition.id}>
                <Link href={`/search?q=${encodeURIComponent(condition.title)}`}>{condition.title}</Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <CitationList references={test.references} title="References / linked evidence" />

      {test.relatedTests.length > 0 && (
        <section className="card" aria-labelledby="comparison-title">
          <h2 id="comparison-title">Quick comparison: related tests</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Target</th>
                  <th>Positive finding</th>
                  <th>Clinical use</th>
                </tr>
              </thead>
              <tbody>
                {[test, ...test.relatedTests].map((item) => (
                  <tr key={item.id}>
                    <td><Link href={`/special-tests/${item.id}`}>{item.title}</Link></td>
                    <td>{item.targetStructureOrDiagnosis}</td>
                    <td>{item.positiveFinding}</td>
                    <td>{item.testPurpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </article>
  );
}

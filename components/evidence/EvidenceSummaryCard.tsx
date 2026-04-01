import type { EvidenceProfile } from '@/lib/clinicalEvidence';

export function EvidenceSummaryCard({ profile, lastReviewedIso }: { profile: EvidenceProfile; lastReviewedIso?: string }) {
  return (
    <section className="card" aria-labelledby="evidence-summary-title">
      <h2 id="evidence-summary-title">Evidence summary</h2>
      <p>
        <strong>Strongest source tier:</strong> {profile.strongestLevel ? profile.referencesByLevel.find((entry) => entry.level === profile.strongestLevel)?.label : 'No linked sources'}
      </p>
      <ul>
        {profile.referencesByLevel.map((entry) => (
          <li key={entry.level}>{entry.label}: {entry.count}</li>
        ))}
      </ul>
      <p><strong>Primary evidence sources:</strong> {profile.primarySources.map((entry) => entry.shortLabel).join(', ') || 'None linked yet'}</p>
      <p><strong>Last reviewed:</strong> {lastReviewedIso || 'Not recorded'}</p>
    </section>
  );
}

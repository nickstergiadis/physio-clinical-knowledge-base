import Link from 'next/link';
import { getKnowledgeBaseItems } from '@/lib/kb';
import { getEvidenceSummaryItems } from '@/lib/evidenceSummaries';

export default function EvidenceLibraryPage() {
  const summaries = getEvidenceSummaryItems();
  const legacyUpdates = getKnowledgeBaseItems().filter((item) => item.section === 'evidence-updates' && !summaries.some((summary) => summary.slug === item.slug));

  return (
    <article className="grid">
      <header className="card">
        <h1>Evidence Library</h1>
        <p className="muted">Clinician-facing synthesis pages with quick-scan findings, bottom lines, caveats, and directly clickable references.</p>
      </header>

      <section className="card" aria-labelledby="true-summary-title">
        <h2 id="true-summary-title">Evidence summaries</h2>
        {summaries.length === 0 ? (
          <p className="muted">No structured summaries published yet.</p>
        ) : (
          <ul>
            {summaries.map((item) => (
              <li key={item.slug}>
                <Link href={`/evidence-library/${item.slug}`}>{item.title}</Link>
                <p className="muted">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="legacy-updates-title">
        <h2 id="legacy-updates-title">Legacy evidence update notes</h2>
        <ul>
          {legacyUpdates.map((item) => (
            <li key={item.slug}><Link href={`/content/${item.slug}`}>{item.title}</Link></li>
          ))}
        </ul>
      </section>
    </article>
  );
}

import type { ReferenceCitation } from '@/lib/clinicalContentModel';
import { EVIDENCE_HIERARCHY_LABELS, hierarchyLevelForReference } from '@/lib/evidence';

function CitationItem({ reference }: { reference: ReferenceCitation }) {
  const lead = `${reference.authors[0] || 'Unknown author'} (${reference.year})`;
  return (
    <li>
      <strong>{lead}</strong> {reference.title}. <em>{reference.journalOrSource}</em>.
      {reference.doi ? <> DOI: {reference.doi}.</> : null}
      {' '}
      {reference.url ? <a href={reference.url}>View source</a> : <span className="muted">No URL listed</span>}
      <span className="muted"> · {EVIDENCE_HIERARCHY_LABELS[hierarchyLevelForReference(reference)]}</span>
    </li>
  );
}

export function CitationList({ references, title = 'References' }: { references: ReferenceCitation[]; title?: string }) {
  return (
    <details className="card reference-drawer" open>
      <summary>{title} ({references.length})</summary>
      {references.length === 0 ? (
        <p className="muted">No references linked yet.</p>
      ) : (
        <ol>
          {references.map((reference) => (
            <CitationItem key={reference.id} reference={reference} />
          ))}
        </ol>
      )}
    </details>
  );
}

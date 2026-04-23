import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EvidenceStrengthTags } from '@/components/evidence/EvidenceStrengthTags';
import { KbEntityLink } from '@/components/kb/KbEntityLink';
import type { EvidenceSummaryPageData } from '@/lib/evidenceSummaries';

const SECTION_ORDER: Array<{ key: keyof EvidenceSummaryPageData['sections']; title: string }> = [
  { key: 'clinical question', title: 'Clinical question' },
  { key: 'key findings', title: 'Key findings' },
  { key: 'study/guideline quality signal', title: 'Study/guideline quality signal' },
  { key: 'clinical bottom line', title: 'Clinical bottom line' },
  { key: 'applicability / caveats', title: 'Applicability / caveats' },
  { key: 'controversies / limitations', title: 'Controversies / limitations' },
  { key: 'linked related condition, treatment, test, and progression pages', title: 'Linked related condition, treatment, test, and progression pages' },
  { key: 'references', title: 'References' },
];

export function EvidenceSummaryPageShell({ data }: { data: EvidenceSummaryPageData }) {
  return (
    <article className="condition-layout">
      <header className="card condition-header">
        <p className="eyebrow">Evidence summary · {data.item.region}</p>
        <h1>{data.item.title}</h1>
        <p className="muted">{data.item.summary}</p>
        <EvidenceStrengthTags tags={['high', 'moderate']} />
        <div className="badge-row">
          <span className="evidence-chip strength-high">Linked pages: {data.linkedPageCount}</span>
          <span className="evidence-chip strength-moderate">References: {data.referenceCount}</span>
        </div>
      </header>

      <div className="condition-content-grid">
        <aside className="card section-nav" aria-label="Evidence summary navigation">
          <h2>On this page</h2>
          <ul className="clean">
            {SECTION_ORDER.map((section) => (
              <li key={section.key}>
                <a href={`#${section.key.replace(/[^a-z0-9]+/gi, '-')}`}>{section.title}</a>
              </li>
            ))}
          </ul>
          <hr />
          <p className="muted">Library: <KbEntityLink label="Evidence Library" /></p>
        </aside>

        <section className="condition-main evidence-summary-stack">
          {SECTION_ORDER.map((section) => {
            const content = data.sections[section.key]?.trim();
            if (!content) return null;
            return (
              <section key={section.key} className="card" id={section.key.replace(/[^a-z0-9]+/gi, '-')}>
                <h2>{section.title}</h2>
                <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
              </section>
            );
          })}
        </section>
      </div>
    </article>
  );
}

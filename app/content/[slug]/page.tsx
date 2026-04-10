import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ConditionPageShell } from '@/components/condition/ConditionPageShell';
import { getStageReasoningCardsForConditionSlug } from '@/lib/clinicalModules';
import { buildConditionPageSchema } from '@/lib/conditionPage';
import { getItemBySlug, getItemsBySlugs, getKnowledgeBaseItems } from '@/lib/kb';

export function generateStaticParams() {
  return getKnowledgeBaseItems().map((item) => ({ slug: item.slug }));
}

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getItemBySlug(slug);
  if (!item) return notFound();

  const assessments = getItemsBySlugs(item.related.assessmentTools);
  const frameworks = getItemsBySlugs(item.related.exerciseFrameworks);
  const evidence = getItemsBySlugs(item.related.evidenceUpdates);
  const postop = getItemsBySlugs(item.related.postOpAnnexes);

  if (item.section === 'conditions') {
    const schema = buildConditionPageSchema(item);
    const stageReasoning = getStageReasoningCardsForConditionSlug(item.slug);
    return (
      <ConditionPageShell
        item={item}
        schema={schema}
        related={{ assessments, frameworks, evidence, postop }}
        stageReasoning={stageReasoning}
      />
    );
  }

  return (
    <article className="card prose detail-page">
      <header className="detail-header">
        <h1>{item.title}</h1>
        <FavoriteButton href={`/content/${item.slug}`} title={item.title} />
        <p>
          <strong>Section:</strong> {item.sectionLabel}<br />
          <strong>Region:</strong> {item.region}<br />
          <strong>Evidence links:</strong> {item.citations.length}<br />
          <strong>Source file:</strong> <code>{item.sourcePath}</code>
        </p>
        {item.citations.length === 0 ? (
          <p className="editorial-warning card">
            Citation gap: this page has no extracted reference links yet. Treat as draft-level guidance and verify externally.
          </p>
        ) : null}
      </header>

      <Markdown remarkPlugins={[remarkGfm]}>{item.markdown}</Markdown>

      {item.citations.length > 0 && (
        <section aria-labelledby="citations-title">
          <h2 id="citations-title">Citations / Evidence</h2>
          <p className="muted">Direct-source links are shown when available; confirm recency and applicability before applying recommendations.</p>
          <ol>
            {item.citations.map((citation) => (
              <li key={`${citation.label}-${citation.url || 'none'}`}>
                {citation.url ? <a href={citation.url}>{citation.label}</a> : citation.label}
                {!citation.url ? <span className="muted"> (URL unavailable)</span> : null}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

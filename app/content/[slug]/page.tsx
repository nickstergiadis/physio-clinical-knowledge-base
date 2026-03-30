import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FavoriteButton } from '@/components/FavoriteButton';
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

  return (
    <article className="card prose detail-page">
      <header className="detail-header">
        <h1>{item.title}</h1>
        <FavoriteButton slug={item.slug} title={item.title} />
        <p>
          <strong>Section:</strong> {item.sectionLabel}<br />
          <strong>Region:</strong> {item.region}<br />
          <strong>Source file:</strong> <code>{item.sourcePath}</code>
        </p>
      </header>

      {item.section === 'conditions' && (
        <section aria-labelledby="related-condition-content">
          <h2 id="related-condition-content">Related clinical content</h2>
          {assessments.length > 0 && <RelatedList title="Assessment tools" items={assessments} />}
          {frameworks.length > 0 && <RelatedList title="Rehab progression framework" items={frameworks} />}
          {evidence.length > 0 && <RelatedList title="Evidence updates" items={evidence} />}
          {postop.length > 0 && <RelatedList title="Post-op annexes" items={postop} />}
        </section>
      )}

      <Markdown remarkPlugins={[remarkGfm]}>{item.markdown}</Markdown>

      {item.citations.length > 0 && (
        <section aria-labelledby="citations-title">
          <h2 id="citations-title">Citations / Evidence</h2>
          <ol>
            {item.citations.map((citation) => (
              <li key={`${citation.label}-${citation.url || 'none'}`}>
                {citation.url ? <a href={citation.url}>{citation.label}</a> : citation.label}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

function RelatedList({ title, items }: { title: string; items: Array<{ slug: string; title: string }> }) {
  return (
    <section aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/content/${item.slug}`}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

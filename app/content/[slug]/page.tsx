import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FavoriteButton } from '@/components/FavoriteButton';
import { getContentBySlug, getRelatedByRegionAndType, getRelatedByRegionAndTypeSlug } from '@/lib/data';

type Props = {
  params: Promise<{ slug: string }>;
};

const preferredKinds = ['assessment', 'rehab', 'evidence', 'postop'];

function classifyType(name?: string | null): string {
  const value = (name || '').toLowerCase();
  if (value.includes('assessment')) return 'assessment';
  if (value.includes('rehab') || value.includes('exercise')) return 'rehab';
  if (value.includes('evidence')) return 'evidence';
  if (value.includes('post')) return 'postop';
  if (value.includes('condition')) return 'condition';
  return 'related';
}

function getQuickFacts(markdown: string, excerpt?: string | null) {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'));

  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .slice(0, 3);

  const firstSentence = (excerpt || '')
    .split(/[.!?]/)
    .map((part) => part.trim())
    .find(Boolean);

  return {
    bullets,
    summary: firstSentence || 'Use this page with related assessment and rehab references for point-of-care decisions.',
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item) return notFound();

  const [additional, relatedAssessments, relatedRehab] = await Promise.all([
    getRelatedByRegionAndType(slug, item.regionId, item.contentTypeId),
    getRelatedByRegionAndTypeSlug(slug, item.regionId, ['assessment']),
    getRelatedByRegionAndTypeSlug(slug, item.regionId, ['rehab', 'postop']),
  ]);

  const quickFacts = getQuickFacts(item.markdown, item.excerpt);
  const isConditionPage = item.contentType?.slug === 'condition';

  const relatedBuckets = new Map<string, { slug: string; title: string }[]>();
  for (const link of item.outboundLinks) {
    const kind = classifyType(link.targetItem.contentType?.name) || link.kind;
    if (!relatedBuckets.has(kind)) relatedBuckets.set(kind, []);
    relatedBuckets.get(kind)?.push({ slug: link.targetItem.slug, title: link.targetItem.title });
  }
  for (const add of additional) {
    const kind = classifyType(add.contentType?.name);
    if (!relatedBuckets.has(kind)) relatedBuckets.set(kind, []);
    const bucket = relatedBuckets.get(kind)!;
    if (!bucket.find((b) => b.slug === add.slug)) {
      bucket.push({ slug: add.slug, title: add.title });
    }
  }

  return (
    <article className="card prose detail-page">
      <header className="detail-header">
        <h1>{item.title}</h1>
        <FavoriteButton slug={item.slug} title={item.title} />
        <p>
          <strong>Type:</strong> {item.contentType?.name || 'Other'}<br />
          <strong>Region:</strong> {item.region?.name || 'General'}<br />
          <strong>Source file:</strong> <code>{item.sourcePath}</code>
        </p>
      </header>

      {isConditionPage && (
        <section className="quick-facts" aria-labelledby="quick-facts-title">
          <h2 id="quick-facts-title">Quick facts</h2>
          <p>{quickFacts.summary}.</p>
          {quickFacts.bullets.length > 0 && (
            <ul>
              {quickFacts.bullets.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isConditionPage && relatedAssessments.length > 0 && (
        <section aria-labelledby="related-assessment-title">
          <h2 id="related-assessment-title">Related assessment</h2>
          <ul>
            {relatedAssessments.slice(0, 8).map((r) => (
              <li key={r.slug}>
                <Link href={`/content/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isConditionPage && relatedRehab.length > 0 && (
        <section aria-labelledby="related-rehab-title">
          <h2 id="related-rehab-title">Related rehab progression</h2>
          <ul>
            {relatedRehab.slice(0, 8).map((r) => (
              <li key={r.slug}>
                <Link href={`/content/${r.slug}`}>{r.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Markdown remarkPlugins={[remarkGfm]}>{item.markdown}</Markdown>

      <section aria-labelledby="related-title">
        <h2 id="related-title">Related content</h2>
        {preferredKinds.map((kind) => {
          const links = relatedBuckets.get(kind) || [];
          if (!links.length) return null;
          return (
            <div key={kind}>
              <h3 style={{ textTransform: 'capitalize' }}>{kind}</h3>
              <ul>
                {links.slice(0, 8).map((r) => (
                  <li key={r.slug}>
                    <Link href={`/content/${r.slug}`}>{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {item.citations.length > 0 && (
        <section aria-labelledby="citations-title">
          <h2 id="citations-title">Citations / Evidence</h2>
          <ol>
            {item.citations.map((c) => (
              <li key={c.id}>
                {c.url ? <a href={c.url}>{c.label}</a> : c.label}
                {c.note ? ` — ${c.note}` : ''}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

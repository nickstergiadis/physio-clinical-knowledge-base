import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EvidenceSummaryPageShell } from '@/components/evidence/EvidenceSummaryPageShell';
import { getEvidenceSummaryBySlug, getEvidenceSummaryItems } from '@/lib/evidenceSummaries';

export function generateStaticParams() {
  return getEvidenceSummaryItems().map((item) => ({ slug: item.slug }));
}

export default async function EvidenceSummaryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getEvidenceSummaryBySlug(slug);
  if (!data) return notFound();

  return (
    <>
      <p><Link href="/evidence-library">← Back to evidence library</Link></p>
      <EvidenceSummaryPageShell data={data} />
    </>
  );
}

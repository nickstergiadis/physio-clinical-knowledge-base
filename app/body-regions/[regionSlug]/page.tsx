import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { BodyRegionHubDetailClient } from '@/components/body-region/BodyRegionHubDetailClient';
import { BODY_REGION_HUBS, getBodyRegionHubBySlug } from '@/lib/bodyRegionHubs';

type RegionPageProps = {
  params: Promise<{ regionSlug: string }>;
};

export function generateStaticParams() {
  return BODY_REGION_HUBS.map((hub) => ({ regionSlug: hub.slug }));
}

export default async function BodyRegionHubDetailPage({ params }: RegionPageProps) {
  const { regionSlug } = await params;
  const hub = getBodyRegionHubBySlug(regionSlug);

  if (!hub) return notFound();

  return (
    <article className="grid">
      <Suspense fallback={null}>
        <BodyRegionHubDetailClient hub={hub} />
      </Suspense>
    </article>
  );
}

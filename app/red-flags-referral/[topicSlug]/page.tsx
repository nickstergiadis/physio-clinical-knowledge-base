import { notFound } from 'next/navigation';
import { RedFlagReferralPageView } from '@/components/red-flags/RedFlagReferralPage';
import { getRedFlagReferralPageBySlug, RED_FLAG_REFERRAL_PAGES } from '@/lib/redFlagsReferral';

export function generateStaticParams() {
  return RED_FLAG_REFERRAL_PAGES.map((page) => ({ topicSlug: page.slug }));
}

export default async function RedFlagTopicPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = await params;
  const page = getRedFlagReferralPageBySlug(topicSlug);

  if (!page) return notFound();

  return <RedFlagReferralPageView page={page} />;
}

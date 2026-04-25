import Link from 'next/link';
import { RED_FLAG_REFERRAL_PAGES } from '@/lib/redFlagsReferral';

export default function RedFlagsReferralPage() {
  return (
    <div className="section-stack">
      <header className="card">
        <p className="eyebrow">Clinical section</p>
        <h1>Red Flags / Referral</h1>
        <p className="muted">
          Point-of-care referral pathways organized by body region. Use urgency tiers to support rapid and defensible escalation decisions.
        </p>
      </header>

      <section className="grid two" aria-label="Available referral pathways">
        {RED_FLAG_REFERRAL_PAGES.map((page) => (
          <article className="card" key={page.slug}>
            <h2>
              <Link href={`/red-flags-referral/${page.slug}`}>{page.title}</Link>
            </h2>
            <p>{page.summary}</p>
            <p className="muted">Includes emergency, same-day, and routine referral triggers plus documentation wording.</p>
          </article>
        ))}
      </section>
    </div>
  );
}

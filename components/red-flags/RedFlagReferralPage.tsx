import Link from 'next/link';
import type { EscalationItem, RedFlagReferralPage } from '@/lib/redFlagsReferral';

const ESCALATION_LABELS: Record<EscalationItem['level'], string> = {
  emergency: 'Urgent / emergency',
  'same-day': 'Same-day medical referral',
  routine: 'Routine referral',
};

export function RedFlagReferralPageView({ page }: { page: RedFlagReferralPage }) {
  const escalationRows: EscalationItem[] = [
    {
      level: 'emergency',
      title: 'Act now: emergency care pathway',
      actions: page.urgentEmergencyRedFlags,
    },
    {
      level: 'same-day',
      title: 'Escalate today: same-day medical review',
      actions: page.sameDayReferralTriggers,
    },
    {
      level: 'routine',
      title: 'Escalate soon: routine referral planning',
      actions: page.routineReferralConsiderations,
    },
  ];

  return (
    <article className="section-stack red-flag-page">
      <header className="card">
        <p className="eyebrow">Red Flags / Referral</p>
        <h1>{page.title}</h1>
        <p className="muted">{page.summary}</p>
      </header>

      <section className="grid three" aria-label="Escalation urgency">
        {escalationRows.map((row) => (
          <section key={row.level} className={`card escalation-card escalation-${row.level}`} aria-labelledby={`${row.level}-title`}>
            <p className={`urgency-chip urgency-${row.level}`}>{ESCALATION_LABELS[row.level]}</p>
            <h2 id={`${row.level}-title`}>{row.title}</h2>
            <ul>
              {row.actions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section className="grid two">
        <section className="card" aria-labelledby="history-exam-title">
          <h2 id="history-exam-title">Key history / exam screen items</h2>
          <ul>
            {page.keyHistoryExamItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card" aria-labelledby="documentation-title">
          <h2 id="documentation-title">Documentation / safety-net wording</h2>
          <ul>
            {page.documentationSafetyNet.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </section>

      <section className="card" aria-labelledby="related-title">
        <h2 id="related-title">Related conditions / related pages</h2>
        <ul className="clean quick-list">
          {page.relatedPages.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
              {item.note ? <p className="muted">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="references-title">
        <h2 id="references-title">References / guideline support</h2>
        <ul>
          {page.references.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong>
              {item.detail ? `: ${item.detail}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

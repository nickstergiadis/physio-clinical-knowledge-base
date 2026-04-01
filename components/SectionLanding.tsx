import Link from 'next/link';

type SectionLandingProps = {
  title: string;
  quickView: string[];
  deepView: string[];
};

export function SectionLanding({ title, quickView, deepView }: SectionLandingProps) {
  return (
    <>
      <header>
        <h1>{title}</h1>
        <p className="muted">
          Clinical-first index page. Use Quick View during consults and Deep View for detailed prep, differential review, and documentation support.
        </p>
      </header>

      <section className="grid two">
        <article className="card" aria-labelledby="quick-view-title">
          <h2 id="quick-view-title">Quick View</h2>
          <p className="muted">One-screen point-of-care summary.</p>
          <ul>
            {quickView.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="card" aria-labelledby="deep-view-title">
          <h2 id="deep-view-title">Deep View</h2>
          <p className="muted">Expanded detail for review and clinical reasoning refresh.</p>
          <ul>
            {deepView.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2>Clinical safety note</h2>
        <p>
          This section is an index layer. Confirm recommendations against source-linked pages and patient-specific findings before applying care plans.
          Use <Link href="/search"> Search</Link> for current source-linked content.
        </p>
      </section>
    </>
  );
}

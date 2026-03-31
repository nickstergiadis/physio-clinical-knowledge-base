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
          Clinical-first index page. Use Quick View during consults and Deep View for detailed prep and study.
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
        <h2>Next step</h2>
        <p>
          This is a foundation placeholder. Full indexed content will be connected in a later module.
          Use <Link href="/search">Search</Link> to access current source-linked pages.
        </p>
      </section>
    </>
  );
}

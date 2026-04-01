import Link from 'next/link';
import { BODY_REGION_HUBS } from '@/lib/bodyRegionHubs';

export default function BodyRegionsPage() {
  return (
    <>
      <header className="card">
        <h1>Body Region Hubs</h1>
        <p className="muted">
          Region-first pages for fast consult navigation. Optional Study Mode surfaces high-yield review blocks without turning this into a course platform.
        </p>
      </header>

      <section aria-labelledby="region-hubs-title" style={{ marginTop: '1rem' }}>
        <h2 id="region-hubs-title">Browse by region</h2>
        <div className="grid three">
          {BODY_REGION_HUBS.map((hub) => (
            <article key={hub.slug} id={hub.slug} className="card">
              <h3>{hub.name}</h3>
              <p className="muted">{hub.commonConditions.slice(0, 2).join(' • ')}</p>
              <div className="hub-card-actions">
                <Link href={`/body-regions/${hub.slug}`}>Open clinical hub</Link>
                <Link href={`/body-regions/${hub.slug}?mode=study`}>Open Study Mode</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import { getOutcomeMeasures } from '@/lib/outcomeMeasures';

export default function OutcomeMeasuresPage() {
  const measures = getOutcomeMeasures();

  return (
    <>
      <header>
        <h1>Outcome Measures</h1>
        <p className="muted">Validated measures with transparent citations and review metadata.</p>
      </header>

      <section className="grid two">
        {measures.map((measure) => (
          <article key={measure.id} className="card">
            <h2><Link href={`/outcome-measures/${measure.id}`}>{measure.title}</Link></h2>
            <p className="muted">{measure.bodyRegionName}</p>
            <p>{measure.population}</p>
          </article>
        ))}
      </section>
    </>
  );
}

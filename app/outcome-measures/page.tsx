import { SectionLanding } from '@/components/SectionLanding';

export default function OutcomeMeasuresPage() {
  return (
    <SectionLanding
      title="Outcome Measures"
      quickView={[
        'Best-fit PROMs and performance tests',
        'When to use baseline vs follow-up timing',
        'Rapid interpretation notes',
      ]}
      deepView={[
        'Psychometric properties and thresholds',
        'MCID/MDC context by population',
        'Measure selection trade-offs and caveats',
      ]}
    />
  );
}

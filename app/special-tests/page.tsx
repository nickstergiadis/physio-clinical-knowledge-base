import { SectionLanding } from '@/components/SectionLanding';

export default function SpecialTestsPage() {
  return (
    <SectionLanding
      title="Special Tests"
      quickView={[
        'How to perform each test quickly',
        'Positive finding definitions',
        'Best-use context in clinical flow',
      ]}
      deepView={[
        'Sensitivity/specificity context and limits',
        'Cluster testing strategy and sequencing',
        'Interpretation pitfalls and alternatives',
      ]}
    />
  );
}

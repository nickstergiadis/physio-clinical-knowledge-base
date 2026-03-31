import { SectionLanding } from '@/components/SectionLanding';

export default function ConditionsPage() {
  return (
    <SectionLanding
      title="Conditions"
      quickView={[
        'Typical presentation patterns',
        'Priority differential diagnoses',
        'Core exam cues and red-flag checks',
      ]}
      deepView={[
        'Detailed differential reasoning and subgrouping',
        'Evidence summary and clinical caveats',
        'Progression strategy and follow-up markers',
      ]}
    />
  );
}

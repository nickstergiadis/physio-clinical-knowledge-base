import { SectionLanding } from '@/components/SectionLanding';

export default function EvidenceLibraryPage() {
  return (
    <SectionLanding
      title="Evidence Library"
      quickView={[
        'High-yield evidence summaries by topic',
        'Clinical bottom line statements',
        'Direct link to cited references',
      ]}
      deepView={[
        'Study design and quality appraisal notes',
        'Applicability to real clinical populations',
        'Controversies and evidence gaps',
      ]}
    />
  );
}

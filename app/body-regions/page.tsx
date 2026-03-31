import { SectionLanding } from '@/components/SectionLanding';

export default function BodyRegionsPage() {
  return (
    <SectionLanding
      title="Body Regions"
      quickView={[
        'Region-specific assessment checklist',
        'Common condition clusters by region',
        'High-yield tests and treatment options',
      ]}
      deepView={[
        'Region biomechanics and load considerations',
        'Less common differentials by region',
        'Integrated care pathways by tissue and irritability',
      ]}
    />
  );
}

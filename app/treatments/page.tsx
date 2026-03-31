import { SectionLanding } from '@/components/SectionLanding';

export default function TreatmentsPage() {
  return (
    <SectionLanding
      title="Treatments"
      quickView={[
        'First-line treatment options',
        'Dosage and response monitoring cues',
        'Contraindications and precautions',
      ]}
      deepView={[
        'Mechanism-informed treatment selection',
        'Evidence grading and practical translation',
        'Escalation/de-escalation decision points',
      ]}
    />
  );
}

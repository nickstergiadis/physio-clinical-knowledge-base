import { SectionLanding } from '@/components/SectionLanding';

export default function RedFlagsReferralPage() {
  return (
    <SectionLanding
      title="Red Flags / Referral"
      quickView={[
        'Immediate red flag checklist',
        'Urgent vs routine referral indicators',
        'Documentation essentials',
      ]}
      deepView={[
        'Systems review decision pathways',
        'Escalation rationale and communication notes',
        'Differential overlap and safety-net planning',
      ]}
    />
  );
}

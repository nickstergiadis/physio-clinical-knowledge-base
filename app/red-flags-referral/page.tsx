import { SectionLanding } from '@/components/SectionLanding';

export default function RedFlagsReferralPage() {
  return (
    <SectionLanding
      title="Red Flags / Referral"
      quickView={[
        'Immediate triage: emergency vs same-day vs routine referral',
        'Core red flag screens: cauda equina, fracture, infection, cancer, vascular events',
        'Safety-net documentation language for uncertain presentations',
      ]}
      deepView={[
        'Region-specific referral pathways with escalation thresholds',
        'Differential overlap and false-positive management',
        'Communication scripts: patient education + receiving-provider handoff',
      ]}
    />
  );
}

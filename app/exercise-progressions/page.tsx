import { SectionLanding } from '@/components/SectionLanding';

export default function ExerciseProgressionsPage() {
  return (
    <SectionLanding
      title="Exercise Progressions"
      quickView={[
        'Starting level by irritability and capacity',
        'Simple progression/regression rules',
        'Session-to-session modification triggers',
      ]}
      deepView={[
        'Phase-based rehab framework',
        'Load progression criteria and objective markers',
        'Return-to-function and return-to-sport milestones',
      ]}
    />
  );
}

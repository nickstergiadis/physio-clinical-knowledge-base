import type { ConditionStage } from '@/lib/clinicalContentModel';
import { STAGE_LABELS } from '@/lib/clinicalStages';

export function StageBadge({ stage }: { stage: ConditionStage }) {
  return <span className="stage-badge">{STAGE_LABELS[stage]}</span>;
}

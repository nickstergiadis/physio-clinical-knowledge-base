import type { ConditionStage } from '@/lib/clinicalContentModel';

export const STAGE_LABELS: Record<ConditionStage, string> = {
  'acute-irritable': 'Acute / irritable',
  subacute: 'Subacute',
  chronic: 'Chronic / persistent',
  'post-op-early': 'Post-op early',
  'post-op-late': 'Post-op late',
  'return-to-sport': 'Return to sport',
};

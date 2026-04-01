import { clinicalSeed } from '@/lib/clinicalSeed';
import type { ClinicalCondition, OutcomeMeasure } from '@/lib/clinicalContentModel';

export type OutcomeMeasureWithContext = OutcomeMeasure & {
  bodyRegionName: string;
  relatedConditions: ClinicalCondition[];
};

export function getOutcomeMeasures() {
  return clinicalSeed.outcomeMeasures.map((measure) => toOutcomeMeasureWithContext(measure));
}

export function getOutcomeMeasureById(id: string) {
  const measure = clinicalSeed.outcomeMeasures.find((entry) => entry.id === id);
  if (!measure) return undefined;
  return toOutcomeMeasureWithContext(measure);
}

function toOutcomeMeasureWithContext(measure: OutcomeMeasure): OutcomeMeasureWithContext {
  const bodyRegionName = clinicalSeed.bodyRegions.find((entry) => entry.id === measure.bodyRegionId)?.name || 'General';
  const relatedConditions = clinicalSeed.conditions.filter((condition) => measure.conditionRelevanceConditionIds.includes(condition.id));
  return { ...measure, bodyRegionName, relatedConditions };
}

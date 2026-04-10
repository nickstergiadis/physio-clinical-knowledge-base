import { clinicalSeed } from '@/lib/clinicalSeed';
import type { ConditionStage, ExerciseProgression, Treatment } from '@/lib/clinicalContentModel';
import { STAGE_LABELS } from '@/lib/clinicalStages';
import { getKnowledgeBaseItems } from '@/lib/kb';

export type StageFilterOption = { value: ConditionStage; label: string };

type LinkedCondition = {
  id: string;
  title: string;
  slug?: string;
  bodyRegionId: string;
  bodyRegionName: string;
};

export type TreatmentWithContext = Treatment & {
  relatedConditions: LinkedCondition[];
  bodyRegionIds: string[];
  bodyRegionNames: string[];
};

export type ExerciseProgressionWithContext = ExerciseProgression & {
  targetConditions: LinkedCondition[];
  bodyRegionIds: string[];
  bodyRegionNames: string[];
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findConditionSlug(labels: string[]) {
  const candidates = getKnowledgeBaseItems();
  const normalizedLabels = labels.map((label) => normalize(label)).filter(Boolean);

  for (const label of normalizedLabels) {
    const exact = candidates.find((item) =>
      normalize(item.title) === label || item.aliases.some((alias) => normalize(alias) === label),
    );
    if (exact) return exact.slug;
  }

  for (const label of normalizedLabels) {
    const fuzzy = candidates.find((item) =>
      normalize(item.title).includes(label)
      || label.includes(normalize(item.title))
      || item.aliases.some((alias) => normalize(alias).includes(label) || label.includes(normalize(alias))),
    );
    if (fuzzy) return fuzzy.slug;
  }

  return undefined;
}

function withConditionContext(conditionId: string): LinkedCondition | null {
  const condition = clinicalSeed.conditions.find((entry) => entry.id === conditionId);
  if (!condition) return null;
  const region = clinicalSeed.bodyRegions.find((entry) => entry.id === condition.bodyRegionId);
  const slug = findConditionSlug([condition.title, ...condition.aliases]);

  return {
    id: condition.id,
    title: condition.title,
    slug,
    bodyRegionId: condition.bodyRegionId,
    bodyRegionName: region?.name || 'General',
  };
}

export function getTreatmentsWithContext(): TreatmentWithContext[] {
  return clinicalSeed.treatments.map((treatment) => {
    const relatedConditionIds = clinicalSeed.conditions
      .filter((condition) => condition.stageBasedManagement.some((stagePlan) => stagePlan.treatmentIds.includes(treatment.id)))
      .map((condition) => condition.id);

    const relatedConditions = relatedConditionIds
      .map((conditionId) => withConditionContext(conditionId))
      .filter((item): item is LinkedCondition => item !== null);

    return {
      ...treatment,
      relatedConditions,
      bodyRegionIds: [...new Set(relatedConditions.map((item) => item.bodyRegionId))],
      bodyRegionNames: [...new Set(relatedConditions.map((item) => item.bodyRegionName))],
    };
  });
}

export function getExerciseProgressionsWithContext(): ExerciseProgressionWithContext[] {
  return clinicalSeed.exerciseProgressions.map((progression) => {
    const targetConditions = progression.targetConditionIds
      .map((conditionId) => withConditionContext(conditionId))
      .filter((item): item is LinkedCondition => item !== null);

    return {
      ...progression,
      targetConditions,
      bodyRegionIds: [...new Set(targetConditions.map((item) => item.bodyRegionId))],
      bodyRegionNames: [...new Set(targetConditions.map((item) => item.bodyRegionName))],
    };
  });
}

export function getStageFilterOptions(): StageFilterOption[] {
  return (Object.keys(STAGE_LABELS) as ConditionStage[]).map((value) => ({ value, label: STAGE_LABELS[value] }));
}

export function getConditionFilterOptions() {
  return clinicalSeed.conditions
    .map((condition) => ({ id: condition.id, title: condition.title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getRegionFilterOptions() {
  return clinicalSeed.bodyRegions
    .map((region) => ({ id: region.id, name: region.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getStageReasoningCardsForConditionSlug(slug: string) {
  const condition = clinicalSeed.conditions.find((entry) => findConditionSlug([entry.title, ...entry.aliases]) === slug);
  if (!condition) return null;

  const treatmentCards = getTreatmentsWithContext().filter((entry) =>
    condition.stageBasedManagement.some((stagePlan) => stagePlan.treatmentIds.includes(entry.id)),
  );

  const progressionCards = getExerciseProgressionsWithContext().filter((entry) =>
    condition.exerciseProgressionByStage.some((stagePlan) => stagePlan.exerciseProgressionIds.includes(entry.id)),
  );

  return {
    conditionTitle: condition.title,
    treatmentCards,
    progressionCards,
  };
}

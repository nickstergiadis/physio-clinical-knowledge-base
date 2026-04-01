import { clinicalSeed, clinicalReferenceMap } from '@/lib/clinicalSeed';
import type { ClinicalCondition, ReferenceCitation, SpecialTest } from '@/lib/clinicalContentModel';

export type SpecialTestWithContext = SpecialTest & {
  bodyRegionName: string;
  relatedConditions: ClinicalCondition[];
  references: ReferenceCitation[];
  relatedTests: SpecialTest[];
};

export function getSpecialTests(): SpecialTestWithContext[] {
  return clinicalSeed.specialTests.map((test) => toSpecialTestWithContext(test));
}

export function getSpecialTestById(id: string): SpecialTestWithContext | undefined {
  const test = clinicalSeed.specialTests.find((item) => item.id === id);
  if (!test) return undefined;
  return toSpecialTestWithContext(test);
}

export function getBodyRegionFilterOptions() {
  return clinicalSeed.bodyRegions
    .map((region) => ({ id: region.id, name: region.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTargetFilterOptions() {
  return [...new Set(clinicalSeed.specialTests.map((test) => test.targetStructureOrDiagnosis))].sort((a, b) => a.localeCompare(b));
}

function toSpecialTestWithContext(test: SpecialTest): SpecialTestWithContext {
  const relatedConditions = clinicalSeed.conditions.filter((condition) => test.relatedConditionIds.includes(condition.id));
  const references = test.referenceIds
    .map((referenceId) => clinicalReferenceMap.get(referenceId))
    .filter((reference): reference is ReferenceCitation => Boolean(reference));

  const relatedTestIds = new Set<string>();

  for (const condition of relatedConditions) {
    for (const specialTestId of condition.specialTestIds) {
      if (specialTestId !== test.id) relatedTestIds.add(specialTestId);
    }
  }

  for (const candidate of clinicalSeed.specialTests) {
    if (
      candidate.id !== test.id
      && (
        candidate.targetStructureOrDiagnosis === test.targetStructureOrDiagnosis
        || candidate.bodyRegionId === test.bodyRegionId
      )
    ) {
      relatedTestIds.add(candidate.id);
    }
  }

  const relatedTests = clinicalSeed.specialTests.filter((candidate) => relatedTestIds.has(candidate.id));
  const bodyRegionName = clinicalSeed.bodyRegions.find((region) => region.id === test.bodyRegionId)?.name || 'General';

  return {
    ...test,
    bodyRegionName,
    references,
    relatedConditions,
    relatedTests,
  };
}

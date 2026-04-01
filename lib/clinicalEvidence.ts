import { clinicalReferenceMap } from '@/lib/clinicalSeed';
import type { EntityId, EvidenceStrength, ReferenceCitation } from '@/lib/clinicalContentModel';
import {
  EVIDENCE_HIERARCHY,
  EVIDENCE_HIERARCHY_LABELS,
  hierarchyLevelForReference,
  isEvidenceSufficient,
  type EvidenceHierarchyLevel,
} from '@/lib/evidence';

export type EvidenceProfile = {
  references: ReferenceCitation[];
  referencesByLevel: Array<{ level: EvidenceHierarchyLevel; label: string; count: number }>;
  primarySources: ReferenceCitation[];
  strongestLevel: EvidenceHierarchyLevel | null;
  sufficientReferences: boolean;
  editorialWarning: string | null;
};

export function resolveReferences(referenceIds: EntityId[]): ReferenceCitation[] {
  return referenceIds
    .map((referenceId) => clinicalReferenceMap.get(referenceId))
    .filter((reference): reference is ReferenceCitation => Boolean(reference));
}

export function buildEvidenceProfile(referenceIds: EntityId[], evidenceStrengthTags: EvidenceStrength[] = []): EvidenceProfile {
  const references = resolveReferences(referenceIds);
  const referencesByLevel = EVIDENCE_HIERARCHY.map((level) => {
    const count = references.filter((reference) => hierarchyLevelForReference(reference) === level).length;
    return { level, label: EVIDENCE_HIERARCHY_LABELS[level], count };
  }).filter((entry) => entry.count > 0);

  const strongestLevel = EVIDENCE_HIERARCHY.find((level) => references.some((reference) => hierarchyLevelForReference(reference) === level)) || null;
  const primarySources = strongestLevel
    ? references.filter((reference) => hierarchyLevelForReference(reference) === strongestLevel)
    : [];

  const sufficientReferences = isEvidenceSufficient(references.length);

  let editorialWarning: string | null = null;
  if (!sufficientReferences) {
    editorialWarning = 'This page is in editorial draft state: add at least one verifiable source before considering it complete.';
  } else if (evidenceStrengthTags.includes('expert-consensus') && references.length < 2) {
    editorialWarning = 'Evidence is currently consensus-weighted. Prioritize adding guideline/review-level sources on next review cycle.';
  }

  return {
    references,
    referencesByLevel,
    primarySources,
    strongestLevel,
    sufficientReferences,
    editorialWarning,
  };
}

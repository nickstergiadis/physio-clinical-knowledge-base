import type { EvidenceStrength, ReferenceCitation } from '@/lib/clinicalContentModel';

export type EvidenceHierarchyLevel =
  | 'clinical-practice-guideline'
  | 'systematic-review-meta-analysis'
  | 'diagnostic-or-cohort'
  | 'randomized-controlled-trial'
  | 'expert-consensus';

export const EVIDENCE_HIERARCHY: EvidenceHierarchyLevel[] = [
  'clinical-practice-guideline',
  'systematic-review-meta-analysis',
  'diagnostic-or-cohort',
  'randomized-controlled-trial',
  'expert-consensus',
];

export const EVIDENCE_HIERARCHY_LABELS: Record<EvidenceHierarchyLevel, string> = {
  'clinical-practice-guideline': 'Clinical practice guideline',
  'systematic-review-meta-analysis': 'Systematic review / meta-analysis',
  'diagnostic-or-cohort': 'Diagnostic accuracy / cohort',
  'randomized-controlled-trial': 'RCT',
  'expert-consensus': 'Expert consensus',
};

export function hierarchyLevelForReference(reference: ReferenceCitation): EvidenceHierarchyLevel {
  switch (reference.type) {
    case 'guideline':
      return 'clinical-practice-guideline';
    case 'systematic-review':
      return 'systematic-review-meta-analysis';
    case 'diagnostic-study':
    case 'cohort':
      return 'diagnostic-or-cohort';
    case 'rct':
      return 'randomized-controlled-trial';
    case 'consensus':
      return 'expert-consensus';
    default:
      return 'expert-consensus';
  }
}

export function evidenceTagLabel(tag: EvidenceStrength): string {
  switch (tag) {
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
    case 'very-low':
      return 'Very low';
    case 'expert-consensus':
      return 'Expert consensus';
  }
}

export function evidenceTagClassName(tag: EvidenceStrength): string {
  return `strength-${tag}`;
}

export function isEvidenceSufficient(referencesCount: number): boolean {
  return referencesCount >= 1;
}

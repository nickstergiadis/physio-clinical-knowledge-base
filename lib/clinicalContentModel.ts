export type EntityId = string;

export type EvidenceStrength = 'high' | 'moderate' | 'low' | 'very-low' | 'expert-consensus';

export type BodyRegionKey =
  | 'cervical-spine'
  | 'thoracic-spine'
  | 'lumbar-spine'
  | 'shoulder'
  | 'elbow-forearm'
  | 'hand-wrist'
  | 'hip-groin'
  | 'knee'
  | 'ankle-foot'
  | 'tmj'
  | 'pelvic-health'
  | 'multiregion';

export type ConditionStage = 'acute-irritable' | 'subacute' | 'chronic' | 'post-op-early' | 'post-op-late' | 'return-to-sport';

export type ReferralUrgency = 'immediate-emergency' | 'urgent-24h' | 'expedited-1-2-weeks' | 'routine';

export type ViewDensity = 'quick' | 'deep';

export type ReferenceCitation = {
  id: EntityId;
  shortLabel: string;
  type: 'systematic-review' | 'rct' | 'cohort' | 'guideline' | 'consensus' | 'diagnostic-study' | 'textbook';
  title: string;
  authors: string[];
  year: number;
  journalOrSource: string;
  doi?: string;
  url?: string;
  notes?: string;
};

export type BodyRegion = {
  id: EntityId;
  key: BodyRegionKey;
  name: string;
  aliases: string[];
  tags: string[];
};

export type StageBasedManagement = {
  stage: ConditionStage;
  goals: string[];
  treatmentIds: EntityId[];
  progressionFocus: string[];
  reassessmentPriorities: string[];
};

export type ExercisePrescription = {
  stage: ConditionStage;
  exerciseProgressionIds: EntityId[];
  rationale: string;
};

export type ReviewMetadata = {
  reviewer: string;
  reviewedAtIso: string;
  nextReviewDueIso: string;
};

export type ClinicalCondition = {
  id: EntityId;
  title: string;
  aliases: string[];
  bodyRegionId: EntityId;
  clinicalSnapshot: string;
  typicalPattern: string[];
  commonSubjectiveClues: string[];
  objectiveExamPriorities: string[];
  keyDifferentialConditionIds: EntityId[];
  specialTestIds: EntityId[];
  stageBasedManagement: StageBasedManagement[];
  exerciseProgressionByStage: ExercisePrescription[];
  healingRecoveryTimeline: string[];
  redFlagTopicIds: EntityId[];
  commonMistakesPitfalls: string[];
  evidenceSummary: string;
  referenceIds: EntityId[];
  evidenceStrengthTags: EvidenceStrength[];
  lastReviewed: ReviewMetadata;
};

export type SpecialTest = {
  id: EntityId;
  title: string;
  aliases: string[];
  assesses: string;
  bodyRegionId: EntityId;
  targetStructureOrDiagnosis: string;
  testPurpose: string;
  patientPosition: string;
  clinicianAction: string[];
  positiveFinding: string;
  interpretation: string;
  limitations: string[];
  diagnosticUtilityNotes: string[];
  evidenceNotes: string;
  relatedConditionIds: EntityId[];
  referenceIds: EntityId[];
  lastReviewed?: ReviewMetadata;
};

export type Treatment = {
  id: EntityId;
  title: string;
  aliases: string[];
  whatItIs: string;
  whenToUse: string[];
  whenNotToOveruse: string[];
  stageRelevance: ConditionStage[];
  indications: string[];
  contraindicationsPrecautions: string[];
  practicalNotes: string[];
  evidenceSummary: string;
  referenceIds: EntityId[];
  lastReviewed?: ReviewMetadata;
};

export type ExerciseProgression = {
  id: EntityId;
  title: string;
  aliases: string[];
  targetConditionIds: EntityId[];
  targetTissuesFunctions: string[];
  stage: ConditionStage;
  entryCriteria: string[];
  dosageSuggestions: string[];
  commonCompensations: string[];
  progressionOptions: string[];
  regressionOptions: string[];
  criteriaToAdvance: string[];
  returnToFunctionRelevance: string;
  evidenceNotes: string;
  referenceIds: EntityId[];
  lastReviewed?: ReviewMetadata;
};

export type OutcomeMeasure = {
  id: EntityId;
  title: string;
  aliases: string[];
  bodyRegionId: EntityId;
  population: string;
  conditionRelevanceConditionIds: EntityId[];
  administration: string[];
  scoring: string[];
  mcidMdc: string[];
  interpretation: string[];
  referenceIds: EntityId[];
  lastReviewed?: ReviewMetadata;
};

export type RedFlagReferralTopic = {
  id: EntityId;
  title: string;
  aliases: string[];
  scenario: string;
  whyItMatters: string;
  whatToAsk: string[];
  whatToLookFor: string[];
  escalationPathway: string[];
  referralUrgency: ReferralUrgency;
  referenceIds: EntityId[];
  lastReviewed?: ReviewMetadata;
};

export type ClinicalContentStore = {
  bodyRegions: BodyRegion[];
  conditions: ClinicalCondition[];
  specialTests: SpecialTest[];
  treatments: Treatment[];
  exerciseProgressions: ExerciseProgression[];
  outcomeMeasures: OutcomeMeasure[];
  redFlags: RedFlagReferralTopic[];
  references: ReferenceCitation[];
};

export type ConditionQuickView = {
  id: EntityId;
  title: string;
  aliases: string[];
  bodyRegionId: EntityId;
  clinicalSnapshot: string;
  topSubjectiveClues: string[];
  topObjectivePriorities: string[];
  keyRedFlagIds: EntityId[];
  evidenceStrengthTags: EvidenceStrength[];
  referenceIds: EntityId[];
  lastReviewedIso: string;
};

export type ConditionDeepView = ClinicalCondition;

export function toConditionView(condition: ClinicalCondition, density: ViewDensity): ConditionQuickView | ConditionDeepView {
  if (density === 'deep') return condition;

  return {
    id: condition.id,
    title: condition.title,
    aliases: condition.aliases,
    bodyRegionId: condition.bodyRegionId,
    clinicalSnapshot: condition.clinicalSnapshot,
    topSubjectiveClues: condition.commonSubjectiveClues.slice(0, 3),
    topObjectivePriorities: condition.objectiveExamPriorities.slice(0, 3),
    keyRedFlagIds: condition.redFlagTopicIds,
    evidenceStrengthTags: condition.evidenceStrengthTags,
    referenceIds: condition.referenceIds,
    lastReviewedIso: condition.lastReviewed.reviewedAtIso,
  };
}

export function buildReferenceMap(references: ReferenceCitation[]): Map<EntityId, ReferenceCitation> {
  return new Map(references.map((reference) => [reference.id, reference]));
}

export type ClinicalIndexes = {
  byId: Record<EntityId, ClinicalEntity>;
  conditionsByRegion: Record<EntityId, EntityId[]>;
  conditionToSpecialTests: Record<EntityId, EntityId[]>;
  conditionToTreatments: Record<EntityId, EntityId[]>;
};

export type ClinicalEntity =
  | BodyRegion
  | ClinicalCondition
  | SpecialTest
  | Treatment
  | ExerciseProgression
  | OutcomeMeasure
  | RedFlagReferralTopic
  | ReferenceCitation;

export function buildClinicalIndexes(store: ClinicalContentStore): ClinicalIndexes {
  const byId: ClinicalIndexes['byId'] = {};

  const addRecords = <T extends ClinicalEntity>(items: T[]) => {
    for (const item of items) byId[item.id] = item;
  };

  addRecords(store.bodyRegions);
  addRecords(store.conditions);
  addRecords(store.specialTests);
  addRecords(store.treatments);
  addRecords(store.exerciseProgressions);
  addRecords(store.outcomeMeasures);
  addRecords(store.redFlags);
  addRecords(store.references);

  const conditionsByRegion: ClinicalIndexes['conditionsByRegion'] = {};
  const conditionToSpecialTests: ClinicalIndexes['conditionToSpecialTests'] = {};
  const conditionToTreatments: ClinicalIndexes['conditionToTreatments'] = {};

  for (const condition of store.conditions) {
    conditionsByRegion[condition.bodyRegionId] = [...(conditionsByRegion[condition.bodyRegionId] || []), condition.id];
    conditionToSpecialTests[condition.id] = condition.specialTestIds;
    conditionToTreatments[condition.id] = [...new Set(condition.stageBasedManagement.flatMap((stage) => stage.treatmentIds))];
  }

  return { byId, conditionsByRegion, conditionToSpecialTests, conditionToTreatments };
}

import { getExerciseProgressionsWithContext, getTreatmentsWithContext } from '@/lib/clinicalModules';
import { getEntityHref } from '@/lib/entityRoutes';
import { getKnowledgeBaseItems } from '@/lib/kb';
import { getOutcomeMeasures } from '@/lib/outcomeMeasures';
import { getSpecialTests } from '@/lib/specialTests';
import { slugify } from '@/lib/utils';

export type SearchItem = {
  key: string;
  href: string;
  title: string;
  section: string;
  sectionLabel: string;
  region: string;
  aliases: string[];
  tags: string[];
  summary: string;
  excerpt: string;
  sourcePath: string;
  contentType: 'condition' | 'symptom-pattern' | 'body-region' | 'special-test' | 'treatment' | 'outcome-measure' | 'exercise-progression' | 'red-flag-topic' | 'general';
  phases: Array<'acute' | 'subacute' | 'chronic'>;
  population: 'sport' | 'general' | 'mixed';
  managementTrack: 'post-op' | 'non-op' | 'mixed';
};

type SearchCandidate = SearchItem & {
  priority: number;
};

function stagesToPhases(stages: string[]) {
  const phases = new Set<SearchItem['phases'][number]>();

  for (const stage of stages) {
    if (stage === 'acute-irritable' || stage === 'post-op-early') phases.add('acute');
    if (stage === 'subacute' || stage === 'post-op-late') phases.add('subacute');
    if (stage === 'chronic' || stage === 'return-to-sport') phases.add('chronic');
  }

  return [...phases];
}

function stageTrack(stages: string[]): SearchItem['managementTrack'] {
  const hasPostOp = stages.some((stage) => stage.startsWith('post-op'));
  const hasNonOp = stages.some((stage) => !stage.startsWith('post-op'));
  if (hasPostOp && hasNonOp) return 'mixed';
  return hasPostOp ? 'post-op' : 'non-op';
}

function candidateSections(items: SearchItem[]) {
  return [...new Map(items.map((item) => [item.section, item.sectionLabel])).entries()]
    .map(([slug, name]) => ({ slug, name, count: items.filter((item) => item.section === slug).length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function candidateRegions(items: SearchItem[]) {
  return [...new Set(items.map((item) => item.region))]
    .sort()
    .map((name) => ({ slug: slugify(name), name, count: items.filter((item) => item.region === name).length }));
}

function buildKbCandidates(): SearchCandidate[] {
  return getKnowledgeBaseItems().map((item) => {
    const href = getEntityHref(item.title) ?? `/content/${item.slug}`;

    return {
      key: `kb:${item.slug}`,
      href,
      title: item.title,
      section: item.section,
      sectionLabel: item.sectionLabel,
      region: item.region,
      aliases: item.aliases,
      tags: item.tags,
      summary: item.summary,
      excerpt: item.excerpt,
      sourcePath: item.sourcePath,
      contentType: item.contentType,
      phases: item.phases,
      population: item.population,
      managementTrack: item.managementTrack,
      priority: href.startsWith('/content/') ? 1 : 2,
    };
  });
}

function buildSpecialTestCandidates(): SearchCandidate[] {
  return getSpecialTests().map((test) => ({
    key: `special-test:${test.id}`,
    href: `/special-tests/${test.id}`,
    title: test.title,
    section: 'special-tests',
    sectionLabel: 'Special Tests',
    region: test.bodyRegionName,
    aliases: test.aliases,
    tags: [test.targetStructureOrDiagnosis, ...test.relatedConditions.map((condition) => condition.title)],
    summary: test.testPurpose,
    excerpt: `${test.positiveFinding} ${test.interpretation}`,
    sourcePath: `clinicalSeed/special-tests/${test.id}`,
    contentType: 'special-test',
    phases: [],
    population: 'mixed',
    managementTrack: 'mixed',
    priority: 3,
  }));
}

function buildTreatmentCandidates(): SearchCandidate[] {
  return getTreatmentsWithContext().map((treatment) => ({
    key: `treatment:${treatment.id}`,
    href: `/treatments/${treatment.id}`,
    title: treatment.title,
    section: 'treatments',
    sectionLabel: 'Treatments',
    region: treatment.bodyRegionNames[0] || 'General',
    aliases: treatment.aliases,
    tags: [...treatment.bodyRegionNames, ...treatment.relatedConditions.map((condition) => condition.title)],
    summary: treatment.whatItIs,
    excerpt: `${treatment.whenToUse[0] || ''} ${treatment.evidenceSummary}`.trim(),
    sourcePath: `clinicalSeed/treatments/${treatment.id}`,
    contentType: 'treatment',
    phases: stagesToPhases(treatment.stageRelevance),
    population: 'mixed',
    managementTrack: stageTrack(treatment.stageRelevance),
    priority: 3,
  }));
}

function buildExerciseProgressionCandidates(): SearchCandidate[] {
  return getExerciseProgressionsWithContext().map((progression) => ({
    key: `exercise-progression:${progression.id}`,
    href: `/exercise-progressions/${progression.id}`,
    title: progression.title,
    section: 'exercise-progressions',
    sectionLabel: 'Exercise Progressions',
    region: progression.bodyRegionNames[0] || 'General',
    aliases: progression.aliases,
    tags: [...progression.targetTissuesFunctions, ...progression.targetConditions.map((condition) => condition.title)],
    summary: progression.returnToFunctionRelevance,
    excerpt: `${progression.criteriaToAdvance[0] || ''} ${progression.evidenceNotes}`.trim(),
    sourcePath: `clinicalSeed/exercise-progressions/${progression.id}`,
    contentType: 'exercise-progression',
    phases: stagesToPhases([progression.stage]),
    population: 'mixed',
    managementTrack: stageTrack([progression.stage]),
    priority: 3,
  }));
}

function buildOutcomeMeasureCandidates(): SearchCandidate[] {
  return getOutcomeMeasures().map((measure) => ({
    key: `outcome-measure:${measure.id}`,
    href: `/outcome-measures/${measure.id}`,
    title: measure.title,
    section: 'outcome-measures',
    sectionLabel: 'Outcome Measures',
    region: measure.bodyRegionName,
    aliases: measure.aliases,
    tags: measure.relatedConditions.map((condition) => condition.title),
    summary: measure.population,
    excerpt: `${measure.scoring[0] || ''} ${measure.interpretation[0] || ''}`.trim(),
    sourcePath: `clinicalSeed/outcome-measures/${measure.id}`,
    contentType: 'outcome-measure',
    phases: [],
    population: 'general',
    managementTrack: 'mixed',
    priority: 3,
  }));
}

export function getSearchCatalog() {
  const candidates = [
    ...buildKbCandidates(),
    ...buildSpecialTestCandidates(),
    ...buildTreatmentCandidates(),
    ...buildExerciseProgressionCandidates(),
    ...buildOutcomeMeasureCandidates(),
  ];

  const byHref = new Map<string, SearchCandidate>();
  for (const candidate of candidates) {
    const existing = byHref.get(candidate.href);
    if (!existing || candidate.priority > existing.priority) {
      byHref.set(candidate.href, candidate);
    }
  }

  const items = [...byHref.values()]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(({ priority: _priority, ...item }) => item);

  return {
    items,
    regions: candidateRegions(items),
    sections: candidateSections(items),
  };
}

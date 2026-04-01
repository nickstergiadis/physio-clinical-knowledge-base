import type { KbItem } from '@/lib/kb';

export type EvidenceStrength = 'Strong' | 'Moderate' | 'Limited';

export type ConditionBlock = {
  id: string;
  title: string;
  items: string[];
};

export type StageBlock = {
  stage: 'Acute' | 'Subacute' | 'Late / Return to Performance';
  focus: string[];
};

export type ConditionPageSchema = {
  quickView: {
    clinicalSnapshot: string[];
    typicalPattern: string[];
    keyDifferentials: string[];
    examPriorities: string[];
    specialTests: string[];
    firstLineTreatment: string[];
    stageBasedRehab: StageBlock[];
    healingTimeline: string[];
    redFlags: string[];
  };
  deepView: ConditionBlock[];
  evidenceStrength: EvidenceStrength;
  stageCompleteness: {
    hasAcute: boolean;
    hasSubacute: boolean;
    hasLate: boolean;
  };
  certaintyWarnings: string[];
  residualMarkdown: string;
};

const HEADING_MAP: Array<{ key: string; match: RegExp[] }> = [
  { key: 'definition-overview', match: [/clinical summary/i, /overview/i, /definition/i] },
  { key: 'clinical-presentation', match: [/typical presentation/i, /presentation/i] },
  { key: 'subjective-clues', match: [/subjective/i, /history/i] },
  { key: 'objective-exam', match: [/objective/i, /exam/i] },
  { key: 'differential-diagnosis', match: [/differential/i] },
  { key: 'special-tests', match: [/special test/i] },
  { key: 'management', match: [/management/i, /treatment/i, /conservative/i] },
  { key: 'exercise-progression', match: [/progression/i, /rehab/i, /loading/i] },
  { key: 'prognosis-healing', match: [/prognosis/i, /timeline/i, /healing/i] },
  { key: 'referral-imaging', match: [/refer/i, /imaging/i] },
  { key: 'evidence-summary', match: [/evidence/i] },
  { key: 'citations', match: [/citation/i, /source link/i] },
  { key: 'red-flags', match: [/red flag/i, /when to refer/i, /when to reconsider/i] },
];

function sectionKey(heading: string) {
  const found = HEADING_MAP.find((entry) => entry.match.some((regex) => regex.test(heading)));
  return found?.key ?? 'notes';
}

function getBullets(text: string): string[] {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim());

  if (bullets.length > 0) return bullets;

  const paragraph = lines.join(' ').replace(/\s+/g, ' ').trim();
  return paragraph ? [paragraph] : [];
}

function splitSections(markdown: string): Array<{ heading: string; content: string }> {
  const parts = markdown.split(/\n(?=##\s+)/);
  return parts
    .map((part) => {
      const headingMatch = part.match(/^##\s+(.+)$/m);
      if (!headingMatch) return null;
      const heading = headingMatch[1].trim();
      const content = part.replace(/^##\s+.+$/m, '').trim();
      return { heading, content };
    })
    .filter(Boolean) as Array<{ heading: string; content: string }>;
}

function toStageBlocks(items: string[]): StageBlock[] {
  const stages: StageBlock[] = [
    { stage: 'Acute', focus: [] },
    { stage: 'Subacute', focus: [] },
    { stage: 'Late / Return to Performance', focus: [] },
  ];

  for (const item of items) {
    const lower = item.toLowerCase();
    if (/(acute|irritable|high pain|high irritability)/.test(lower)) stages[0].focus.push(item);
    else if (/(subacute|rebuild|progress)/.test(lower)) stages[1].focus.push(item);
    else if (/(late|return|heavy|power|performance|sport)/.test(lower)) stages[2].focus.push(item);
    else stages[1].focus.push(item);
  }

  return stages.filter((stage) => stage.focus.length > 0);
}

function inferEvidenceStrength(item: KbItem, evidenceItems: string[]): EvidenceStrength {
  const haystack = `${item.markdown} ${evidenceItems.join(' ')}`.toLowerCase();
  const hasMeta = /(meta-analysis|systematic review|consensus)/.test(haystack);
  if (item.citations.length >= 4 && hasMeta) return 'Strong';
  if (item.citations.length >= 2) return 'Moderate';
  return 'Limited';
}

export function buildConditionPageSchema(item: KbItem): ConditionPageSchema {
  const sections = splitSections(item.markdown);

  const byKey = new Map<string, string[]>();
  for (const section of sections) {
    const key = sectionKey(section.heading);
    const values = byKey.get(key) ?? [];
    values.push(...getBullets(section.content));
    byKey.set(key, values);
  }

  const management = byKey.get('management') ?? [];
  const progression = byKey.get('exercise-progression') ?? [];
  const evidenceItems = byKey.get('evidence-summary') ?? byKey.get('citations') ?? [];

  const stageBased = toStageBlocks(progression.length > 0 ? progression : management);
  const stageNames = stageBased.map((stage) => stage.stage);
  const certaintyWarnings = [
    /\b(always|never|guaranteed|definitive|certainly)\b/i.test(item.markdown)
      ? 'Source language includes high-certainty wording. Confirm applicability to individual patient context.'
      : '',
    /\b(will recover|full recovery expected in)\b/i.test(item.markdown)
      ? 'Prognosis wording may overstate certainty. Frame timelines as ranges tied to reassessment findings.'
      : '',
  ].filter(Boolean);

  const deepView: ConditionBlock[] = [
    { id: 'definition-overview', title: 'Definition / Overview', items: byKey.get('definition-overview') ?? [item.summary] },
    { id: 'clinical-presentation', title: 'Clinical Presentation', items: byKey.get('clinical-presentation') ?? [] },
    { id: 'subjective-clues', title: 'Subjective Clues', items: byKey.get('subjective-clues') ?? [] },
    { id: 'objective-exam', title: 'Objective Exam', items: byKey.get('objective-exam') ?? [] },
    { id: 'differential-diagnosis', title: 'Differential Diagnosis', items: byKey.get('differential-diagnosis') ?? [] },
    { id: 'special-tests', title: 'Special Tests', items: byKey.get('special-tests') ?? [] },
    { id: 'management', title: 'Management', items: management },
    { id: 'exercise-progression', title: 'Exercise Progression by Stage', items: progression },
    { id: 'prognosis-healing', title: 'Prognosis / Healing Timeline', items: byKey.get('prognosis-healing') ?? [] },
    { id: 'referral-imaging', title: 'Referral / Imaging Considerations', items: byKey.get('referral-imaging') ?? byKey.get('red-flags') ?? [] },
    { id: 'evidence-summary', title: 'Evidence Summary', items: evidenceItems },
    { id: 'citations', title: 'Citations', items: item.citations.map((c) => c.label) },
  ];

  const residualMarkdown = item.markdown
    .split('\n')
    .filter((line) => !line.startsWith('## '))
    .join('\n')
    .trim();

  return {
    quickView: {
      clinicalSnapshot: byKey.get('definition-overview') ?? [item.summary],
      typicalPattern: byKey.get('clinical-presentation') ?? [],
      keyDifferentials: byKey.get('differential-diagnosis') ?? [],
      examPriorities: byKey.get('objective-exam') ?? [],
      specialTests: byKey.get('special-tests') ?? [],
      firstLineTreatment: management,
      stageBasedRehab: stageBased,
      healingTimeline: byKey.get('prognosis-healing') ?? [],
      redFlags: byKey.get('red-flags') ?? byKey.get('referral-imaging') ?? [],
    },
    deepView,
    evidenceStrength: inferEvidenceStrength(item, evidenceItems),
    stageCompleteness: {
      hasAcute: stageNames.includes('Acute'),
      hasSubacute: stageNames.includes('Subacute'),
      hasLate: stageNames.includes('Late / Return to Performance'),
    },
    certaintyWarnings,
    residualMarkdown,
  };
}

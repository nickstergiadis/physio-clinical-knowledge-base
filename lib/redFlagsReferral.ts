export type EscalationLevel = 'emergency' | 'same-day' | 'routine';

export type EscalationItem = {
  level: EscalationLevel;
  title: string;
  actions: string[];
};

export type RedFlagReferralPage = {
  slug: string;
  title: string;
  summary: string;
  bodyRegionSlug?: string;
  urgentEmergencyRedFlags: string[];
  sameDayReferralTriggers: string[];
  routineReferralConsiderations: string[];
  keyHistoryExamItems: string[];
  documentationSafetyNet: string[];
  relatedPages: { label: string; href: string; note?: string }[];
  references: { label: string; detail?: string }[];
};

export const RED_FLAG_REFERRAL_PAGES: RedFlagReferralPage[] = [
  {
    slug: 'lumbar-spine',
    title: 'Lumbar spine red flags / referral',
    summary: 'Point-of-care triage support for low back presentations, with escalation thresholds and documentation prompts.',
    bodyRegionSlug: 'lumbar-spine',
    urgentEmergencyRedFlags: [
      'Possible cauda equina syndrome: new urinary retention/incontinence, fecal incontinence, saddle anesthesia, or rapidly progressive bilateral leg weakness.',
      'Suspected abdominal aortic aneurysm or rupture pattern: severe non-mechanical back/abdominal pain with collapse, syncope, hypotension, or pulsatile abdominal mass.',
      'Spinal infection/sepsis concern with neurological change: severe constant pain plus fever/rigors, immunosuppression, IVDU, recent spinal procedure, or systemic toxicity.',
      'Unstable vertebral fracture concern after significant trauma or in high-risk bone fragility with inability to mobilize and severe focal tenderness.',
    ],
    sameDayReferralTriggers: [
      'Severe/progressive motor deficit (e.g., worsening foot drop or multimyotomal weakness) even without full cauda equina features.',
      'High suspicion of malignancy (history of cancer, unexplained weight loss, persistent night/rest pain, failure to improve with appropriate early care).',
      'Systemic inflammatory/infective features with substantial lumbar pain but hemodynamically stable presentation.',
      'Suspected vertebral compression fracture in older/adult-on-steroids populations with new severe pain and functional decline.',
    ],
    routineReferralConsiderations: [
      'Persistent disabling pain/function loss despite guideline-concordant conservative management (commonly 6 to 12 weeks).',
      'Ongoing radicular pain not improving or worsening despite active rehab and medication optimization discussion with primary care.',
      'Diagnostic uncertainty after initial assessment cycle, especially when symptoms are disproportionate or atypical for mechanical loading response.',
      'Need for multidisciplinary input (pain medicine, psychology, rheumatology, spinal specialist) when psychosocial or medical complexity is high.',
    ],
    keyHistoryExamItems: [
      'Bladder/bowel function, saddle sensation, sexual dysfunction change, and progression pattern of neurological symptoms.',
      'Cancer/infection/fracture risk history: prior cancer, steroid use, osteoporosis risk, trauma mechanism, fever/chills, IVDU, recent procedures.',
      'Focused neurological exam: myotomes, dermatomes, reflexes, neurodynamic signs, gait changes, and serial comparison at follow-up.',
      'Pain behavior/mechanical pattern: constant non-mechanical pain, inability to find easing position, night/rest dominance, and marked irritability.',
    ],
    documentationSafetyNet: [
      'Document what was screened and found: “Lumbar red-flag screen completed; no current CES/infection/fracture/malignancy indicators identified today.”',
      'When escalating, record urgency and destination: “Advised immediate ED assessment for possible CES due to [specific findings]; patient informed of urgency.”',
      'Provide explicit return precautions: worsening weakness, new numbness in saddle area, bladder/bowel change, fever/systemic deterioration, or uncontrolled pain.',
      'For non-urgent pathways, document agreed review window and escalation plan if trajectory worsens before planned reassessment.',
    ],
    relatedPages: [
      { label: 'Lumbar Spine hub', href: '/body-regions/lumbar-spine', note: 'Region overview and linked conditions.' },
      { label: 'Nonspecific low back pain', href: '/content/low-back-pain-sciatica' },
      { label: 'Lumbar radicular pain / sciatica', href: '/content/lumbar-radicular-pain-sciatica' },
      { label: 'Search source-linked content', href: '/search' },
    ],
    references: [
      { label: 'NICE Guideline NG59: Low back pain and sciatica in over 16s', detail: 'Referral/imaging and management thresholds.' },
      { label: 'NICE Clinical Knowledge Summary: Cauda equina syndrome', detail: 'Urgent recognition and emergency action cues.' },
      { label: 'ACP guideline for low back pain', detail: 'Primary-care and conservative management escalation context.' },
      { label: 'International Framework for Red Flags for Potential Serious Spinal Pathologies', detail: 'Structured serious pathology screening approach.' },
    ],
  },
];

export function getRedFlagReferralPageBySlug(slug: string) {
  return RED_FLAG_REFERRAL_PAGES.find((page) => page.slug === slug);
}

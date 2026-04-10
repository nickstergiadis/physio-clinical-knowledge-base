export type BodyRegionHub = {
  slug: string;
  name: string;
  commonConditions: string[];
  highYieldSpecialTests: string[];
  commonDifferentials: string[];
  commonTreatments: string[];
  exerciseProgressionCategories: string[];
  keyRedFlags: string[];
  relevantOutcomeMeasures: string[];
  highYieldSummary: string[];
  recallCards: { prompt: string; answer: string; relatedEntities?: string[] }[];
};

export const BODY_REGION_HUBS: BodyRegionHub[] = [
  {
    slug: 'shoulder',
    name: 'Shoulder',
    commonConditions: ['Rotator cuff related shoulder pain', 'Subacromial pain syndrome', 'Adhesive capsulitis', 'Shoulder instability'],
    highYieldSpecialTests: ['Painful arc', 'External rotation lag sign', "Hawkins-Kennedy", "Apprehension / relocation"],
    commonDifferentials: ['Cervical radiculopathy referral', 'Acromioclavicular joint pain', 'Long-head biceps tendinopathy', 'Referred cardiac / diaphragmatic pain'],
    commonTreatments: ['Load-managed rotator cuff strengthening', 'Scapular motor control interventions', 'Manual therapy adjuncts for pain modulation', 'Activity modification and graded return'],
    exerciseProgressionCategories: ['Isometric pain modulation', 'Isotonic cuff/scapular loading', 'Overhead control and endurance', 'Return-to-sport power / perturbation'],
    keyRedFlags: ['Acute traumatic dislocation with neurovascular findings', 'Unexplained night pain with systemic features', 'Suspected fracture after trauma', 'Progressive neurological deficit'],
    relevantOutcomeMeasures: ['SPADI', 'QuickDASH', 'Numeric Pain Rating Scale'],
    highYieldSummary: ['Prioritize active range, irritability, and traumatic vs non-traumatic onset.', 'Use a cluster of history + exam findings rather than single-test diagnosis.'],
    recallCards: [
      { prompt: 'Most useful first-line shoulder outcomes?', answer: 'Use a region PROM plus a pain scale baseline.', relatedEntities: ['SPADI', 'QuickDASH'] },
      { prompt: 'Common initial loading strategy for irritable cuff pain?', answer: 'Begin with isometrics and low-range isotonic work, then progress load and range.' },
    ],
  },
  {
    slug: 'elbow-wrist-hand',
    name: 'Elbow / Wrist / Hand',
    commonConditions: ['Lateral elbow tendinopathy', 'Medial elbow tendinopathy', 'Carpal tunnel syndrome', 'Thumb CMC osteoarthritis'],
    highYieldSpecialTests: ['Cozen test', 'Maudsley test', 'Phalen test', 'Tinel at carpal tunnel'],
    commonDifferentials: ['Cervical radiculopathy', 'Radial tunnel syndrome', 'Ulnar neuropathy', 'Inflammatory arthropathy'],
    commonTreatments: ['Tendon load progression', 'Nerve-gliding and interface management', 'Splinting / orthotic support as indicated', 'Task ergonomics and graded exposure'],
    exerciseProgressionCategories: ['Pain-limited isometrics', 'Concentric-eccentric tendon loading', 'Grip and dexterity integration', 'Functional work/sport simulation'],
    keyRedFlags: ['Acute deformity after fall', 'Progressive motor weakness / thenar wasting', 'Infection signs after wound', 'Compartment syndrome indicators'],
    relevantOutcomeMeasures: ['PRTEE', 'QuickDASH', 'Boston Carpal Tunnel Questionnaire'],
    highYieldSummary: ['Differentiate tendon overload from nerve entrapment early.', 'Grip tolerance and work demands should guide progression speed.'],
    recallCards: [
      { prompt: 'Two high-yield tests for lateral elbow tendinopathy?', answer: 'Use these provocation tests as adjuncts within the broader exam cluster.', relatedEntities: ['Cozen Test', 'Maudsley Test'] },
      { prompt: 'When to prioritize urgent referral in hand complaints?', answer: 'Rapid neurological loss, major trauma deformity, or suspected infection.' },
    ],
  },
  {
    slug: 'cervical-spine',
    name: 'Cervical Spine',
    commonConditions: ['Mechanical neck pain', 'Cervical radiculopathy', 'Cervicogenic headache', 'Whiplash-associated disorder'],
    highYieldSpecialTests: ['Cervical rotation ROM', 'Spurling test', 'Upper limb neurodynamic tests', 'Cervical distraction response'],
    commonDifferentials: ['Shoulder pathology referral', 'Thoracic outlet presentation', 'Vestibular contribution', 'Serious vascular pathology'],
    commonTreatments: ['Deep neck flexor endurance training', 'Cervical-thoracic mobility exercise', 'Manual therapy where appropriate', 'Postural and activity pacing strategies'],
    exerciseProgressionCategories: ['Symptom calming and mobility', 'Endurance and control retraining', 'Load tolerance in functional positions', 'Work/sport specific conditioning'],
    keyRedFlags: ['Myelopathic signs', 'Suspected cervical arterial dysfunction', 'Unrelenting pain with systemic symptoms', 'Progressive bilateral neurological deficits'],
    relevantOutcomeMeasures: ['Neck Disability Index', 'Patient-Specific Functional Scale', 'Numeric Pain Rating Scale'],
    highYieldSummary: ['Screen myelopathy and vascular risk before mechanical loading.', 'Cluster radiculopathy findings to improve diagnostic confidence.'],
    recallCards: [
      { prompt: 'Core disability measure for neck pain?', answer: 'Use the core disability measure alongside symptom and ROM tracking.', relatedEntities: ['Neck Disability Index'] },
      { prompt: 'Critical early rule-out in cervical exam?', answer: 'Myelopathy and vascular red flags.' },
    ],
  },
  {
    slug: 'thoracic-spine',
    name: 'Thoracic Spine',
    commonConditions: ['Thoracic pain syndrome', 'Postural thoracic dysfunction', 'Rib dysfunction', 'Thoracic radicular pain (less common)'],
    highYieldSpecialTests: ['Thoracic extension-rotation assessment', 'Rib spring / symptom provocation', 'Repeated movement response', 'Neural screen when indicated'],
    commonDifferentials: ['Cervical referral', 'Cardiopulmonary sources', 'Visceral referral', 'Herpes zoster prodrome'],
    commonTreatments: ['Thoracic mobility drills', 'Breathing mechanics retraining', 'Manual therapy adjuncts', 'Postural endurance loading'],
    exerciseProgressionCategories: ['Mobility and symptom reduction', 'Segmental control', 'Integrated trunk strength/endurance', 'Functional lifting and rotation tolerance'],
    keyRedFlags: ['Trauma with suspected fracture', 'Unexplained thoracic night pain', 'Cardiorespiratory warning symptoms', 'Progressive neurological signs'],
    relevantOutcomeMeasures: ['Patient-Specific Functional Scale', 'Numeric Pain Rating Scale', 'Oswestry Disability Index (when linked with thoracolumbar complaints)'],
    highYieldSummary: ['Thoracic pain often needs broad differential screening.', 'Pair mobility gains with endurance to reduce symptom recurrence.'],
    recallCards: [
      { prompt: 'Why keep thoracic differential broad?', answer: 'Because thoracic symptoms can reflect cardiopulmonary or visceral pathology.' },
      { prompt: 'Common progression miss in thoracic rehab?', answer: 'Stopping at mobility and not adding endurance/control loading.' },
    ],
  },
  {
    slug: 'lumbar-spine',
    name: 'Lumbar Spine',
    commonConditions: ['Nonspecific low back pain', 'Lumbar radicular pain', 'Lumbar spinal stenosis', 'Spondylolysis/spondylolisthesis (selected populations)'],
    highYieldSpecialTests: ['Repeated movement exam', 'Slump test', 'Straight leg raise', 'Neurological myotome/reflex screen'],
    commonDifferentials: ['Hip-related pain', 'Sacroiliac joint mediated pain', 'Visceral referral', 'Inflammatory spinal condition'],
    commonTreatments: ['Education and reassurance', 'Graded activity and walking tolerance', 'Directional preference-informed exercise', 'Trunk and hip strength/endurance progression'],
    exerciseProgressionCategories: ['Symptom modification', 'Capacity building', 'Integrated functional patterns', 'Return-to-work / sport resilience'],
    keyRedFlags: ['Cauda equina features', 'History of cancer with new severe back pain', 'Major trauma or suspected fracture', 'Systemic infection indicators'],
    relevantOutcomeMeasures: ['Oswestry Disability Index', 'Roland-Morris Disability Questionnaire', 'STarT Back (risk stratification)'],
    highYieldSummary: ['Most low back pain responds to active management and progressive loading.', 'Use neuro screen repeatedly when radicular symptoms are present.'],
    recallCards: [
      { prompt: 'Urgent lumbar referral concern?', answer: 'Cauda equina signs (e.g., saddle anesthesia, bladder/bowel changes).' },
      { prompt: 'Core lumbar disability outcome?', answer: 'Use the core lumbar disability outcome alongside function tracking.', relatedEntities: ['Oswestry Disability Index'] },
    ],
  },
  {
    slug: 'hip',
    name: 'Hip',
    commonConditions: ['Gluteal tendinopathy', 'Hip osteoarthritis', 'Femoroacetabular impingement syndrome', 'Adductor-related groin pain'],
    highYieldSpecialTests: ['FADIR', 'FABER', 'Single-leg stance/load response', 'Resisted adduction provocation'],
    commonDifferentials: ['Lumbar referral', 'Sacroiliac contribution', 'Intra-articular vs extra-articular pain source', 'Stress fracture in high-load populations'],
    commonTreatments: ['Progressive hip abductor and extensor loading', 'Mobility and movement strategy modification', 'Load management for groin pain', 'Gait retraining when indicated'],
    exerciseProgressionCategories: ['Isometric symptom modulation', 'Strength in tolerated ranges', 'Single-leg control and frontal-plane capacity', 'Plyometric / return-to-running progression'],
    keyRedFlags: ['Inability to weight-bear after trauma', 'Suspected femoral neck stress fracture', 'Systemic symptoms with deep hip pain', 'Rapid functional decline'],
    relevantOutcomeMeasures: ['HOOS Jr / HOOS', 'iHOT-12', 'Hip Outcome Score'],
    highYieldSummary: ['Differentiate intra-articular and lateral hip tendon pain early.', 'Progress single-leg load tolerance before running and cutting tasks.'],
    recallCards: [
      { prompt: 'High-yield provocative test for anterior hip pain?', answer: 'FADIR test.' },
      { prompt: 'Key progression milestone before running return?', answer: 'Confident single-leg control and load tolerance.' },
    ],
  },
  {
    slug: 'knee',
    name: 'Knee',
    commonConditions: ['Patellofemoral pain', 'Meniscal pathology', 'ACL injury / post-operative rehab', 'Knee osteoarthritis'],
    highYieldSpecialTests: ['Thessaly (appropriately selected)', 'Lachman', 'Patellar compression / symptom provocation', 'Step-down movement assessment'],
    commonDifferentials: ['Hip weakness referral', 'Lumbar radicular contribution', 'Referred pain from pes anserine region', 'Inflammatory arthropathy'],
    commonTreatments: ['Quadriceps and hip strengthening', 'Neuromuscular retraining', 'Manual therapy adjuncts for mobility', 'Load and impact progression planning'],
    exerciseProgressionCategories: ['Pain-modulated strength entry', 'Closed-chain load progression', 'Dynamic control and deceleration', 'Return-to-run / sport criteria progression'],
    keyRedFlags: ['Locked knee after trauma', 'Septic joint suspicion (hot swollen knee + systemic features)', 'DVT concern in post-op or immobilized patient', 'Neurovascular compromise after injury'],
    relevantOutcomeMeasures: ['KOOS / KOOS Jr', 'IKDC', 'Lower Extremity Functional Scale'],
    highYieldSummary: ['Match rehab phase to irritability and tissue healing stage.', 'Use objective strength/function criteria for return-to-sport decisions.'],
    recallCards: [
      { prompt: 'Primary ligament integrity test after acute ACL injury?', answer: 'Start with the primary ACL integrity test, then interpret it with mechanism and effusion timing.', relatedEntities: ['Lachman Test'] },
      { prompt: 'Common knee function outcome tools?', answer: 'KOOS/KOOS Jr and IKDC.' },
    ],
  },
  {
    slug: 'ankle-foot',
    name: 'Ankle / Foot',
    commonConditions: ['Lateral ankle sprain', 'Achilles tendinopathy', 'Plantar heel pain', 'Posterior tibial tendon dysfunction'],
    highYieldSpecialTests: ['Anterior drawer (ankle)', 'Talar tilt', 'Single-leg heel raise capacity', 'Windlass mechanism provocation'],
    commonDifferentials: ['Lumbar radicular referral', 'Midfoot injury', 'Stress fracture', 'Peripheral neuropathic pain'],
    commonTreatments: ['Early protected loading after sprain', 'Progressive calf loading', 'Foot intrinsic and balance training', 'Running load modification and return plan'],
    exerciseProgressionCategories: ['Range and swelling management', 'Strength and tendon capacity', 'Balance/proprioception retraining', 'Plyometric and change-of-direction readiness'],
    keyRedFlags: ['Inability to weight-bear with Ottawa-rule concern', 'Suspected Achilles rupture', 'Neurovascular compromise', 'Open injury or infection signs'],
    relevantOutcomeMeasures: ['FAAM', 'LEFS', 'VISA-A (Achilles tendinopathy)'],
    highYieldSummary: ['Restore dorsiflexion and calf capacity early to prevent chronic symptoms.', 'Balance and hopping metrics are useful before full sport return.'],
    recallCards: [
      { prompt: 'Core acute ankle instability tests?', answer: 'Anterior drawer and talar tilt.' },
      { prompt: 'Useful Achilles tendinopathy outcome?', answer: 'VISA-A.' },
    ],
  },
];

export function getBodyRegionHubBySlug(slug: string) {
  return BODY_REGION_HUBS.find((hub) => hub.slug === slug);
}

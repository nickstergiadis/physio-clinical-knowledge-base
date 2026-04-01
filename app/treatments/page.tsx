import { TreatmentsLibrary } from '@/components/clinical/TreatmentsLibrary';
import { getConditionFilterOptions, getRegionFilterOptions, getTreatmentsWithContext } from '@/lib/clinicalModules';

export default function TreatmentsPage() {
  const treatments = getTreatmentsWithContext();
  const regions = getRegionFilterOptions();
  const conditions = getConditionFilterOptions();

  return (
    <>
      <header>
        <h1>Treatments Library</h1>
        <p className="muted">Stage-aware treatment guidance with indications, precautions, and evidence summaries linked to condition pages.</p>
      </header>
      <TreatmentsLibrary treatments={treatments} regions={regions} conditions={conditions} />
    </>
  );
}

import { ExerciseProgressionsLibrary } from '@/components/clinical/ExerciseProgressionsLibrary';
import { getConditionFilterOptions, getExerciseProgressionsWithContext, getRegionFilterOptions } from '@/lib/clinicalModules';

export default function ExerciseProgressionsPage() {
  const progressions = getExerciseProgressionsWithContext();
  const regions = getRegionFilterOptions();
  const conditions = getConditionFilterOptions();

  return (
    <>
      <header>
        <h1>Exercise Progressions Library</h1>
        <p className="muted">Clinically reasoned progressions and regressions by condition, impairment target, and rehab stage.</p>
      </header>
      <ExerciseProgressionsLibrary progressions={progressions} regions={regions} conditions={conditions} />
    </>
  );
}

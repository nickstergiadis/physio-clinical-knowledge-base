import { SpecialTestsLibrary } from '@/components/special-tests/SpecialTestsLibrary';
import { getBodyRegionFilterOptions, getSpecialTests, getTargetFilterOptions } from '@/lib/specialTests';

export default function SpecialTestsPage() {
  const tests = getSpecialTests();

  return (
    <>
      <header>
        <h1>Special Tests Library</h1>
        <p className="muted">
          Practical special tests with clinical context: when to use them, what they help answer, how to perform them,
          and how to interpret them alongside the rest of your exam.
        </p>
      </header>

      <SpecialTestsLibrary
        tests={tests}
        regionOptions={getBodyRegionFilterOptions()}
        targetOptions={getTargetFilterOptions()}
      />
    </>
  );
}

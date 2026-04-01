'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { SpecialTestWithContext } from '@/lib/specialTests';

type SpecialTestsLibraryProps = {
  tests: SpecialTestWithContext[];
  regionOptions: Array<{ id: string; name: string }>;
  targetOptions: string[];
};

export function SpecialTestsLibrary({ tests, regionOptions, targetOptions }: SpecialTestsLibraryProps) {
  const [regionFilter, setRegionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      if (regionFilter !== 'all' && test.bodyRegionId !== regionFilter) return false;
      if (targetFilter !== 'all' && test.targetStructureOrDiagnosis !== targetFilter) return false;
      return true;
    });
  }, [tests, regionFilter, targetFilter]);

  return (
    <section className="grid" aria-label="Special tests library">
      <article className="card">
        <h2>Browse tests quickly</h2>
        <p className="muted">Filter by region and target diagnosis/structure to find the right test in seconds.</p>
        <div className="grid two">
          <label>
            Body region
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option value="all">All regions</option>
              {regionOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>

          <label>
            Target diagnosis / structure
            <select value={targetFilter} onChange={(event) => setTargetFilter(event.target.value)}>
              <option value="all">All targets</option>
              {targetOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article className="card">
        <h2>Library ({filteredTests.length})</h2>
        {filteredTests.length === 0 ? (
          <p className="empty-state">No tests match these filters yet. Try clearing one filter.</p>
        ) : (
          <div className="grid two">
            {filteredTests.map((test) => (
              <Link key={test.id} href={`/special-tests/${test.id}`} className="link-card card quick-card">
                <h3>{test.title}</h3>
                <p><strong>Region:</strong> {test.bodyRegionName}</p>
                <p><strong>Purpose:</strong> {test.testPurpose}</p>
                <p><strong>Positive finding:</strong> {test.positiveFinding}</p>
                <p className="muted"><strong>Use for:</strong> {test.targetStructureOrDiagnosis}</p>
              </Link>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

import clsx from 'clsx';
import type { EvidenceStrength } from '@/lib/clinicalContentModel';
import { evidenceTagClassName, evidenceTagLabel } from '@/lib/evidence';

export function EvidenceStrengthTags({ tags }: { tags: EvidenceStrength[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="badge-row" aria-label="Evidence strength tags">
      {tags.map((tag) => (
        <span key={tag} className={clsx('evidence-chip', evidenceTagClassName(tag))}>
          {evidenceTagLabel(tag)}
        </span>
      ))}
    </div>
  );
}

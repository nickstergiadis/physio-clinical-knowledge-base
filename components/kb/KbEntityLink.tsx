import Link from 'next/link';
import { getEntityHref } from '@/lib/entityRoutes';

type KbEntityLinkProps = {
  label: string;
  unresolvedBehavior?: 'search' | 'unavailable';
};

export function KbEntityLink({ label, unresolvedBehavior = 'search' }: KbEntityLinkProps) {
  const href = getEntityHref(label);

  if (!href && unresolvedBehavior === 'unavailable') {
    return (
      <span className="kb-entity-unavailable" aria-label={`${label} (coming soon)`}>
        {label}
        <span className="kb-entity-unavailable__tag">Coming soon</span>
      </span>
    );
  }

  return (
    <Link className="kb-entity-link" href={href ?? `/search?q=${encodeURIComponent(label)}`}>
      {label}
    </Link>
  );
}

import Link from 'next/link';
import type { Route } from 'next';
import { getEntityHref } from '@/lib/entityRoutes';
import { buildSearchRoute } from '@/lib/searchRouting';

type KbEntityLinkProps = {
  label: string;
  unresolvedBehavior?: 'search' | 'unavailable';
};

export function KbEntityLink({ label, unresolvedBehavior = 'search' }: KbEntityLinkProps) {
  const href = getEntityHref(label);
  const fallbackHref = buildSearchRoute({ q: label });

  if (!href && unresolvedBehavior === 'unavailable') {
    return (
      <span className="kb-entity-unavailable" aria-label={`${label} (coming soon)`}>
        {label}
        <span className="kb-entity-unavailable__tag">Coming soon</span>
      </span>
    );
  }

  return (
    <Link className="kb-entity-link" href={(href ?? fallbackHref) as Route}>
      {label}
    </Link>
  );
}

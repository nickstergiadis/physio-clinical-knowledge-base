import Link from 'next/link';
import { getEntityHref } from '@/lib/entityRoutes';

type KbEntityLinkProps = {
  label: string;
};

export function KbEntityLink({ label }: KbEntityLinkProps) {
  const href = getEntityHref(label);

  if (!href) {
    return (
      <Link className="kb-entity-link" href={`/search?q=${encodeURIComponent(label)}`}>
        {label}
      </Link>
    );
  }

  return (
    <Link className="kb-entity-link" href={href}>
      {label}
    </Link>
  );
}

import Link from 'next/link';
import { getEntityHref } from '@/lib/entityRoutes';

type KbEntityLinkProps = {
  label: string;
};

export function KbEntityLink({ label }: KbEntityLinkProps) {
  const href = getEntityHref(label);

  if (!href) {
    return <span className="kb-entity-text">{label}</span>;
  }

  return (
    <Link className="kb-entity-link" href={href}>
      {label}
    </Link>
  );
}

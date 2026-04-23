'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';

type SearchFormProps = {
  className: string;
  ariaLabel: string;
  inputId: string;
  label: string;
  placeholder: string;
};

export function SearchForm({ className, ariaLabel, inputId, label, placeholder }: SearchFormProps) {
  const router = useRouter();

  const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

  function detectRuntimeBasePath() {
    if (typeof window === 'undefined') return '';
    if (!window.location.hostname.endsWith('github.io')) return '';

    const firstSegment = window.location.pathname.split('/').filter(Boolean)[0];
    return firstSegment ? `/${firstSegment}` : '';
  }

  const basePath = configuredBasePath || detectRuntimeBasePath();
  const searchAction = `${basePath}/search/`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const queryValue = formData.get('q');
    const query = typeof queryValue === 'string' ? queryValue.trim() : '';
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    const suffix = searchParams.toString();

    router.push(suffix ? `${searchAction}?${suffix}` : searchAction);
  };

  return (
    <form action={searchAction} method="get" onSubmit={onSubmit} role="search" className={className} aria-label={ariaLabel}>
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <input id={inputId} name="q" type="search" placeholder={placeholder} />
      <button type="submit">Search</button>
    </form>
  );
}

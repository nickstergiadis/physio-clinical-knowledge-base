'use client';

import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';

function withBasePath(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${configuredBasePath}${normalizedPath}`;
}

type SearchFormProps = {
  className: string;
  ariaLabel: string;
  inputId: string;
  label: string;
  placeholder: string;
};

export function SearchForm({ className, ariaLabel, inputId, label, placeholder }: SearchFormProps) {
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const queryValue = formData.get('q');
    const query = typeof queryValue === 'string' ? queryValue.trim() : '';
    const baseSearchPath = withBasePath('/search');

    router.push(query ? `${baseSearchPath}?q=${encodeURIComponent(query)}` : baseSearchPath);
  };

  return (
    <form onSubmit={onSubmit} role="search" className={className} aria-label={ariaLabel}>
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <input id={inputId} name="q" type="search" placeholder={placeholder} />
      <button type="submit">Search</button>
    </form>
  );
}

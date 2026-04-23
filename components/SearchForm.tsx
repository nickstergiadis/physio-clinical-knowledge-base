'use client';

import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
    const searchParams = new URLSearchParams();
    if (query) searchParams.set('q', query);
    const suffix = searchParams.toString();

    router.push(suffix ? `/search?${suffix}` : '/search');
  };

  return (
    <form onSubmit={onSubmit} role="search" className={className} aria-label={ariaLabel}>
      <label htmlFor={inputId} className="sr-only">{label}</label>
      <input id={inputId} name="q" type="search" placeholder={placeholder} />
      <button type="submit">Search</button>
    </form>
  );
}

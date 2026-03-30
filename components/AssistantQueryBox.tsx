'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type AssistantApiResponse = {
  answer: string;
  confidence: number;
  lowConfidence: boolean;
  fallbackSearchUrl?: string;
  disclaimer: string;
  sources: Array<{
    id: string;
    slug: string;
    title: string;
    sourcePath: string;
  }>;
};

export function AssistantQueryBox() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssistantApiResponse | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/assistant-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error('Assistant request failed.');

      const data = (await res.json()) as AssistantApiResponse;
      setResult(data);
    } catch {
      setError('Assistant unavailable. Please use standard search below.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" aria-labelledby="assistant-query-title" style={{ marginBottom: '1rem' }}>
      <h2 id="assistant-query-title">Ask the internal assistant (optional)</h2>
      <p className="muted">
        This layer summarizes existing repository content. Structured database search remains primary.
      </p>

      <form onSubmit={onSubmit}>
        <label htmlFor="assistant-query">Natural-language question</label>
        <input
          id="assistant-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. What are key assessment priorities for patellofemoral pain?"
        />
        <div style={{ marginTop: '0.75rem' }}>
          <button type="submit" disabled={loading}>{loading ? 'Working…' : 'Ask assistant'}</button>
        </div>
      </form>

      {error && <p role="alert">{error}</p>}

      {result && (
        <div className="assistant-response" aria-live="polite" style={{ marginTop: '1rem' }}>
          <h3>Assistant response</h3>
          <p>{result.answer}</p>
          <p className="muted">{result.disclaimer}</p>

          {result.lowConfidence && result.fallbackSearchUrl && (
            <p>
              Confidence was low. Use{' '}
              <Link href={result.fallbackSearchUrl}>
                standard search results for “{query}”
              </Link>
              .
            </p>
          )}

          <h4>Sources used</h4>
          {result.sources.length === 0 ? (
            <p>No source pages were used.</p>
          ) : (
            <ul>
              {result.sources.map((source) => (
                <li key={source.id}>
                  <Link href={`/content/${source.slug}`}>{source.title}</Link>
                  {' · '}
                  <code>{source.sourcePath}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

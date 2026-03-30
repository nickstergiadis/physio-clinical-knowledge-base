import { searchContent } from '@/lib/data';

const INTERNAL_DISCLAIMER =
  'Internal knowledge-base assistant: this response summarizes repository content and does not replace clinical judgment.';

export type AssistantSource = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  sourcePath: string;
};

export type AssistantResponse = {
  answer: string;
  confidence: number;
  lowConfidence: boolean;
  fallbackSearchUrl?: string;
  disclaimer: string;
  sources: AssistantSource[];
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function toQueryTerms(query: string): string[] {
  return normalizeWhitespace(query)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
}

function stripMarkdown(markdown: string): string {
  return normalizeWhitespace(
    markdown
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]+`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]+\]\([^)]*\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/[>*_~]/g, ' '),
  );
}

function buildExtractiveSummary(query: string, markdown: string, fallbackExcerpt?: string | null): string {
  const text = stripMarkdown(markdown);
  const terms = toQueryTerms(query);
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const scored = sentences
    .map((sentence) => {
      const lower = sentence.toLowerCase();
      const hits = terms.reduce((count, term) => (lower.includes(term) ? count + 1 : count), 0);
      return { sentence, hits };
    })
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 3)
    .map((item) => item.sentence);

  const summary = scored.join(' ');
  if (summary.length > 0) return summary;
  return fallbackExcerpt?.trim() || 'Relevant content was found, but no high-signal summary sentence could be extracted.';
}

async function buildOptionalLlmSummary(query: string, sources: AssistantSource[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || sources.length === 0) return null;

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const context = sources
    .map((source, index) => {
      return `Source ${index + 1}: ${source.title} (slug: ${source.slug})\nExcerpt: ${source.excerpt || 'n/a'}`;
    })
    .join('\n\n');

  const prompt = [
    'You are assisting with an internal clinical knowledge base.',
    'Use ONLY the provided source snippets.',
    'Return 2-4 concise sentences and do not invent facts or citations.',
    `Question: ${query}`,
    `Sources:\n${context}`,
  ].join('\n\n');

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 220,
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { output_text?: string };
  const output = data.output_text?.trim();
  return output && output.length > 0 ? output : null;
}

function computeConfidence(query: string, sources: AssistantSource[]): number {
  if (sources.length === 0) return 0;

  const terms = toQueryTerms(query);
  if (terms.length === 0) return 0.3;

  const top = sources[0];
  const haystack = `${top.title} ${top.excerpt || ''}`.toLowerCase();
  const coverage = terms.reduce((count, term) => (haystack.includes(term) ? count + 1 : count), 0) / terms.length;
  const breadthBoost = Math.min(sources.length, 4) * 0.08;

  return Math.max(0, Math.min(1, coverage + breadthBoost));
}

export async function answerAssistantQuery(query: string): Promise<AssistantResponse> {
  const normalizedQuery = normalizeWhitespace(query);
  if (!normalizedQuery) {
    return {
      answer: 'Enter a question to search the internal knowledge base.',
      confidence: 0,
      lowConfidence: true,
      fallbackSearchUrl: '/search',
      disclaimer: INTERNAL_DISCLAIMER,
      sources: [],
    };
  }

  const items = await searchContent({ q: normalizedQuery, take: 6 });
  const sources: AssistantSource[] = items.slice(0, 4).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    sourcePath: item.sourcePath,
  }));

  const confidence = computeConfidence(normalizedQuery, sources);
  const lowConfidence = confidence < 0.45;

  if (lowConfidence) {
    return {
      answer:
        'I could not confidently map that question to specific internal content. Showing standard search is safer for this query.',
      confidence,
      lowConfidence: true,
      fallbackSearchUrl: `/search?q=${encodeURIComponent(normalizedQuery)}`,
      disclaimer: INTERNAL_DISCLAIMER,
      sources,
    };
  }

  const llmAnswer = await buildOptionalLlmSummary(normalizedQuery, sources);
  const extractiveAnswer = buildExtractiveSummary(normalizedQuery, items[0].markdown, items[0].excerpt);

  return {
    answer: llmAnswer || extractiveAnswer,
    confidence,
    lowConfidence: false,
    disclaimer: INTERNAL_DISCLAIMER,
    sources,
  };
}

import { NextResponse } from 'next/server';
import { answerAssistantQuery } from '@/lib/assistant';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query || '';

    const result = await answerAssistantQuery(query);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        answer: 'Unable to run the assistant query right now. Please use standard search.',
        confidence: 0,
        lowConfidence: true,
        fallbackSearchUrl: '/search',
        disclaimer:
          'Internal knowledge-base assistant: this response summarizes repository content and does not replace clinical judgment.',
        sources: [],
      },
      { status: 500 },
    );
  }
}

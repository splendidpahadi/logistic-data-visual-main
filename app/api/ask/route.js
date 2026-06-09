import { NextResponse } from 'next/server';
import { getSession } from '@/lib/sessionStore';
import { getAnalysisPlan, generateAnswer } from '@/lib/openrouter';
import { executeAnalysis } from '@/lib/analysisEngine';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { sessionId, question } = await request.json();

    if (!sessionId || !question) {
      return NextResponse.json({ error: 'sessionId and question are required.' }, { status: 400 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or expired. Please upload your CSV again.' },
        { status: 404 }
      );
    }

    const { columns, rows, rowCount, sample, stats } = session;

    // Step 1: AI produces a structured analysis plan
    let plan;
    try {
      plan = await getAnalysisPlan(question, columns, sample, stats);
    } catch (err) {
      console.error('AI planning error:', err.message);
      return NextResponse.json(
        {
          error:
            'The AI service is not available right now. Please check the configured AI provider and try again.',
        },
        { status: 502 }
      );
    }

    // Step 2: Execute the plan against the real dataset
    const { table, chart, summary } = executeAnalysis(rows, columns, plan);

    // Step 3: Generate a natural language explanation
    let answer;
    try {
      // Send a compact summary of results to the AI — never the full dataset
      const resultsSnapshot = table ? table.slice(0, 15) : summary || { note: 'No grouped results' };
      answer = await generateAnswer(question, columns, resultsSnapshot, rowCount);
    } catch {
      answer = summary || 'Analysis complete. See the results below.';
    }

    return NextResponse.json({
      answer,
      table: table && table.length > 0 ? table : null,
      chart: chart && chart.data && chart.data.length > 0 ? chart : null,
    });
  } catch (err) {
    console.error('Ask error:', err);
    return NextResponse.json({ error: 'Failed to process your question.' }, { status: 500 });
  }
}

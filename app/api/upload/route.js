import { NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csvParser';
import { computeStats } from '@/lib/analysisEngine';
import { createSession } from '@/lib/sessionStore';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are supported.' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parseCSV(text);

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { columns, rows, rowCount, sample } = parsed;
    const stats = computeStats(rows, columns);
    const sessionId = randomUUID();

    createSession(sessionId, {
      columns,
      rows,
      rowCount,
      sample,
      stats,
      fileName: file.name,
    });

    return NextResponse.json({
      sessionId,
      columns,
      rowCount,
      fileName: file.name,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to process the uploaded file.' }, { status: 500 });
  }
}

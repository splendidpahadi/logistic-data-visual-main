import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/sessionStore';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 });
    }
    deleteSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('End session error:', err);
    return NextResponse.json({ error: 'Failed to end session.' }, { status: 500 });
  }
}

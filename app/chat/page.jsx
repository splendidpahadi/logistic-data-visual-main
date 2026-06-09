'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('shipment_session');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.sessionId) {
        router.replace('/');
        return;
      }
      setSessionData(parsed);
      setReady(true);
    } catch {
      router.replace('/');
    }
  }, [router]);

  async function handleEndSession() {
    if (!sessionData?.sessionId) return;

    try {
      await fetch('/api/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionData.sessionId }),
      });
    } catch {
      // Best-effort cleanup
    } finally {
      sessionStorage.removeItem('shipment_session');
      router.replace('/');
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm">Loading session...</div>
      </div>
    );
  }

  return (
    <ChatWindow
      sessionId={sessionData.sessionId}
      datasetInfo={{
        fileName: sessionData.fileName,
        rowCount: sessionData.rowCount,
        columns: sessionData.columns,
      }}
      onEndSession={handleEndSession}
    />
  );
}

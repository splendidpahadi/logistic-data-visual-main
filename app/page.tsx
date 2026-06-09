'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UploadCard from '@/components/UploadCard';

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = useCallback(
    (data) => {
      sessionStorage.setItem(
        'shipment_session',
        JSON.stringify({
          sessionId: data.sessionId,
          fileName: data.fileName,
          rowCount: data.rowCount,
          columns: data.columns,
        })
      );
      router.push('/chat');
    },
    [router]
  );

  return <UploadCard onUploadSuccess={handleUploadSuccess} />;
}

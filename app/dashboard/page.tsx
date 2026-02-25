'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with recharts
const ITAMApp = dynamic(() => import('@/components/itam-app'), { ssr: false });

export default function DashboardPage() {
  return <ITAMApp />;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/overview'); }, [router]);
  return null;
}

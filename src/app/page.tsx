'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        redirect('/chat');
      } else {
        redirect('/login');
      }
    }
  }, [user, isUserLoading]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <p>Загрузка...</p>
    </main>
  );
}

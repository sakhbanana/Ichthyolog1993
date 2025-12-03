'use client';

import { useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  where,
  Timestamp,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

import { useRouter } from 'next/navigation';

import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase/hooks';

import { sub } from 'date-fns';

export default function ChatPage() {
  const router = useRouter();

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Редирект, если нет пользователя
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Загружаем список пользователей
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const users = useCollection(usersQuery)?.data || [];

  // Фильтруем сообщения за последние 6 месяцев
  const sixMonthsAgo = useMemo(() => sub(new Date(), { months: 6 }), []);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    return query(
      collection(firestore, 'group_chat/group/messages'),
      where('timestamp', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('timestamp', 'asc'),
    );
  }, [firestore, sixMonthsAgo]);

  const messages = useCollection(messagesQuery)?.data || [];

  // ---------------------------------------------------------------------------
  // АВТОМАТИЧЕСКАЯ ОЧИСТКА СТАРЫХ СООБЩЕНИЙ
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!firestore || !user) return;
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const lastCleanupRaw = localStorage.getItem('lastMessagesCleanup');

    if (lastCleanupRaw) {
      const lastCleanup = Number(lastCleanupRaw);
      if (!Number.isNaN(lastCleanup) && now - lastCleanup < DAY_MS) {
        return; // уже чистили за последние сутки
      }
    }

    const cleanupOldMessages = async () => {
      try {
        const sixMonthsAgoDate = sub(new Date(), { months: 6 });

        const messagesRef = collection(
          firestore,
          'group_chat/group/messages',
        );

        const cleanupQuery = query(
          messagesRef,
          where('timestamp', '<', Timestamp.fromDate(sixMonthsAgoDate)),
          where('authorId', '==', user.uid),
        );

        const snapshot = await getDocs(cleanupQuery);

        await Promise.all(snapshot.docs.map(docSnap => deleteDoc(docSnap.ref)));

        localStorage.setItem('lastMessagesCleanup', String(now));
      } catch (err) {
        console.error('Ошибка очистки старых сообщений:', err);
      }
    };

    cleanupOldMessages();
  }, [firestore, user]);
  // ---------------------------------------------------------------------------

  if (isUserLoading || !user) {
    return <div className="p-4">Загрузка...</div>;
  }

  // ---------------------------------------------------------------------------
  // JSX — ВАЖНО: правильно закрыт, не разорван
  // ---------------------------------------------------------------------------

  return (
    <div className="flex h-screen">
      {/* Сайдбар */}
      <div className="hidden h-full w-80 border-r bg-background md:block">
        <ChatSidebar currentUser={user} users={users} />
      </div>

      {/* Основной чат */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages} currentUserId={user.uid} />
        </div>

        <div className="border-t p-3">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

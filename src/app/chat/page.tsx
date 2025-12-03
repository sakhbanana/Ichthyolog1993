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
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';

import { sub } from 'date-fns';

export default function ChatPage() {
  const router = useRouter();

  // Firebase
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Если пользователь не залогинен — редирект на логин
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Загружаем всех пользователей (для списка участников)
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);
  const users = useCollection(usersQuery)?.data || [];

  // Запрос сообщений (только за последние 6 месяцев)
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

  // -----------------------------------------------------------------------------
  // 🧹 АВТОМАТИЧЕСКАЯ ОЧИСТКА СТАРЫХ СООБЩЕНИЙ (вариант A)
  // Запускается при заходе на страницу. Не чаще одного раза в сутки.
  // -----------------------------------------------------------------------------

  useEffect(() => {
    if (!firestore || !user) return;

    if (typeof window === 'undefined') return;

    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    const lastCleanupRaw = window.localStorage.getItem('lastMessagesCleanup');
    if (lastCleanupRaw) {
      const lastCleanup = Number(lastCleanupRaw);
      if (!Number.isNaN(lastCleanup) && now - lastCleanup < DAY_MS) {
        // Уже чистили менее 24 часов назад
        return;
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

        window.localStorage.setItem('lastMessagesCleanup', String(now));
      } catch (err) {
        console.error('Ошибка очистки старых сообщений:', err);
      }
    };

    void cleanupOldMessages();
  }, [firestore, user]);

  // -----------------------------------------------------------------------------

  if (isUserLoading || !user) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Сайдбар со списком пользователей и настройками */}
      <div className="hidden h-full w-80 border-r bg-background md:block">
        <ChatSidebar cu

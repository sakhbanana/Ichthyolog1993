'use client';

import type { AppUser } from '@/types/user';
import {
  collection,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

import { sub } from 'date-fns';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase/provider';
import type { Message } from '@/lib/types';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MessageInput } from '@/components/chat/message-input';

export default function ChatPage() {
  const router = useRouter();

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users')) : null),
    [firestore]
  );
  const { data: rawUsers } = useCollection<Omit<AppUser, 'id'>>(usersQuery);

  const users: AppUser[] = useMemo(
    () =>
      rawUsers
        ? rawUsers.map((u) => ({
            id: u.id,
            name: u.name ?? '',
            avatar: u.avatar ?? '',
            online: u.online ?? false,
          }))
        : [],
    [rawUsers]
  );

  const currentUserProfile: AppUser | null = useMemo(
    () => (user && users.length > 0 ? users.find((u) => u.id === user.uid) || null : null),
    [user, users]
  );
    
  const sixMonthsAgo = useMemo(() => sub(new Date(), { months: 6 }), []);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    return query(
      collection(firestore, 'group_chat/group/messages'),
      where('timestamp', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('timestamp', 'asc')
    );
  }, [firestore, sixMonthsAgo]);

  const { data: messagesData } = useCollection<Omit<Message, 'id'>>(messagesQuery);

  const messages: Message[] = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.map((m) => {
        const timestamp = m.timestamp as unknown as Timestamp;
        return {
            ...m,
            id: m.id,
            timestamp: timestamp ? timestamp.toDate().toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              }) : '..._error_...',
        }
    });
  }, [messagesData]);


  if (isUserLoading || !user) {
    return <div className="p-4">Загрузка…</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="hidden h-full w-80 border-r bg-background md:block">
        <ChatSidebar currentUser={currentUserProfile} users={users} />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {currentUserProfile && (
             <ChatMessages messages={messages} users={users} currentUser={currentUserProfile} />
          )}
        </div>

        <div className="border-t p-3">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

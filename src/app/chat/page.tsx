'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { User, Message } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MessageInput } from "@/components/chat/message-input";
import { Users, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { sub } from 'date-fns';

export default function ChatPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);
  
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const sixMonthsAgo = useMemo(() => sub(new Date(), { months: 6 }), []);
  const messagesQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(
          collection(firestore, 'group_chat/group/messages'),
          where('timestamp', '>=', Timestamp.fromDate(sixMonthsAgo)),
          orderBy('timestamp', 'asc')
      );
  }, [firestore, sixMonthsAgo]);
  
  const { data: messagesData, isLoading: messagesLoading } = useCollection<Omit<Message, 'timestamp' | 'id'> & { timestamp: Timestamp }>(messagesQuery);
  
  const messages: Message[] | null = useMemo(() => {
    if (!messagesData) return null;
    return messagesData.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : '...',
    }));
  }, [messagesData]);


  const currentUser: User | undefined = useMemo(() => {
    if (!user || !users) return undefined;
    return users.find(u => u.id === user.uid);
  }, [user, users]);

  if (isUserLoading || usersLoading || messagesLoading || !currentUser || !users || !messages) {
    return (
        <div className="flex h-screen flex-col bg-background">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <div className="hidden items-center gap-2 md:flex">
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-5 w-5" />
              <Skeleton className="h-4 w-20" />
            </div>
          </header>
          <main className="flex-1 overflow-hidden p-4 md:p-6">
             <div className="space-y-4">
                <Skeleton className="h-20 w-3/4" />
                <Skeleton className="h-20 w-3/4 ml-auto" />
                <Skeleton className="h-20 w-3/4" />
             </div>
          </main>
          <footer className="shrink-0 border-t bg-card p-2 md:p-4">
            <Skeleton className="h-12 w-full rounded-2xl" />
          </footer>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <ChatSidebar users={users} currentUser={currentUser} />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen flex-col bg-background">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-2">
                <Logo />
                <h1 className="text-lg font-semibold font-headline">Групповой чат</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{users.length} Участников</span>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <ChatMessages 
              messages={messages || []} 
              users={users} 
              currentUser={currentUser} 
            />
          </main>
          <footer className="shrink-0 border-t bg-card p-2 md:p-4">
            <MessageInput />
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

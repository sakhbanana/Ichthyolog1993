'use client';

import type { Message } from '@/lib/types';
import type { AppUser } from '@/types/user';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  users: AppUser[];
  currentUser: AppUser;
}

export function ChatMessages({ messages, users, currentUser }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const getUserById = (id: string) => users.find(u => u.id === id);

  return (
    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => {
            const author = getUserById(message.authorId);
            const isCurrentUser = message.authorId === currentUser.id;
            const showAvatar = index === 0 || messages[index - 1].authorId !== message.authorId;
            const timestamp = message.timestamp as Date;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className={cn('h-9 w-9', showAvatar ? 'opacity-100' : 'opacity-0')}>
                  {showAvatar && author && (
                    <>
                      <AvatarImage src={author.avatar} alt={author.name} />
                      <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div className={cn('flex flex-col gap-1', isCurrentUser ? 'items-end' : 'items-start')}>
                  {showAvatar && (
                    <div className="font-semibold text-sm">{author?.name}</div>
                  )}
                  {message.text && (
                    <div
                      className={cn(
                        'max-w-xs rounded-lg p-3 text-sm md:max-w-md',
                        isCurrentUser
                          ? 'rounded-br-none bg-primary text-primary-foreground'
                          : 'rounded-bl-none bg-card'
                      )}
                    >
                      {message.text}
                    </div>
                  )}
                  {message.media && (
                    <Card className="overflow-hidden w-64">
                      <CardContent className="p-0">
                        <div className="relative aspect-video">
                          <Image 
                            src={message.media.url}
                            alt="Shared media"
                            fill
                            className="object-cover"
                            data-ai-hint={message.media.hint}
                          />
                          {message.media.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <PlayCircle className="h-10 w-10 text-white" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <div className="text-xs text-muted-foreground">{timestamp.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

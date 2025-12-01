'use client';

import { useState } from 'react';
import { Paperclip, Image, Video, Send } from 'lucide-react';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleSend = () => {
    if (message.trim() && user) {
      const messagesColRef = collection(firestore, 'group_chat/group/messages');
      
      addDocumentNonBlocking(messagesColRef, {
        authorId: user.uid,
        text: message.trim(),
        timestamp: serverTimestamp(),
      });

      setMessage('');
      toast({
          title: "Сообщение отправлено",
          description: "Ваше сообщение было успешно отправлено.",
      });
    }
  };
  
  const handleFileUpload = (fileType: 'Фото' | 'Видео') => {
      toast({
          title: `Загрузка ${fileType}`,
          description: `Это заглушка для загрузки ${fileType.toLowerCase()}.`,
      })
  }

  return (
    <div className="relative">
      <Textarea
        placeholder="Введите сообщение..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="min-h-[48px] resize-none rounded-2xl border-input bg-background p-3 pr-28 text-sm"
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Прикрепить файл</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleFileUpload('Фото')}>
                <Image className="mr-2 h-4 w-4" />
                Фото
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleFileUpload('Видео')}>
                <Video className="mr-2 h-4 w-4" />
                Видео
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 bg-accent hover:bg-accent/90"
          onClick={handleSend}
          disabled={!message.trim() || !user}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Отправить</span>
        </Button>
      </div>
    </div>
  );
}

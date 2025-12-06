'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Paperclip, Image, Video, Send, Loader2 } from 'lucide-react';
import { collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

type UploadKind = 'image' | 'video';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [uploadKind, setUploadKind] = useState<UploadKind | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const messagesColRef =
    firestore && collection(firestore, 'group_chat/group/messages');

  const handleSend = () => {
    if (!firestore || !messagesColRef || !user) return;
    if (!message.trim()) return;

    addDocumentNonBlocking(messagesColRef, {
      authorId: user.uid,
      text: message.trim(),
      timestamp: serverTimestamp(),
    });

    setMessage('');
    toast({
      title: 'Сообщение отправлено',
      description: 'Ваше сообщение было успешно отправлено.',
    });
  };

  /**
   * Нажатие на кнопку «Фото» / «Видео» — открываем файловый диалог
   */
  const handleFileButtonClick = (kind: UploadKind) => {
    setUploadKind(kind);
    // даём React дорисовать новое значение accept и только потом жмём input
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  /**
   * Обработка выбора файла и загрузка в Firebase Storage
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // очищаем value, чтобы можно было выбрать тот же файл повторно
    e.target.value = '';

    if (!file) return;
    if (!user || !firestore || !messagesColRef) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Нет соединения с сервером или пользователем.',
      });
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast({
        variant: 'destructive',
        title: 'Неподдерживаемый формат',
        description: 'Поддерживаются только изображения и видео.',
      });
      return;
    }

    // мягкие лимиты размера, чтобы не улететь в гигабайты
    const maxImageSize = 5 * 1024 * 1024; // 5 MB
    const maxVideoSize = 25 * 1024 * 1024; // 25 MB

    if (isImage && file.size > maxImageSize) {
      toast({
        variant: 'destructive',
        title: 'Слишком большой файл',
        description: 'Изображение не должно превышать 5 МБ.',
      });
      return;
    }

    if (isVideo && file.size > maxVideoSize) {
      toast({
        variant: 'destructive',
        title: 'Слишком большой файл',
        description: 'Видео не должно превышать 25 МБ.',
      });
      return;
    }

    const kind: UploadKind = isImage ? 'image' : 'video';

    setIsUploading(true);

    try {
      const storage = getStorage();
      const safeName = file.name.replace(/\s+/g, '-');
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const storageRef = ref(
        storage,
        `chat_uploads/${user.uid}/${id}-${safeName}`,
      );

      // 1. Загрузка файла в Storage
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // 2. Получение публичной ссылки
      const url = await getDownloadURL(storageRef);

      // 3. Создание сообщения в Firestore с media
      await addDocumentNonBlocking(messagesColRef, {
        authorId: user.uid,
        text: '', // медиасообщение без текста
        timestamp: serverTimestamp(),
        media: {
          type: kind,
          url,
          hint: file.name,
        },
      });

      toast({
        title: kind === 'image' ? 'Фото отправлено' : 'Видео отправлено',
        description: 'Файл успешно загружен и добавлен в чат.',
      });
    } catch (error: any) {
      console.error('Upload error', error);
      
      let errorMessage = 'Не удалось загрузить файл. Попробуйте ещё раз.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'Недостаточно прав для загрузки. Проверьте подтверждение email.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'Превышен лимит хранилища.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Превышено время ожидания. Проверьте соединение.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={
          uploadKind === 'image'
            ? 'image/*'
            : uploadKind === 'video'
            ? 'video/*'
            : 'image/*,video/*'
        }
        onChange={handleFileChange}
        disabled={isUploading}
      />

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
        disabled={isUploading}
        className="min-h-[48px] resize-none rounded-2xl border-input bg-background p-3 pr-28 text-sm"
      />

      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
              <span className="sr-only">Прикрепить файл</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFileButtonClick('image')}
                disabled={isUploading}
              >
                <Image className="mr-2 h-4 w-4" />
                Фото
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFileButtonClick('video')}
                disabled={isUploading}
              >
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
          disabled={!message.trim() || !user || isUploading}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Отправить</span>
        </Button>
      </div>
    </div>
  );
}

'use client';

import Image from "next/image";
import { Trash2, Upload } from "lucide-react";

import type { AppUser } from "@/types/user";

import { useAuth, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

import { doc, deleteDoc } from "firebase/firestore";
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  signOut
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent } from "react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ChatSidebarProps {
  currentUser: AppUser | null;
  users: AppUser[];
}

export function ChatSidebar({ currentUser, users }: ChatSidebarProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const userAvatars = PlaceHolderImages.filter(img =>
    img.id.startsWith("user")
  );

  // Смена аватара на готовый
  const handleAvatarChange = async (newAvatarUrl: string) => {
    if (!currentUser) return;

    const ref = doc(firestore, "users", currentUser.id);
    await updateDocumentNonBlocking(ref, {
      avatar: newAvatarUrl,
    });

    toast({
      title: "Аватар обновлён",
      description: "Ваш новый аватар успешно сохранён.",
    });
  };

  // Загрузка собственного аватара
  const handleCustomAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || !currentUser || !auth.currentUser) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Неподдерживаемый формат',
        description: 'Поддерживаются только изображения.',
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Слишком большой файл',
        description: 'Изображение не должно превышать 2 МБ.',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const storage = getStorage();
      const safeName = file.name.replace(/\s+/g, '-');
      const avatarRef = ref(
        storage,
        `chat_uploads/${auth.currentUser.uid}/avatar-${Date.now()}-${safeName}`
      );

      await uploadBytes(avatarRef, file, {
        contentType: file.type,
      });

      const url = await getDownloadURL(avatarRef);

      const userDocRef = doc(firestore, "users", currentUser.id);
      await updateDocumentNonBlocking(userDocRef, {
        avatar: url,
      });

      toast({
        title: "Аватар обновлён",
        description: "Ваше фото успешно загружено.",
      });
    } catch (error) {
      console.error('Avatar upload error', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить фото. Попробуйте ещё раз.',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Реаутентификация перед удалением
  const handleReauthenticate = async () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Невозможно определить email пользователя.",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите ваш пароль.",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      // После успешной реаутентификации удаляем аккаунт
      await performAccountDeletion();
    } catch (error: any) {
      console.error('Reauthentication error:', error);
      
      if (error.code === 'auth/wrong-password') {
        toast({
          variant: "destructive",
          title: "Неверный пароль",
          description: "Пожалуйста, проверьте правильность введённого пароля.",
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          variant: "destructive",
          title: "Слишком много попыток",
          description: "Попробуйте позже.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка аутентификации",
          description: "Не удалось подтвердить личность.",
        });
      }
    } finally {
      setIsDeleting(false);
      setPassword("");
      setIsReauthDialogOpen(false);
    }
  };

  // Удаление аккаунта
  const performAccountDeletion = async () => {
    if (!auth.currentUser) return;

    try {
      const userId = auth.currentUser.uid;

      // Удаляем документ пользователя из Firestore
      await deleteDoc(doc(firestore, "users", userId));

      // Удаляем аккаунт из Firebase Auth
      await auth.currentUser.delete();

      toast({
        title: "Аккаунт удалён",
        description: "Вы можете зарегистрироваться снова.",
      });

      router.push("/login");
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      // Если требуется повторная аутентификация
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Требуется подтверждение",
          description: "Для безопасности введите пароль.",
        });
        setIsReauthDialogOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка при удалении",
          description: "Попробуйте позже.",
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col p-4">

      {/* Заголовок */}
      <h2 className="mb-4 text-lg font-semibold">Участники</h2>

      {/* Список участников */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <Image
              src={u.avatar}
              alt={u.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span>{u.name}</span>
          </div>
        ))}
      </div>

      {/* Текущий пользователь */}
      {currentUser && (
        <div className="mt-4 border-t pt-4">

          <Popover>
            <PopoverTrigger>
              <div className="flex cursor-pointer items-center gap-3">
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />

                <div>
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Изменить аватар
                  </p>
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-64">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Выберите аватар</h3>
                
                {/* Готовые аватары */}
                <div className="grid grid-cols-4 gap-2">
                  {userAvatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      className="rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
                      onClick={() => handleAvatarChange(avatar.imageUrl)}
                    >
                      <Image
                        src={avatar.imageUrl}
                        alt="avatar"
                        width={64}
                        height={64}
                      />
                    </button>
                  ))}
                </div>

                {/* Загрузка своего фото */}
                <div className="pt-2 border-t">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCustomAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingAvatar ? 'Загрузка...' : 'Загрузить своё фото'}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Удалить аккаунт */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="link" className="mt-4 flex items-center gap-2 p-0 text-red-600 hover:text-red-700">
                <Trash2 size={18} />
                Удалить Аккаунт
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить Аккаунт?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие необратимо. Все ваши данные и сообщения будут удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={performAccountDeletion} 
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Диалог реаутентификации */}
          <Dialog open={isReauthDialogOpen} onOpenChange={setIsReauthDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Подтвердите удаление</DialogTitle>
                <DialogDescription>
                  Для безопасности введите ваш пароль, чтобы подтвердить удаление аккаунта.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleReauthenticate();
                      }
                    }}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReauthDialogOpen(false);
                    setPassword("");
                  }}
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReauthenticate}
                  disabled={isDeleting || !password.trim()}
                >
                  {isDeleting ? 'Удаление...' : 'Подтвердить'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      )}

    </div>
  );
}

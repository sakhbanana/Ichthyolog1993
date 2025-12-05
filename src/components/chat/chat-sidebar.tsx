'use client';

import Image from "next/image";
import { Trash2 } from "lucide-react";

import type { AppUser } from "@/types/user";

import { useAuth, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

import { signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

import { PlaceHolderImages } from "@/lib/placeholder-images";

interface ChatSidebarProps {
  currentUser: AppUser | null;
  users: AppUser[];
}

export function ChatSidebar({ currentUser, users }: ChatSidebarProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userAvatars = PlaceHolderImages.filter(img =>
    img.id.startsWith("user")
  );

  // Смена аватара
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

  const reauthenticateUser = async () => {
    if (!auth.currentUser) return;

    const providerId = auth.currentUser.providerData[0]?.providerId;

    if (providerId === "password") {
      const password = window.prompt("Введите пароль для подтверждения удаления аккаунта");
      if (!password || !auth.currentUser.email) {
        throw new Error("Пароль не указан");
      }

      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return;
    }

    if (providerId === "google.com") {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth, provider);
      return;
    }

    await auth.currentUser.reload();
  };

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !firestore) {
      toast({
        variant: "destructive",
        title: "Ошибка при удалении",
        description: "Не удалось получить данные пользователя.",
      });
      return;
    }

    try {
      await reauthenticateUser();

      const userId = auth.currentUser.uid;

      await deleteDoc(doc(firestore, "users", userId));

      await deleteUser(auth.currentUser);

      await signOut(auth);

      await signOut(auth);

      toast({
        title: "Аккаунт удалён",
        description: "Вы можете зарегистрироваться снова.",
      });

      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка при удалении",
        description: "Попробуйте позже.",
      });
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
            </PopoverContent>
          </Popover>

          {/* Удалить аккаунт */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="link"
                className="mt-4 flex items-center gap-2 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
                Удалить аккаунт
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие необратимо. Все ваши данные и сообщения будут удалены.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      )}

    </div>
  );
}

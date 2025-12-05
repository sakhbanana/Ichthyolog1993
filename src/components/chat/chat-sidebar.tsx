"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import type { AppUser } from "@/types/user";

import { useAuth, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { doc, deleteDoc } from "firebase/firestore";
import {
  deleteUser,
  EmailAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
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

import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ChatSidebarProps {
  currentUser: AppUser | null;
  users: AppUser[];
}

export function ChatSidebar({ currentUser, users }: ChatSidebarProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentAuthUser = auth.currentUser;
  const usesPasswordProvider = currentAuthUser?.providerData.some(
    (provider) => provider.providerId === "password"
  );

  const buildAuthProvider = () => {
    const firstProviderId = currentAuthUser?.providerData[0]?.providerId;

    switch (firstProviderId) {
      case "google.com":
        return new GoogleAuthProvider();
      case "github.com":
        return new GithubAuthProvider();
      default:
        return null;
    }
  };

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

  // Удаление аккаунта
  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    if (usesPasswordProvider && !password) {
      toast({
        variant: "destructive",
        title: "Введите пароль",
        description: "Для удаления аккаунта подтвердите действие паролем.",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const userId = auth.currentUser.uid;
      const email = auth.currentUser.email;

      if (usesPasswordProvider) {
        if (!email) {
          throw new Error("Email не найден у текущего пользователя");
        }

        const credential = EmailAuthProvider.credential(email, password);

        await reauthenticateWithCredential(auth.currentUser, credential);
      } else {
        const provider = buildAuthProvider();

        if (!provider) {
          throw new Error(
            "Не удалось определить провайдера авторизации. Выйдите и войдите снова."
          );
        }

        await reauthenticateWithPopup(auth.currentUser, provider);
      }

      // Auth: удалить пользователя из Firebase Auth
      await deleteUser(auth.currentUser);

      // Firestore: удалить профиль пользователя, если он ещё существует
      try {
        await deleteDoc(doc(firestore, "users", userId));
      } catch (firestoreError) {
        console.error("Не удалось удалить профиль из Firestore", firestoreError);
      }

      toast({
        title: "Аккаунт удалён",
        description: "Вы можете зарегистрироваться снова.",
      });

      setPassword("");
      router.push("/signup");
    } catch (error: any) {
      console.error("Ошибка при удалении аккаунта", error);
      let description = "Попробуйте позже.";

      if (error.code === "auth/invalid-credential" || error.code === "auth/requires-recent-login") {
        description = usesPasswordProvider
          ? "Пароль неверный или устарела сессия. Пожалуйста, войдите заново и повторите попытку."
          : "Сессия устарела. Войдите заново через ваш способ входа и повторите удаление.";
      } else if (error.code === "auth/user-mismatch" || error.code === "auth/user-not-found") {
        description = "Сессия недействительна. Выйдите и войдите снова, затем повторите удаление.";
      } else if (error.code === "auth/too-many-requests") {
        description = "Слишком много попыток. Подождите немного и попробуйте снова.";
      } else if (error.message?.includes("провайдера авторизации")) {
        description = error.message;
      }

      toast({
        variant: "destructive",
        title: "Ошибка при удалении",
        description,
      });
    } finally {
      setIsDeleting(false);
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
              <Button variant="link" className="mt-4 flex items-center gap-2 p-0 text-red-600 hover:text-red-700">
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

              <div className="space-y-2">
                {usesPasswordProvider ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Для подтверждения удаления введите пароль от аккаунта.
                    </p>
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Мы запросим повторный вход через ваш способ авторизации, чтобы подтвердить удаление.
                  </p>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className={buttonVariants({ variant: "destructive" })}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Удаление..." : "Удалить"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
      )}

    </div>
  );
}

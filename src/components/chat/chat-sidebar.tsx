'use client';

import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, LogOut, Settings, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Logo } from '../logo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useAuth, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteUser, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';


interface ChatSidebarProps {
  users: User[];
  currentUser: User;
}

export function ChatSidebar({ users, currentUser }: ChatSidebarProps) {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleAvatarChange = (newAvatarUrl: string) => {
    if (!currentUser) return;
    
    const userDocRef = doc(firestore, 'users', currentUser.id);
    updateDocumentNonBlocking(userDocRef, { avatar: newAvatarUrl });

    toast({
      title: "Аватар обновлен",
      description: "Ваш новый аватар был успешно сохранен.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    try {
      const userId = auth.currentUser.uid;
      
      // Delete user document from Firestore
      const userDocRef = doc(firestore, 'users', userId);
      await deleteDoc(userDocRef);

      // Delete user from Auth
      await deleteUser(auth.currentUser);
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был успешно удален.",
      });

      router.push('/login');

    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      let description = "Произошла ошибка при удалении аккаунта.";
      if (error.code === 'auth/requires-recent-login') {
        description = "Для выполнения этой операции требуется недавний вход в систему. Пожалуйста, войдите снова и повторите попытку.";
      }
      
      toast({
        variant: 'destructive',
        title: "Ошибка удаления",
        description,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка выхода',
        description: 'Не удалось выйти из аккаунта. Попробуйте еще раз.',
      });
    }
  };
  
  const userAvatars = PlaceHolderImages.filter(img => img.id.startsWith('user'));


  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-xl font-bold tracking-tight text-primary">Ихтиологи 1993</h1>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Участники</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id}>
                <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-sidebar-accent">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.online && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-sidebar" />
                    )}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  {user.id === currentUser.id && (
                    <Badge variant="outline" className="ml-auto">
                      Вы
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
      <Separator className="bg-sidebar-border" />
      <div className="p-4">
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="push-notifications" className="text-sm">Push-уведомления</Label>
            </div>
            <Switch id="push-notifications" />
        </div>
      </div>
      <Separator className="bg-sidebar-border" />
      <div className="p-4">
        <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative rounded-full cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-4 gap-2">
                  {userAvatars.map(avatar => (
                    <button key={avatar.id} onClick={() => handleAvatarChange(avatar.imageUrl)} className="rounded-full overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none">
                      <Image src={avatar.imageUrl} alt={avatar.description} width={48} height={48} className="object-cover h-12 w-12" />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">В сети</p>
          </div>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие невозможно отменить. Ваш аккаунт и все связанные с ним данные будут безвозвратно удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className={buttonVariants({ variant: "destructive" })}>Удалить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleLogout}
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

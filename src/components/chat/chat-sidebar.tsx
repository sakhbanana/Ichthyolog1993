import type { User } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Logo } from '../logo';

interface ChatSidebarProps {
  users: User[];
  currentUser: User;
}

export function ChatSidebar({ users, currentUser }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <Logo />
          <h1 className="text-lg font-semibold font-headline">GroupChat</h1>
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
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate font-semibold">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">В сети</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
            <a href="/login">
              <LogOut className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

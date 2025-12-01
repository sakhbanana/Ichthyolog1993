import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MessageInput } from "@/components/chat/message-input";
import { users, messages, currentUser } from "@/lib/mock-data";
import { Users, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function ChatPage() {
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
              <div className="hidden items-center gap-2 md:flex">
                <Logo />
                <h1 className="text-lg font-semibold font-headline">GroupChat</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{users.length} Members</span>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <ChatMessages 
              messages={messages} 
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

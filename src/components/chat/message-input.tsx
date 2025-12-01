'use client';

import { useState } from 'react';
import { Paperclip, Image, Video, Send } from 'lucide-react';

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

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
      toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
      });
    }
  };
  
  const handleFileUpload = (fileType: 'Photo' | 'Video') => {
      toast({
          title: `${fileType} Upload`,
          description: `This is a placeholder for ${fileType.toLowerCase()} uploading.`,
      })
  }

  return (
    <div className="relative">
      <Textarea
        placeholder="Type a message..."
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
              <span className="sr-only">Attach file</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleFileUpload('Photo')}>
                <Image className="mr-2 h-4 w-4" />
                Photo
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleFileUpload('Video')}>
                <Video className="mr-2 h-4 w-4" />
                Video
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 bg-accent hover:bg-accent/90"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}

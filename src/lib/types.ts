export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  authorId: string;
  text: string;
  timestamp: string | Date;
  media?: {
    type: 'image' | 'video';
    url: string;
    hint: string;
  };
}

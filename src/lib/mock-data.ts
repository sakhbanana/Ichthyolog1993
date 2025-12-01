import type { User, Message } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const getHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';

export const users: User[] = [
  { id: 'user1', name: 'Alex', avatar: getImage('user1'), online: true },
  { id: 'user2', name: 'Mia', avatar: getImage('user2'), online: true },
  { id: 'user3', name: 'Sam', avatar: getImage('user3'), online: false },
  { id: 'user4', name: 'Chloe', avatar: getImage('user4'), online: true },
  { id: 'user5', name: 'Ben', avatar: getImage('user5'), online: false },
];

export const currentUser: User = users[1]; // Mia is the current user

export const messages: Message[] = [
    {
        id: '1',
        authorId: 'user1',
        text: 'Hey everyone, what\'s up?',
        timestamp: '10:00 AM',
    },
    {
        id: '2',
        authorId: 'user2',
        text: 'Not much, just working on the new project. How about you?',
        timestamp: '10:01 AM',
    },
    {
        id: '3',
        authorId: 'user1',
        text: 'Same here. It\'s going well! I think we can launch next week.',
        timestamp: '10:02 AM',
    },
    {
        id: '4',
        authorId: 'user4',
        text: 'That\'s great news! I\'m excited.',
        timestamp: '10:03 AM',
    },
    {
        id: '5',
        authorId: 'user2',
        text: 'Check out this photo from my trip last weekend.',
        timestamp: '10:05 AM',
        media: {
            type: 'image',
            url: getImage('shared_photo_1'),
            hint: getHint('shared_photo_1'),
        }
    },
    {
        id: '6',
        authorId: 'user3',
        text: 'Wow, beautiful!',
        timestamp: '10:06 AM',
    },
    {
        id: '7',
        authorId: 'user5',
        text: 'Looks amazing! Where was this taken?',
        timestamp: '10:07 AM',
    },
    {
        id: '8',
        authorId: 'user2',
        text: 'It was at the national park. You all should go sometime. I also took a short video.',
        timestamp: '10:08 AM',
    },
    {
        id: '9',
        authorId: 'user2',
        text: '',
        timestamp: '10:09 AM',
        media: {
            type: 'video',
            url: getImage('shared_video_1'),
            hint: getHint('shared_video_1'),
        }
    }
];

import type { User, Message } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { sub, format } from 'date-fns';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';
const getHint = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageHint || '';

export const users: User[] = [
  { id: 'user1', name: 'Алекс', avatar: getImage('user1'), online: true, email: 'alex@example.com' },
  { id: 'user2', name: 'Мия', avatar: getImage('user2'), online: true, email: 'mia@example.com' },
  { id: 'user3', name: 'Сэм', avatar: getImage('user3'), online: false, email: 'sam@example.com' },
  { id: 'user4', name: 'Хлоя', avatar: getImage('user4'), online: true, email: 'chloe@example.com' },
  { id: 'user5', name: 'Бен', avatar: getImage('user5'), online: false, email: 'ben@example.com' },
];

export const currentUser: User = users[1]; // Мия - текущий пользователь

const now = new Date();

const initialMessages: Message[] = [
    {
        id: '1',
        authorId: 'user1',
        text: 'Всем привет, как дела?',
        timestamp: sub(now, { minutes: 9 }),
    },
    {
        id: '2',
        authorId: 'user2',
        text: 'Да так, работаю над новым проектом. А ты как?',
        timestamp: sub(now, { minutes: 8 }),
    },
    {
        id: '3',
        authorId: 'user1',
        text: 'Тоже самое. Все идет хорошо! Думаю, на следующей неделе запустим.',
        timestamp: sub(now, { minutes: 7 }),
    },
    {
        id: '4',
        authorId: 'user4',
        text: 'Отличные новости! Я в предвкушении.',
        timestamp: sub(now, { minutes: 6 }),
    },
    {
        id: '5',
        authorId: 'user2',
        text: 'Зацените фотку с моей поездки на выходных.',
        timestamp: sub(now, { minutes: 5 }),
        media: {
            type: 'image',
            url: getImage('shared_photo_1'),
            hint: getHint('shared_photo_1'),
        }
    },
    {
        id: '6',
        authorId: 'user3',
        text: 'Ого, красота!',
        timestamp: sub(now, { minutes: 4 }),
    },
    {
        id: '7',
        authorId: 'user5',
        text: 'Выглядит потрясающе! Где это снято?',
        timestamp: sub(now, { minutes: 3 }),
    },
    {
        id: '8',
        authorId: 'user2',
        text: 'Это было в национальном парке. Вам всем стоит съездить как-нибудь. Я еще и короткое видео сняла.',
        timestamp: sub(now, { minutes: 2 }),
    },
    {
        id: '9',
        authorId: 'user2',
        text: '',
        timestamp: sub(now, { minutes: 1 }),
        media: {
            type: 'video',
            url: getImage('shared_video_1'),
            hint: getHint('shared_video_1'),
        }
    },
    {
        id: '10',
        authorId: 'user1',
        text: 'Это очень старое сообщение',
        timestamp: sub(now, { months: 7 }),
    }
];

const sixMonthsAgo = sub(now, { months: 6 });

export const messages: Message[] = initialMessages.filter(message => {
  const messageDate = typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp;
  return messageDate > sixMonthsAgo;
}).map(message => {
    const messageDate = typeof message.timestamp === 'string' ? new Date(message.timestamp) : message.timestamp;
    return {
        ...message,
        timestamp: format(messageDate, 'HH:mm'),
    }
});

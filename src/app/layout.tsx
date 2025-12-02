import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';

/**
 * Настройка метаданных страницы
 */
export const metadata: Metadata = {
  title: 'Ихтиологи 1993',
  description: 'Мессенджер для вашей группы.',
  manifest: '/manifest.json',
  // Для Next.js 15 лучше не указывать themeColor здесь, а использовать generateViewport
};

/**
 * Генерация viewport для PWA и правильного themeColor
 */
export const generateViewport = () => ({
  viewport: { width: 'device-width', initialScale: 1 },
  themeColor: '#673AB7',
});

/**
 * RootLayout оборачивает все страницы в FirebaseProvider
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Подключаем шрифты и иконки */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

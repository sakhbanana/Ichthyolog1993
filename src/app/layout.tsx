import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

/**
 * Настройка метаданных страницы
 */
export const metadata: Metadata = {
  title: 'Ихтиологи 1993',
  description: 'Чат выпускников Ихтиологии, группа 1993 года',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

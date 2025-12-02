'use client';

import { useEffect, ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    // Регистрируем сервис-воркер только в продакшене
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker зарегистрирован с областью:', registration.scope);
          })
          .catch(error => {
            console.error('Ошибка регистрации Service Worker:', error);
          });
      });
    }
  }, []);

  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

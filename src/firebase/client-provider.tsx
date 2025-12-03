'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';


interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

function getFirebaseServices(): FirebaseServices | null {
  if (typeof window === 'undefined') {
    // На сервере сервисы недоступны
    return null;
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo гарантирует, что инициализация произойдет только один раз
  const firebaseServices = useMemo(() => getFirebaseServices(), []);

  // Если мы на сервере или сервисы еще не инициализированы,
  // не рендерим дочерние компоненты, которые могут от них зависеть.
  // Можно показать заглушку (лоадер) или просто ничего.
  if (!firebaseServices) {
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

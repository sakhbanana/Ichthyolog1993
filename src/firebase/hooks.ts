'use client';

import { useMemo } from 'react';
import { initializeFirebase } from './client';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection as useCollectionHook } from 'react-firebase-hooks/firestore';

/**
 * Инициализируем Firebase один раз на клиенте
 */
const { auth, firestore } = initializeFirebase();

/**
 * Хук: текущий пользователь
 */
export function useUser() {
  const [user, loading] = useAuthState(auth);
  return {
    user,
    isUserLoading: loading,
  };
}

/**
 * Хук: Firestore
 */
export function useFirestore() {
  return firestore;
}

/**
 * Хук: читать коллекцию
 */
export function useCollection(query: any) {
  return useCollectionHook(query);
}

/**
 * Мемоизация запроса Firestore
 */
export function useMemoFirebase(factory: () => any, deps: any[]) {
  return useMemo(factory, deps);
}

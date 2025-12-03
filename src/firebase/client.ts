import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Инициализация Firebase
 * — На Firebase Hosting конфиг автоматически берётся из окружения
 * — Локально используется firebaseConfig
 */
export function initializeFirebase() {
  if (!getApps().length) {
    // Если приложение не инициализировано — инициализируем
    try {
      // Попытка инициализации без аргументов (Firebase Hosting)
      const firebaseApp = initializeApp();
      return getSdks(firebaseApp);
    } catch {
      // Локальный режим — используем конфиг
      const firebaseApp = initializeApp(firebaseConfig);
      return getSdks(firebaseApp);
    }
  }

  // Если уже инициализировано — берём существующее
  return getSdks(getApp());
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}

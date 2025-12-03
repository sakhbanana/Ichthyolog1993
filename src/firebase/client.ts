import { firebaseConfig } from './config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export function initializeFirebase() {
  let app;

  if (!getApps().length) {
    try {
      // Firebase Hosting автоматически подставляет конфиг
      app = initializeApp();
    } catch {
      // локальный режим
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApp();
  }

  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}

// src/firebase/index.ts
// Единая точка входа Firebase

// Экспортируем инициализацию Firebase (клиентская)
export { initializeFirebase } from './client';

// Экспортируем все хуки для работы с Auth и Firestore
export * from './hooks';

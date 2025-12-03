// src/firebase/index.ts
// Главная точка входа Firebase

export {
  useUser,
  useAuth,
  useFirestore,
  useMemoFirebase,
} from './provider';

export {
    useCollection
} from './firestore/use-collection';

export {
    addDocumentNonBlocking,
    setDocumentNonBlocking,
    updateDocumentNonBlocking,
} from './non-blocking-updates';

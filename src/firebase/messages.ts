import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    orderBy,
    Firestore,
    Auth,
  } from "firebase/firestore";
  
  export async function loadRecentMessages(db: Firestore) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
    const messagesRef = collection(db, "messages");
  
    const q = query(
      messagesRef,
      where("timestamp", ">=", sixMonthsAgo),
      orderBy("timestamp", "asc")
    );
  
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  
  export async function deleteMyOldMessages(db: Firestore, auth: Auth) {
    const user = auth.currentUser;
    if (!user) return;
  
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
    const messagesRef = collection(db, "messages");
  
    const q = query(
      messagesRef,
      where("timestamp", "<", sixMonthsAgo),
      where("userId", "==", user.uid)
    );
  
    const snapshot = await getDocs(q);
  
    for (const msg of snapshot.docs) {
      await deleteDoc(doc(db, "messages", msg.id));
    }
  }
  

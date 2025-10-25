import { db } from "./../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

// إضافة إشعار فردي
export const addNotification = async (
  userId,
  senderName,
  message,
  type = "system",
  link = ""
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      senderName,
      message,
      type,
      link,
      read: false,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error("Error adding notification:", err);
    throw err;
  }
};

// إرسال إشعار جماعي
export const sendBulkNotification = async (
  userIds,
  senderName,
  message,
  type = "system",
  link = ""
) => {
  for (const uid of userIds) {
    await addNotification(uid, senderName, message, type, link);
  }
};

// جلب إشعارات المستخدم مرة واحدة
export const fetchNotifications = async (userId) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// الاشتراك في إشعارات لحظية
export const subscribeNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

// تعليم الإشعارات كمقروءة
export const markNotificationsRead = async (notifIds) => {
  for (const id of notifIds) {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { read: true });
  }
};

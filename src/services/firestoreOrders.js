// services/firestoreOrders.js
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// إنشاء طلب جديد + خصم الكمية من المخزون
export const createOrder = async (orderData) => {
  const { userId, cartItems, totalPrice, address, paymentMethod } = orderData;

  if (!userId || !cartItems || cartItems.length === 0) {
    throw new Error("Invalid order data");
  }

  // إنشاء الطلب
  const docRef = await addDoc(collection(db, "orders"), {
    userId,
    items: cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    totalPrice,
    address,
    paymentMethod,
    status: "pending",
    createdAt: new Date(),
  });

  // تحديث كمية المنتج (الخصم)
  for (const item of cartItems) {
    const productRef = doc(db, "products", item.id);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      const currentStock = productSnap.data().stock || 0;
      const newStock = Math.max(currentStock - item.quantity, 0);
      await updateDoc(productRef, { stock: newStock });
    }
  }

  return { id: docRef.id, ...orderData, status: "pending" };
};

// جلب كل الطلبات (للمسؤول)
export const fetchAllOrders = async () => {
  const ordersSnapshot = await getDocs(collection(db, "orders"));
  const orders = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const usersSnapshot = await getDocs(collection(db, "users"));
  const usersMap = {};
  usersSnapshot.docs.forEach((u) => {
    const data = u.data();
    usersMap[u.id] = data.username;
  });

  return orders.map((order) => ({
    ...order,
    username: usersMap[order.userId] || "Unknown",
  }));
};

// جلب الطلبات لمستخدم محدد
export const fetchUserOrders = async (userId) => {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// تحديث حالة الطلب (للمسؤول)
export const updateOrderStatus = async (orderId, newStatus) => {
  await updateDoc(doc(db, "orders", orderId), { status: newStatus });
};

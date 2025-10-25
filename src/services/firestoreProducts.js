// services/firestoreProducts.js
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export const fetchUserProducts = async () => {
  const q = query(collection(db, "products"), where("active", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToProducts = (callback) => {
  const q = query(collection(db, "products"), where("active", "==", true));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(products);
  });
  return unsubscribe;
};

export const createProduct = async (data) => {
  const docRef = await addDoc(collection(db, "products"), {
    ...data,
    price: parseFloat(data.price),
    stock: parseInt(data.stock || 0),
    active: true,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
};

export const updateProduct = async (id, data) => {
  const productRef = doc(db, "products", id);
  await updateDoc(productRef, {
    ...data,
    price: parseFloat(data.price),
    stock: parseInt(data.stock || 0),
    updatedAt: serverTimestamp(),
  });
};

export const deleteProductById = async (id) => {
  await deleteDoc(doc(db, "products", id));
};

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBa2tHkd9CiznL_v5VdTOya03xsGLN35eQ",
  authDomain: "gsg-project-01.firebaseapp.com",
  projectId: "gsg-project-01",
  storageBucket: "gsg-project-01.firebasestorage.app",
  messagingSenderId: "494455694707",
  appId: "1:494455694707:web:7853a66dddfb3f76025106",
  measurementId: "G-CS3596NXVR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

import { createContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, setDoc, onSnapshot, getDoc, addDoc, serverTimestamp, collection } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }

    const docRef = doc(db, "users", firebaseUser.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) setProfile(snap.data());
        else setProfile(null);
      },
      (err) => {
        console.error("Failed to subscribe to profile:", err);
        setProfile(null);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const login = async (email, password) => {
    const attemptsRef = collection(db, "loginAttempts");
    const attemptBase = {
      email,
      timestamp: serverTimestamp(),
    };

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        await addDoc(attemptsRef, {
          ...attemptBase,
          status: "failed",
          reason: "user profile not found",
        });
        throw new Error("User profile not found.");
      }

      const userData = userDoc.data();

      if (userData.active === false) {
        await signOut(auth);
        await addDoc(attemptsRef, {
          ...attemptBase,
          status: "failed",
          reason: "inactive account",
        });
        throw new Error("Account is inactive. Please contact admin.");
      }

      await addDoc(attemptsRef, {
        ...attemptBase,
        status: "success",
        uid: user.uid,
      });
      return user;
    } catch (err) {
      await addDoc(attemptsRef, {
        ...attemptBase,
        status: "failed",
        reason: err.message,
      });
      throw err;
    }
  };

  const register = async (username, email, password) => {
    if (!email || !password || !username)
      throw new Error("All fields required");

    const role = email === "admin@example.com" ? "admin" : "user";

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      username,
      email: user.email,
      uid: user.uid,
      role,
      isActive: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=111827&color=FBBF24&size=256`,
      avatarPath: null,
      createdAt: new Date(),
    });

    return user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              username: profile?.username ?? firebaseUser.displayName ?? null,
              role: profile?.role ?? null,
            }
          : null,
        firebaseUser,
        profile,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

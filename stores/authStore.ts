// stores/authStore.ts
import { create } from 'zustand';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firestore';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  initializeAuthListener: () => () => void;
  login: (loginData: any) => Promise<boolean>;
  register: (registerData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  initializeAuthListener: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
          },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    });
    return unsubscribe;
  },

  login: async (loginData) => {
    set({ error: null });
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      return true;
    } catch (err: any) {
      // Use a more user-friendly error message
      set({ error: "Invalid email or password." });
      return false;
    }
  },

  register: async (registerData) => {
    set({ error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: registerData.name });
      await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        name: registerData.name,
      });
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },
  
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (err: any) {
        set({ error: err.message });
    }
  },
}));
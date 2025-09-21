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

// Define types for login and registration data to avoid 'any' type errors
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

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
  login: (loginData: LoginData) => Promise<boolean>;
  register: (registerData: RegisterData) => Promise<boolean>;
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
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: "Invalid email or password.", isLoading: false });
      return false;
    }
  },

  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: registerData.name });

      await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        name: registerData.name,
      });

      set({
        user: {
          uid: user.uid,
          email: user.email,
          name: registerData.name,
          avatar: null
        },
        isLoading: false
      });
      return true;
    // ✨ SYNTAX FIX: Added the missing opening brace for the catch block
    } catch (err: any) { 
      const errorMessage =
        err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : "An error occurred during registration.";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
        set({ error: err.message });
    }
  },
}));

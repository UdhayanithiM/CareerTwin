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
    // ✨ Set loading state for better UX
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
    // ✨ Set loading state for better UX
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
      const user = userCredential.user;
      
      // Update the Firebase Auth user's display name
      await updateProfile(user, { displayName: registerData.name });

      // Create the user's document in Firestore
      await createUserProfile(user.uid, {
        uid: user.uid,
        email: user.email,
        name: registerData.name,
      });

      // ✨ Manually update the store for immediate UI response
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
    } catch (err: any)      const errorMessage =
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
      // The onAuthStateChanged listener will handle setting user to null
    } catch (err: any) {
        set({ error: err.message });
    }
  },
}));
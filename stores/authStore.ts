// stores/authStore.ts
import { create } from 'zustand';

// Define the shape of the user object and the store's state
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  // We will define actions to modify the state
  login: (loginData: any) => Promise<boolean>;
  register: (registerData: any) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Create the store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Action to set the user
  setUser: (user) => set({ user }),

  // Action for logging out
  logout: () => set({ user: null }),

  // Action for handling user login
  login: async (loginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Login failed.');
      }

      set({ user: result.user, isLoading: false });
      return true; // Indicate success
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false; // Indicate failure
    }
  },

  // Action for handling user registration
  register: async (registerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();
      if (!response.ok) {
        // This is where we handle the Zod validation error
        if (result.details) {
          // We can format the detailed errors if needed, or just use the main one.
          const firstError = Object.values(result.details)[0];
          throw new Error(firstError as string);
        }
        throw new Error(result.error || 'Registration failed.');
      }

      // On successful registration, you might want to log the user in directly
      // or just confirm success. For now, we'll just confirm.
      set({ isLoading: false });
      return true; // Indicate success
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false; // Indicate failure
    }
  },
}));
// stores/authStore.ts
import { create } from 'zustand';

// ✨ FIX: Added the optional 'avatar' property to the User interface.
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null; // This allows the user object to have an avatar property.
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (loginData: any) => Promise<boolean>;
  register: (registerData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuthStatus: async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      const result = await response.json();
      set({ user: result.user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

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
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null }); // No need to set isLoading here
  },

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
        if (result.details) {
          const firstError = Object.values(result.details)[0];
          throw new Error(firstError as string);
        }
        throw new Error(result.error || 'Registration failed.');
      }
      
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },
}));
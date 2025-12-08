import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from '@/lib/sdk';
import type { AuthUser, AuthResponse } from '@safrun/sdk';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions using SDK
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signUp: (data: { email?: string; phone?: string; password: string; displayName: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      signIn: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await sdk.auth.signIn({ identifier, password });
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Connect WebSocket after login
          sdk.connectSocket();
          
          return true;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to sign in';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      signUp: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await sdk.auth.signUp(data);
          
          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Connect WebSocket after signup
          sdk.connectSocket();
          
          return true;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to create account';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        try {
          await sdk.auth.signOut();
        } catch {
          // Continue with local logout even if API fails
        }
        
        // Disconnect WebSocket
        sdk.disconnectSocket();
        
        // Clear local state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      refreshSession: async () => {
        try {
          const session = await sdk.auth.getSession();
          set({
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logout: () => {
        sdk.disconnectSocket();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

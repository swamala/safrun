/**
 * SAFRUN Auth Store
 * Manages authentication state with Zustand + SDK integration
 */

import { create } from 'zustand';
import { sdk, tokenStorage, loadStoredTokens } from '@/lib/sdk';
import type { AuthUser } from '@safrun/sdk';

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  initialize: () => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Actions
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  initialize: async () => {
    set({ isLoading: true });
    
    try {
      // Load tokens from SecureStore
      const hasTokens = await loadStoredTokens();
      
      if (hasTokens) {
        // Verify session is still valid
        const session = await sdk.auth.getSession();
        set({
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        
        // Connect WebSocket
        sdk.connectSocket();
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      // Token expired or invalid
      await tokenStorage.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  signIn: async (identifier, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await sdk.auth.signIn({ identifier, password });
      
      // Store tokens
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect WebSocket
      sdk.connectSocket();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      set({
        error: message,
        isLoading: false,
      });
      return false;
    }
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });

    try {
      const response = await sdk.auth.signUp({
        email,
        password,
        displayName,
      });

      // Store tokens
      await tokenStorage.setTokens(response.accessToken, response.refreshToken);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      // Connect WebSocket
      sdk.connectSocket();

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
      set({
        error: message,
        isLoading: false,
      });
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
    
    // Clear tokens
    await tokenStorage.clearTokens();

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (user) {
      set({
        user: { ...user, ...updates },
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;

/**
 * SAFRUN SDK Instance for Mobile App
 * Single shared SDK instance configured with secure token storage
 */

import { createSafrunSDK } from '@safrun/sdk';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001';

// Token keys
const ACCESS_TOKEN_KEY = 'safrun_access_token';
const REFRESH_TOKEN_KEY = 'safrun_refresh_token';

// In-memory cache for faster access (SecureStore is async)
let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

// Token management using SecureStore
const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

const getRefreshToken = (): string | null => {
  return cachedRefreshToken;
};

const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  cachedAccessToken = accessToken;
  cachedRefreshToken = refreshToken;
  
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('[SDK] Failed to store tokens:', error);
  }
};

const clearTokens = async (): Promise<void> => {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[SDK] Failed to clear tokens:', error);
  }
};

// Load tokens from SecureStore on app start
export const loadStoredTokens = async (): Promise<boolean> => {
  try {
    cachedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return !!cachedAccessToken;
  } catch (error) {
    console.error('[SDK] Failed to load tokens:', error);
    return false;
  }
};

// Create SDK instance
export const sdk = createSafrunSDK({
  baseURL: API_URL,
  wsURL: WS_URL,
  timeout: 30000,
  getAccessToken,
  getRefreshToken,
  setTokens: (access, refresh) => {
    // Sync version for SDK config (async version called separately)
    cachedAccessToken = access;
    cachedRefreshToken = refresh;
    // Fire and forget the async storage
    setTokens(access, refresh);
  },
  clearTokens: () => {
    cachedAccessToken = null;
    cachedRefreshToken = null;
    clearTokens();
  },
  onTokenRefresh: (tokens) => {
    console.log('[SDK] Tokens refreshed');
  },
  onAuthError: () => {
    console.log('[SDK] Auth error - user needs to re-login');
  },
});

// Export async token operations
export const tokenStorage = {
  setTokens,
  clearTokens,
  loadStoredTokens,
  getAccessToken: () => cachedAccessToken,
  getRefreshToken: () => cachedRefreshToken,
};

export default sdk;


/**
 * SAFRUN SDK Instance for Web App
 * Single shared SDK instance configured with auth store
 */

import { createSafrunSDK } from '@safrun/sdk';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

// Token management using localStorage (works with existing auth.store)
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('auth-storage');
};

// Create SDK instance
export const sdk = createSafrunSDK({
  baseURL: API_URL,
  wsURL: WS_URL,
  timeout: 30000,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  onTokenRefresh: (tokens: { accessToken: string; refreshToken: string }) => {
    console.log('[SDK] Tokens refreshed');
  },
  onAuthError: () => {
    console.log('[SDK] Auth error - redirecting to login');
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
  },
});

export default sdk;


import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import type { SDKConfig, ApiError } from './types';

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}

export class HttpClient {
  private client: AxiosInstance;
  private config: SDKConfig;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private retryCount = new Map<string, number>();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000;

  constructor(config: SDKConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.config.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and retry
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while refreshing
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = this.config.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.client.post('/auth/refresh', {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            this.config.setTokens(accessToken, newRefreshToken);

            if (this.config.onTokenRefresh) {
              this.config.onTokenRefresh({ accessToken, refreshToken: newRefreshToken });
            }

            // Process queued requests
            this.processQueue(null, accessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as Error, null);
            this.config.clearTokens();
            if (this.config.onAuthError) {
              this.config.onAuthError();
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle retryable errors (5xx, network errors)
        if (this.shouldRetry(error, originalRequest)) {
          return this.retryRequest(originalRequest);
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private processQueue(error: Error | null, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        resolve(this.client(config));
      }
    });
    this.failedQueue = [];
  }

  private shouldRetry(error: AxiosError, config: InternalAxiosRequestConfig): boolean {
    const requestId = `${config.method}-${config.url}`;
    const currentRetries = this.retryCount.get(requestId) || 0;

    if (currentRetries >= this.MAX_RETRIES) {
      this.retryCount.delete(requestId);
      return false;
    }

    // Retry on network errors or 5xx
    const isNetworkError = !error.response;
    const isServerError = Boolean(error.response?.status && error.response.status >= 500);
    const isIdempotent = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'].includes(
      config.method?.toUpperCase() || ''
    );

    return (isNetworkError || isServerError) && isIdempotent;
  }

  private async retryRequest(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
    const requestId = `${config.method}-${config.url}`;
    const currentRetries = this.retryCount.get(requestId) || 0;
    this.retryCount.set(requestId, currentRetries + 1);

    // Exponential backoff
    const delay = this.RETRY_DELAY_BASE * Math.pow(2, currentRetries);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return this.client(config);
  }

  private normalizeError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return {
        statusCode: error.response.status,
        message: error.response.data.message || 'An error occurred',
        error: error.response.data.error,
        details: error.response.data.details,
      };
    }

    return {
      statusCode: 0,
      message: error.message || 'Network error',
      error: 'NETWORK_ERROR',
    };
  }

  // HTTP methods
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}


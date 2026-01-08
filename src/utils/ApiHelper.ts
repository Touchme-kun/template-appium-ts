/**
 * ApiHelper - API utility for test setup and cleanup
 * Provides HTTP client for backend interactions during tests
 */

import { Logger } from './Logger';

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

/**
 * ApiHelper class for making HTTP requests
 * Uses native fetch API
 */
export class ApiHelper {
  private static baseUrl: string = process.env.API_BASE_URL || 'http://localhost:3000/api';
  private static defaultTimeout: number = 30000;
  private static authToken: AuthToken | null = null;

  /**
   * Set base URL for API requests
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url;
    Logger.debug(`API base URL set to: ${url}`);
  }

  /**
   * Set authentication token
   */
  static setAuthToken(token: AuthToken): void {
    this.authToken = token;
    Logger.debug('Auth token set');
  }

  /**
   * Clear authentication token
   */
  static clearAuthToken(): void {
    this.authToken = null;
    Logger.debug('Auth token cleared');
  }

  /**
   * Build full URL
   */
  private static buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  /**
   * Build headers with auth token
   */
  private static buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `${this.authToken.tokenType || 'Bearer'} ${this.authToken.accessToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  private static async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { headers: customHeaders, timeout = this.defaultTimeout, retries = 0 } = options;
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(customHeaders);

    Logger.debug(`API ${method} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        const result: ApiResponse<T> = {
          status: response.status,
          statusText: response.statusText,
          data,
          headers: responseHeaders,
        };

        Logger.debug(`API Response: ${response.status} ${response.statusText}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        Logger.warn(`API request failed (attempt ${attempt + 1}/${retries + 1}): ${lastError.message}`);

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    clearTimeout(timeoutId);
    Logger.error(`API request failed after ${retries + 1} attempts`, lastError!);
    throw lastError;
  }

  /**
   * GET request
   */
  static async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST request
   */
  static async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  /**
   * PUT request
   */
  static async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  /**
   * PATCH request
   */
  static async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  /**
   * DELETE request
   */
  static async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // =====================
  // Test Data Operations
  // =====================

  /**
   * Create test user via API
   */
  static async createTestUser(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ id: string; email: string }> {
    Logger.info(`Creating test user: ${userData.email}`);

    const response = await this.post<{ id: string; email: string }>('/users', userData);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to create test user: ${response.statusText}`);
    }

    Logger.info(`Test user created: ${response.data.id}`);
    return response.data;
  }

  /**
   * Delete test user via API
   */
  static async deleteTestUser(userId: string): Promise<void> {
    Logger.info(`Deleting test user: ${userId}`);

    const response = await this.delete(`/users/${userId}`);

    if (response.status !== 204 && response.status !== 200) {
      Logger.warn(`Failed to delete test user: ${response.statusText}`);
    } else {
      Logger.info(`Test user deleted: ${userId}`);
    }
  }

  /**
   * Login and get auth token
   */
  static async login(email: string, password: string): Promise<AuthToken> {
    Logger.info(`Logging in user: ${email}`);

    const response = await this.post<AuthToken>('/auth/login', { email, password });

    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    this.setAuthToken(response.data);
    Logger.info('Login successful');
    return response.data;
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    this.clearAuthToken();
    Logger.info('Logged out');
  }

  /**
   * Cleanup all test data
   */
  static async cleanupTestData(testDataIds: { users?: string[]; products?: string[] }): Promise<void> {
    Logger.info('Cleaning up test data');

    const promises: Promise<void>[] = [];

    if (testDataIds.users) {
      for (const userId of testDataIds.users) {
        promises.push(this.deleteTestUser(userId).catch(() => {}));
      }
    }

    if (testDataIds.products) {
      for (const productId of testDataIds.products) {
        promises.push(
          this.delete(`/products/${productId}`)
            .then(() => {})
            .catch(() => {})
        );
      }
    }

    await Promise.all(promises);
    Logger.info('Test data cleanup completed');
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Wait for API to be ready
   */
  static async waitForApiReady(timeout: number = 60000, interval: number = 2000): Promise<void> {
    Logger.info('Waiting for API to be ready');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.healthCheck()) {
        Logger.info('API is ready');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('API did not become ready within timeout');
  }
}

export default ApiHelper;

/**
 * Civentral Mobile Application Unified HTTP Client
 * 
 * Provides centralized network request handling, dynamic base URL routing,
 * automatic session token injection, envelope normalization (BaseController format),
 * and structured HTTP 422 error parsing across municipal subsystems.
 */

import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { fetch as expoFetch } from 'expo/fetch';
import { AuthService, SECURE_SESSION_KEY } from './auth-service';

export const EDUCATION_API_BASE_URL =
  process.env.EXPO_PUBLIC_EDUCATION_API_BASE_URL || 'https://api.civentral.tech/api/v1';

export const CITIZEN_API_BASE_URL =
  process.env.EXPO_PUBLIC_CITIZEN_API_URL || 'https://api-citizen.civentral.tech/api/citizen';

export const CORE_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://civentral.tech/api/citizen';

export type ApiSubsystem = 'education' | 'citizen' | 'core';

export interface ApiRequestOptions {
  subsystem?: ApiSubsystem;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  skipAuth?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
  rawResponse?: boolean;
  unwrapEnvelope?: boolean;
}

export interface ApiResponseEnvelope<T = any> {
  status: 'success' | 'error' | number;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export class ApiValidationError extends Error {
  public errors: Record<string, string[]>;
  public statusCode: number;

  constructor(message: string, errors: Record<string, string[]> = {}, statusCode = 422) {
    super(message);
    this.name = 'ApiValidationError';
    this.errors = errors;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiValidationError.prototype);
  }

  public getFirstError(field?: string): string | null {
    if (field) {
      const fieldErrors = this.errors[field];
      return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
    }
    const keys = Object.keys(this.errors);
    if (keys.length === 0) return this.message || null;
    const firstField = this.errors[keys[0]];
    return firstField && firstField.length > 0 ? firstField[0] : null;
  }

  public getAllErrors(): string[] {
    const list: string[] = [];
    for (const [_, msgs] of Object.entries(this.errors)) {
      if (Array.isArray(msgs)) {
        msgs.forEach((m) => list.push(m));
      }
    }
    return list.length > 0 ? list : [this.message];
  }
}

export function isApiValidationError(err: unknown): err is ApiValidationError {
  return (
    err instanceof ApiValidationError ||
    (typeof err === 'object' && err !== null && (err as any).name === 'ApiValidationError')
  );
}

export function resolveBaseUrl(subsystem: ApiSubsystem = 'education'): string {
  switch (subsystem) {
    case 'citizen':
      return CITIZEN_API_BASE_URL.replace(/\/+$/, '');
    case 'core':
      return CORE_API_BASE_URL.replace(/\/+$/, '');
    case 'education':
    default:
      return EDUCATION_API_BASE_URL.replace(/\/+$/, '');
  }
}

export function buildUrl(
  endpoint: string,
  subsystem: ApiSubsystem = 'education',
  params?: Record<string, any>
): string {
  let fullUrl: string;
  if (/^https?:\/\//i.test(endpoint)) {
    fullUrl = endpoint;
  } else {
    const base = resolveBaseUrl(subsystem);
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    fullUrl = `${base}${cleanPath}`;
  }

  if (params && Object.keys(params).length > 0) {
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    }
    const queryString = query.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  return fullUrl;
}

export async function getAuthHeaders(
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  let token = AuthService.getAuthToken();
  if (!token) {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          token = parsed.token;
        }
      }
    } catch {}
  }

  const headers: Record<string, string> = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export function unpackApiResponse<T = any>(json: any): T {
  if (json === null || json === undefined) {
    return json as T;
  }

  if (typeof json === 'object') {
    const isSuccess =
      json.status === 'success' ||
      json.status === 200 ||
      json.success === true ||
      json.status_code === 200;

    if (isSuccess && json.data !== undefined) {
      return json.data as T;
    }

    if (json.data !== undefined && json.status !== 'error') {
      return json.data as T;
    }
  }

  return json as T;
}

async function executeRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = buildUrl(endpoint, options.subsystem, options.params);

  let headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (!options.skipAuth) {
    headers = await getAuthHeaders(headers);
  }

  let requestBody: any = undefined;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && body !== null) {
    if (isFormData) {
      requestBody = body;
      delete (headers as any)['Content-Type'];
      delete (headers as any)['content-type'];
    } else if (typeof body === 'string') {
      requestBody = body;
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    } else {
      requestBody = JSON.stringify(body);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 25000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    const fetchFn = typeof fetch !== 'undefined' ? fetch : expoFetch;
    response = await fetchFn(url, {
      method,
      headers,
      body: requestBody,
      signal: options.signal || controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s: ${method} ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (options.rawResponse) {
    return response as any;
  }

  if (response.status === 401) {
    await AuthService.handleUnauthorizedAccess();
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (response.status === 429) {
    const retryHeader = response.headers?.get ? response.headers.get('Retry-After') : null;
    let message = 'Too many requests. Please wait and try again.';
    try {
      const cloned = response.clone();
      const text = await cloned.text();
      if (text) {
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      }
    } catch {}

    if (message === 'Too many requests. Please wait and try again.' && retryHeader) {
      message = `Too many requests. Please wait ${retryHeader} seconds and try again.`;
    }

    Alert.alert('Too Many Requests', message);
    throw new Error(message);
  }

  const responseText = await response.text();
  let json: any = null;
  if (responseText) {
    try {
      json = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}: ${responseText.slice(0, 150)}`);
      }
      return responseText as any;
    }
  }

  if (response.status === 422) {
    const message = json?.message || 'The submitted information is invalid or incomplete.';
    const errors: Record<string, string[]> =
      json?.errors && typeof json.errors === 'object' ? json.errors : {};
    throw new ApiValidationError(message, errors, 422);
  }

  if (!response.ok) {
    const message = json?.message || `Request failed with HTTP status ${response.status}`;
    throw new Error(message);
  }

  if (options.unwrapEnvelope === false) {
    return json as T;
  }

  return unpackApiResponse<T>(json);
}

export const ApiClient = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    executeRequest<T>('GET', endpoint, undefined, options),

  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> =>
    executeRequest<T>('POST', endpoint, body, options),

  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> =>
    executeRequest<T>('PUT', endpoint, body, options),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> =>
    executeRequest<T>('PATCH', endpoint, body, options),

  delete: <T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    executeRequest<T>('DELETE', endpoint, undefined, options),

  request: <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<T> => executeRequest<T>(method, endpoint, body, options),

  buildUrl,
  resolveBaseUrl,
  getAuthHeaders,
  unpackApiResponse,
};

export default ApiClient;

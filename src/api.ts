import { API_BASE_URL, TOKEN_STORAGE_KEY } from './config';

export interface UserData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
}

export interface UserProfileData {
  dob?: string;
  time_of_birth?: string;
  place_of_birth?: string;
  gotra?: string;
  rashi?: string;
  nakshatra?: string;
  preferred_language?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserData;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string | null;
  date_of_birth?: string | null;
  gotra?: string | null;
  rashi?: string | null;
  nakshatra?: string | null;
  credits_remaining?: number;
  subscription_tier?: string;
}

export type PredictionApiMode = 'github' | 'gemini';

export function getPredictionApiMode(): PredictionApiMode {
  const mode = localStorage.getItem('muhurt_api_mode');
  return (mode === 'gemini' ? 'gemini' : 'github');
}

export function setPredictionApiMode(mode: PredictionApiMode): void {
  localStorage.setItem('muhurt_api_mode', mode);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a minute before trying again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.detail || 'An unexpected error occurred. Please try again.';
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function apiSignUp(payload: { name: string; email?: string; phone?: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiSignIn(payload: { login_input: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiGetMe(): Promise<UserData> {
  return request<UserData>('/api/auth/me');
}

export async function apiGetProfile(): Promise<UserProfileData> {
  return request<UserProfileData>('/api/profile');
}

export async function apiUpdateProfile(payload: UserProfileData): Promise<UserProfileData> {
  return request<UserProfileData>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function apiPredictForecast(payload: {
  start_date: string;
  end_date: string;
  muhurt_type_id: number;
  muhurt_name_en: string;
  muhurt_name_gu: string;
}): Promise<any> {
  return request<any>('/api/predict/forecast', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiPredictDate(payload: {
  target_date: string;
  muhurt_type_id: number;
  muhurt_name_en: string;
  muhurt_name_gu: string;
}): Promise<any> {
  return request<any>('/api/predict/date', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Admin API endpoints
export async function apiGetAdminUsers(search?: string): Promise<AdminUser[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<AdminUser[]>(`/api/admin/users${query}`);
}

export async function apiToggleUserStatus(userId: number): Promise<{ message: string; is_active: boolean }> {
  return request<{ message: string; is_active: boolean }>(`/api/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
  });
}

export async function apiDeleteUser(userId: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

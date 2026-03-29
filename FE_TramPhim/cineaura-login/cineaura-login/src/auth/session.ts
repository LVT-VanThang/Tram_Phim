import type { LoginResponse } from '../api/auth';

export const TOKEN_KEY = 'cineaura_token';
export const USER_KEY = 'cineaura_user';

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function storeSession(remember: boolean, data: LoginResponse): void {
  clearSession();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, data.token);
  storage.setItem(USER_KEY, JSON.stringify(data));
}

export function getStoredSession(): LoginResponse | null {
  const userJson = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  const token = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  if (!userJson || !token) return null;
  try {
    return JSON.parse(userJson) as LoginResponse;
  } catch {
    return null;
  }
}

/** JWT dùng cho Authorization Bearer (Spring Security yêu cầu ngoài /api/auth/**). */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

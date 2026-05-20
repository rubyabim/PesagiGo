import { create } from 'zustand';
import { isTokenExpired } from './token';

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setAuth: (token: string, user: AuthUser, persist?: 'local' | 'session') => void;
  clearAuth: () => void;
  hydrate: () => void;
};

const TOKEN_KEY = 'cms_access_token';
const USER_KEY = 'cms_user';

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setAuth: (token, user, persist = 'local') => {
    if (persist === 'session') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
  hydrate: () => {
    const token =
      localStorage.getItem(TOKEN_KEY) ??
      sessionStorage.getItem(TOKEN_KEY) ??
      null;
    const rawUser =
      localStorage.getItem(USER_KEY) ??
      sessionStorage.getItem(USER_KEY);

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      set({ hydrated: true, token: null, user: null });
      return;
    }

    let parsedUser: AuthUser | null = null;
    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser) as AuthUser;
      } catch {
        parsedUser = null;
      }
    }

    set({ hydrated: true, token, user: parsedUser });
  },
}));

export type { AuthUser };

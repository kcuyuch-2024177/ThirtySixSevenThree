import { create } from 'zustand';

const STORAGE_KEY = 'ynventory-auth';

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
    };
  } catch {
    return { token: null, user: null };
  }
}

function writeStoredAuth(token, user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
}

const initial = readStoredAuth();

export const useAuthStore = create((set, get) => ({
  token: initial.token,
  user: initial.user,

  setAuth: (token, user = null) => {
    writeStoredAuth(token, user);
    set({ token, user });
  },

  setUser: (user) => {
    const token = get().token;
    writeStoredAuth(token, user);
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },

  isAuthenticated: () => Boolean(get().token),
}));

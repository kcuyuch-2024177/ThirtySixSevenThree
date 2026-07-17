import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,

  setAuth: (token, user = null) => set({ token, user }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ token: null, user: null }),
  isAuthenticated: () => Boolean(get().token),
}));

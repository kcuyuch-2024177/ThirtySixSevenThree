import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_THRESHOLD = 5;

export const useAlertsStore = create(
  persist(
    (set, get) => ({
      threshold: DEFAULT_THRESHOLD,
      setThreshold: (value) => {
        const num = Number(value);
        if (Number.isNaN(num) || !Number.isInteger(num) || num < 1) return;
        set({ threshold: num });
      },
      getThreshold: () => get().threshold,
    }),
    {
      name: 'ynventory-alerts',
      partialize: (state) => ({ threshold: state.threshold }),
    },
  ),
);

export { DEFAULT_THRESHOLD };

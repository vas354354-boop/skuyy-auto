import { create } from 'zustand';
import { authService } from '../services/api';
import { clearSession, getSession, saveSession } from '../services/session';
import type { AdminUser } from '../services/session';

interface AuthStore {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getSession()?.user ?? null,

  login: async (email, password) => {
    const { token, user } = await authService.login(email, password);
    saveSession({ token, user });
    set({ user });
  },

  logout: async () => {
    await authService.logout();
    clearSession();
    set({ user: null });
  },
}));

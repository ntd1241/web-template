import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store (global client state). Lưu user + token, persist vào localStorage.
 * Server state (danh sách, chi tiết...) KHÔNG để ở đây — dùng React Query.
 *
 * Permission check ở frontend chỉ là UX (xem docs/03). Backend vẫn phải kiểm tra quyền.
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (payload: {
    user: AuthUser;
    token: string;
    refreshToken?: string | null;
  }) => void;
  setPermissions: (permissions: string[]) => void;
  updateTokens: (payload: {
    token: string;
    refreshToken?: string | null;
  }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: ({ user, token, refreshToken = null }) =>
        set({ user, token, refreshToken }),
      setPermissions: (permissions) =>
        set((state) =>
          state.user ? { user: { ...state.user, permissions } } : state,
        ),
      updateTokens: ({ token, refreshToken }) =>
        set((state) => ({
          token,
          refreshToken:
            refreshToken === undefined ? state.refreshToken : refreshToken,
        })),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      hasPermission: (permission) =>
        get().user?.permissions.includes(permission) ?? false,
    }),
    { name: 'auth-storage' },
  ),
);

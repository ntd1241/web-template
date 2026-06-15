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
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      hasPermission: (permission) =>
        get().user?.permissions.includes(permission) ?? false,
    }),
    { name: 'auth-storage' },
  ),
);

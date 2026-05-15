import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const LEGACY_AUTH_KEY = "prime_admin_auth";
const LEGACY_SESSION_KEY = "prime_admin_auth_session";
const STORE_STORAGE_KEY = "prime_admin_auth_store";

function isAuthStateActive(authState) {
  return (
    Boolean(authState?.loginId) &&
    Number.isFinite(authState?.expiresAt) &&
    authState.expiresAt > Date.now()
  );
}

function readLegacyAuth() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isAuthStateActive(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// auth store는 기존 Context + storage helper가 하던 역할을 하나로 합친다.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      auth: readLegacyAuth(),
      initialized: false,

      initialize: () => {
        if (get().initialized) return;

        // 첫 실행에서는 legacy localStorage 값도 흡수해서
        // 기존 로그인 세션을 잃지 않고 store 기반으로 전환한다.
        const legacyAuth = readLegacyAuth();
        const nextAuth = isAuthStateActive(get().auth)
          ? get().auth
          : legacyAuth;

        set({
          auth: isAuthStateActive(nextAuth) ? nextAuth : null,
          initialized: true,
        });
      },

      login: (nextAuth) => {
        if (!isAuthStateActive(nextAuth)) return;
        set({ auth: nextAuth });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
        }

        set({ auth: null });
      },

      clearExpired: () => {
        if (!isAuthStateActive(get().auth)) {
          set({ auth: null });
        }
      },
    }),
    {
      name: STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: isAuthStateActive(state.auth) ? state.auth : null,
      }),
    },
  ),
);

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) =>
  isAuthStateActive(state.auth);

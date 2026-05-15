import { useEffect } from "react";
import { useAuthStore } from "../../features/auth/store/useAuthStore";
import { useInquiryStore } from "../../features/inquiry/store/useInquiryStore";
import { usePropertyStore } from "../../features/property/store/usePropertyStore";

// AppStateBootstrap은 앱 시작 시 각 feature store를 초기화하고,
// 인증 만료 타이머처럼 앱 전역에서 한 번만 돌면 되는 effect를 모아두는 자리다.
export default function AppStateBootstrap() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const auth = useAuthStore((state) => state.auth);
  const clearExpired = useAuthStore((state) => state.clearExpired);

  const initializeInquiries = useInquiryStore((state) => state.initialize);
  const initializeProperties = usePropertyStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
    initializeInquiries();
    initializeProperties();
  }, [initializeAuth, initializeInquiries, initializeProperties]);

  useEffect(() => {
    // auth store는 expiresAt만 알고 있으므로,
    // 실제 만료 시점 감시는 bootstrap에서 타이머로 처리한다.
    if (!auth?.expiresAt) return undefined;

    const expiresIn = auth.expiresAt - Date.now();
    if (expiresIn <= 0) {
      clearExpired();
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      clearExpired();
    }, expiresIn);

    return () => window.clearTimeout(timerId);
  }, [auth?.expiresAt, clearExpired]);

  return null;
}

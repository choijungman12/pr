import { Navigate, Route, Routes } from "react-router-dom";
import {
  selectIsAuthenticated,
  useAuthStore,
} from "../../features/auth/store/useAuthStore";
import RequireAdminAuth from "../../features/auth/ui/RequireAdminAuth";
import AdminPage from "../../pages/AdminPage";
import LoginPage from "../../pages/LoginPage";
import { ROUTE_PATHS } from "./routePaths";

function RootRedirect() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // 루트 진입 시 인증 상태만 보고 관리자 콘솔 또는 로그인으로 보낸다.
  return (
    <Navigate
      to={isAuthenticated ? ROUTE_PATHS.ADMIN : ROUTE_PATHS.LOGIN}
      replace
    />
  );
}

// AppRoutes는 route entry와 인증 보호 관계만 정의한다.
// 화면 구현 자체는 pages와 features 쪽에서 담당한다.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.HOME} element={<RootRedirect />} />
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTE_PATHS.ADMIN}
        element={
          <RequireAdminAuth>
            <AdminPage />
          </RequireAdminAuth>
        }
      />
      <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
    </Routes>
  );
}

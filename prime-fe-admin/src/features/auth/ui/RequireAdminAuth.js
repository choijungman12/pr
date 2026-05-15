import { Navigate, useLocation } from 'react-router-dom';
import {
  selectIsAuthenticated,
  useAuthStore,
} from "../store/useAuthStore";

// 인증이 없는 상태에서 보호 페이지에 접근하면
// 현재 위치를 state에 담아 로그인 후 복귀에 활용한다.
export default function RequireAdminAuth({ children }) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

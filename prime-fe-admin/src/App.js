import { BrowserRouter } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders";
import AppRoutes from "./app/routes/AppRoutes";

// App은 브라우저 라우터와 전역 provider 조립만 담당한다.
// 실제 라우트 선언과 인증 보호 로직은 app/routes 쪽으로 분리했다.
export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}

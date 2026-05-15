import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestAdminSignIn } from "../api/signIn";
import { ACTION_TICKET_MAX_AGE_MS } from "../model/auth.constants";
import { selectIsAuthenticated, useAuthStore } from "../store/useAuthStore";

// LoginForm은 입력 UI와 제출 흐름만 담당하고,
// 실제 인증 API 해석은 auth/api 계층에서 처리한다.
export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from || "/admin";

  useEffect(() => {
    // 이미 인증된 상태로 로그인 페이지에 오면
    // 원래 가려던 페이지 또는 관리자 메인으로 되돌린다.
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const submit = async (event) => {
    event.preventDefault();

    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId || !password) {
      setError("로그인 아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await requestAdminSignIn({
        loginId: trimmedLoginId,
        password,
      });

      if (!result.ok) {
        setError(result.errorMessage);
        return;
      }

      // 백엔드가 내려준 loginId와 프론트 세션 만료 시각을 합쳐
      // auth store에 저장할 세션 객체를 만든다.
      login({
        loginId: result.loginId,
        expiresAt: Date.now() + ACTION_TICKET_MAX_AGE_MS,
      });

      navigate(from, { replace: true });
    } catch {
      setError(
        "서버 연결에 실패했습니다. API 주소 또는 네트워크를 확인해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
        <header className="mb-8">
          <p className="text-sm text-orange-600 font-semibold">
            Prime Admin Console
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            관리자 로그인
          </h1>
        </header>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="loginId"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              로그인 아이디
            </label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="이메일"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="비밀번호"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}

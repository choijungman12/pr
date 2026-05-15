import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/authState";
import { logoutUser } from "../../utils/auth/authApi";
import { clearStoredAuthUser } from "../../utils/auth/authStorage";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const requestLogout = async () => {
      try {
        await logoutUser();
        clearStoredAuthUser();
        dispatch(logout());
        navigate("/", { replace: true });
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.message || "로그아웃에 실패했습니다.");
      }
    };

    requestLogout();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex bg-gray-50 items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-gray-100 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
          <i className="ri-logout-box-r-line text-2xl"></i>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          로그아웃 처리 중입니다
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          잠시만 기다려주세요. 인증 쿠키와 사용자 상태를 정리하고 있습니다.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-500 text-sm px-4 py-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Logout;

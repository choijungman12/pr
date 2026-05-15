import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../../redux/authState";
import { loginWithEmail, signUpWithEmail } from "../../utils/auth/authApi";
import { saveStoredAuthUser } from "../../utils/auth/authStorage";
import {
  getSocialLoginUrl,
  redirectToSocialLogin,
} from "../../utils/auth/socialAuth";

const validationRules = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
  password: /^.{6,}$/,
  phone: /^[0-9]{10,11}$/,
};

const initialLoginTouched = {
  email: false,
  password: false,
};

const initialSignUpTouched = {
  email: false,
  password: false,
  confirmPassword: false,
  phone: false,
};

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginTouched, setLoginTouched] = useState(initialLoginTouched);
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    gender: "",
    phone: "",
  });
  const [signUpTouched, setSignUpTouched] = useState(initialSignUpTouched);

  const socialLoginUrls = {
    kakao: getSocialLoginUrl("kakao"),
    naver: getSocialLoginUrl("naver"),
    google: getSocialLoginUrl("google"),
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.get("status") !== "fail") {
      return;
    }

    window.alert("소셜로그인에 실패했습니다. 다시 시도해주세요.");
    searchParams.delete("status");

    navigate(
      {
        pathname: "/login",
        search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      },
      { replace: true }
    );
  }, [location.search, navigate]);

  const clearError = () => setError("");

  const getFieldClassName = ({ hasError = false, hasTrailingIcon = false }) =>
    [
      "w-full h-14 pl-12 bg-gray-50 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all",
      hasTrailingIcon ? "pr-12" : "pr-4",
      hasError
        ? "border-red-300 focus:ring-red-500"
        : "border-transparent focus:ring-teal-500",
    ].join(" ");

  const applyAuthSuccess = (user) => {
    saveStoredAuthUser(user);
    dispatch(login(user));
    navigate("/", { replace: true });
  };

  const getLoginFieldError = (field, form = loginForm) => {
    switch (field) {
      case "email":
        if (!form.email.trim()) {
          return "이메일을 입력해주세요.";
        }
        if (!validationRules.email.test(form.email.trim())) {
          return "이메일 형식을 확인해주세요.";
        }
        return "";
      case "password":
        if (!form.password) {
          return "비밀번호를 입력해주세요.";
        }
        if (!validationRules.password.test(form.password)) {
          return "비밀번호는 6자 이상 입력해주세요.";
        }
        return "";
      default:
        return "";
    }
  };

  const getSignUpFieldError = (field, form = signUpForm) => {
    switch (field) {
      case "email":
        if (!form.email.trim()) {
          return "회원가입 이메일을 입력해주세요.";
        }
        if (!validationRules.email.test(form.email.trim())) {
          return "회원가입 이메일 형식을 확인해주세요.";
        }
        return "";
      case "password":
        if (!form.password) {
          return "비밀번호를 입력해주세요.";
        }
        if (!validationRules.password.test(form.password)) {
          return "비밀번호는 6자 이상 입력해주세요.";
        }
        return "";
      case "confirmPassword":
        if (!form.confirmPassword) {
          return "비밀번호 확인을 입력해주세요.";
        }
        if (form.password !== form.confirmPassword) {
          return "비밀번호 확인이 일치하지 않습니다.";
        }
        return "";
      case "phone":
        if (
          form.phone.trim() &&
          !validationRules.phone.test(form.phone.trim())
        ) {
          return "전화번호는 숫자만 10~11자리로 입력해주세요.";
        }
        return "";
      default:
        return "";
    }
  };

  const getVisibleLoginFieldError = (field) =>
    loginTouched[field] ? getLoginFieldError(field) : "";

  const getVisibleSignUpFieldError = (field) =>
    signUpTouched[field] ? getSignUpFieldError(field) : "";

  const updateLoginForm = (field) => (event) => {
    const { value } = event.target;
    clearError();
    setLoginForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateSignUpForm = (field) => (event) => {
    const rawValue = event.target.value;
    const nextValue =
      field === "phone" ? rawValue.replace(/[^0-9]/g, "") : rawValue;

    clearError();
    setSignUpForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  const handleLoginBlur = (field) => () => {
    setLoginTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSignUpBlur = (field) => () => {
    setSignUpTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSocialLogin = (provider) => {
    const loginUrl = socialLoginUrls[provider];

    if (!loginUrl) {
      setError("소셜 로그인 주소 설정이 비어 있습니다.");
      return;
    }

    clearError();
    redirectToSocialLogin(provider);
  };

  const validateLoginForm = () => {
    const nextTouched = {
      email: true,
      password: true,
    };

    setLoginTouched(nextTouched);

    return !Object.keys(nextTouched).some((field) =>
      Boolean(getLoginFieldError(field, loginForm)),
    );
  };

  const validateSignUpForm = () => {
    const nextTouched = {
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
    };

    setSignUpTouched(nextTouched);

    return !Object.keys(nextTouched).some((field) =>
      Boolean(getSignUpFieldError(field, signUpForm)),
    );
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!validateLoginForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginWithEmail({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      applyAuthSuccess(user);
    } catch (submitError) {
      setError(submitError.message || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (event) => {
    event.preventDefault();

    if (!validateSignUpForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signUpWithEmail({
        email: signUpForm.email.trim(),
        password: signUpForm.password,
        name: signUpForm.name.trim(),
        gender: signUpForm.gender,
        phone: signUpForm.phone.trim(),
      });

      applyAuthSuccess(user);
    } catch (submitError) {
      setError(submitError.message || "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignUpMode = authMode === "signup";

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700"></div>
        <div className="absolute inset-0 bg-[url('https://readdy.ai/api/search-image?query=abstract%20geometric%20pattern%20with%20soft%20gradients%20modern%20minimalist%20design%20subtle%20texture%20professional%20background&width=800&height=1000&seq=loginbg2&orientation=portrait')] bg-cover bg-center opacity-10"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <i className="ri-building-4-fill text-4xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">프라임지분거래소</h1>
              <p className="text-white/80 text-sm">PRIME SHARE EXCHANGE</p>
            </div>
          </div>

          <div className="w-72 h-72 mb-10 relative">
            <img
              src="https://readdy.ai/api/search-image?query=3D%20isometric%20illustration%20of%20modern%20city%20buildings%20with%20investment%20charts%20and%20coins%20floating%20around%20clean%20background%20professional%20business%20illustration%20minimalist%20style%20teal%20green%20theme&width=400&height=400&seq=login3d-user&orientation=squarish"
              alt="User Illustration"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-3 text-nowrap">
              {isSignUpMode
                ? "몇 가지 정보만 입력하면 바로 시작할 수 있습니다."
                : "스마트한 부동산 투자의 시작"}
            </h2>
            <p className="text-white/80 leading-relaxed text-sm">
              {isSignUpMode ? (
                <>
                  회원가입이 완료되면 즉시 로그인 상태가 적용됩니다.
                  <br />
                  관심 매물 조회와 문의 기능을 바로 이용해보세요.
                </>
              ) : (
                <>
                  다중 통화 지원으로 글로벌 투자까지
                  <br />
                  원화, 달러, USDT로 매물을 확인하세요
                </>
              )}
            </p>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm">
              <span className="flex items-center gap-2">
                <i className="ri-shield-check-line"></i>안전한 거래
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-global-line"></i>글로벌 투자
              </span>
              <span className="flex items-center gap-2">
                <i className="ri-line-chart-line"></i>실시간 분석
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-teal-500 to-teal-600">
              <i className="ri-building-4-fill text-white text-2xl"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">
              프라임지분거래소
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/*
            추후 매물 등록자 로그인 복구 시 기존 상단 탭을 다시 연결합니다.
            <div className="flex">
              <button type="button">일반 회원 로그인</button>
              <button type="button">매물 등록자 로그인</button>
            </div>
            */}

            <div className="p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-3">
                  <i className="ri-user-line"></i>
                  일반 회원 전용
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isSignUpMode ? "일반 회원가입" : "일반 회원 로그인"}
                </h2>
                <p className="text-gray-500 text-sm">
                  투자 정보 조회 및 매물 문의 서비스를 이용할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    clearError();
                    setLoginTouched(initialLoginTouched);
                  }}
                  className={`py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                    !isSignUpMode
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    clearError();
                    setSignUpTouched(initialSignUpTouched);
                  }}
                  className={`py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                    isSignUpMode
                      ? "bg-white text-teal-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  회원가입
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-5">
                  <i className="ri-error-warning-line"></i>
                  <span>{error}</span>
                </div>
              )}

              {!isSignUpMode ? (
                <>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                          <i className="ri-mail-line"></i>
                        </div>
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={updateLoginForm("email")}
                          onBlur={handleLoginBlur("email")}
                          placeholder="이메일 주소"
                          autoComplete="email"
                          className={getFieldClassName({
                            hasError: Boolean(
                              getVisibleLoginFieldError("email"),
                            ),
                          })}
                        />
                      </div>
                      {getVisibleLoginFieldError("email") && (
                        <p className="mt-2 text-xs text-red-500">
                          {getVisibleLoginFieldError("email")}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                          <i className="ri-lock-line"></i>
                        </div>
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={updateLoginForm("password")}
                          onBlur={handleLoginBlur("password")}
                          placeholder="비밀번호"
                          autoComplete="current-password"
                          className={getFieldClassName({
                            hasError: Boolean(
                              getVisibleLoginFieldError("password"),
                            ),
                            hasTrailingIcon: true,
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <i
                            className={
                              showLoginPassword
                                ? "ri-eye-off-line"
                                : "ri-eye-line"
                            }
                          ></i>
                        </button>
                      </div>
                      {getVisibleLoginFieldError("password") && (
                        <p className="mt-2 text-xs text-red-500">
                          {getVisibleLoginFieldError("password")}
                        </p>
                      )}
                    </div>

                    {/* <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => navigate("/find-password")}
                        className="text-sm text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap"
                      >
                        비밀번호 찾기
                      </button>
                    </div> */}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {isSubmitting ? "로그인 중..." : "로그인"}
                    </button>
                  </form>

                  <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm text-gray-400">
                        간편 로그인
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("kakao")}
                      className="w-full h-12 bg-[#FEE500] text-gray-900 font-medium rounded-xl hover:bg-[#FDD800] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-kakao-talk-fill text-lg"></i>
                      카카오로 로그인
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("naver")}
                      className="w-full h-12 bg-[#03C75A] text-white font-medium rounded-xl hover:bg-[#02B350] transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <span className="text-lg font-bold">N</span>
                      네이버로 로그인
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialLogin("google")}
                      className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <GoogleIcon />
                      Google로 로그인
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                        <i className="ri-mail-line"></i>
                      </div>
                      <input
                        type="email"
                        value={signUpForm.email}
                        onChange={updateSignUpForm("email")}
                        onBlur={handleSignUpBlur("email")}
                        placeholder="회원가입 이메일"
                        autoComplete="email"
                        className={getFieldClassName({
                          hasError: Boolean(
                            getVisibleSignUpFieldError("email"),
                          ),
                        })}
                      />
                    </div>
                    {getVisibleSignUpFieldError("email") && (
                      <p className="mt-2 text-xs text-red-500">
                        {getVisibleSignUpFieldError("email")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                        <i className="ri-lock-line"></i>
                      </div>
                      <input
                        type={showSignUpPassword ? "text" : "password"}
                        value={signUpForm.password}
                        onChange={updateSignUpForm("password")}
                        onBlur={handleSignUpBlur("password")}
                        placeholder="비밀번호 (6자 이상)"
                        autoComplete="new-password"
                        className={getFieldClassName({
                          hasError: Boolean(
                            getVisibleSignUpFieldError("password"),
                          ),
                          hasTrailingIcon: true,
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i
                          className={
                            showSignUpPassword
                              ? "ri-eye-off-line"
                              : "ri-eye-line"
                          }
                        ></i>
                      </button>
                    </div>
                    {getVisibleSignUpFieldError("password") && (
                      <p className="mt-2 text-xs text-red-500">
                        {getVisibleSignUpFieldError("password")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                        <i className="ri-lock-password-line"></i>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={signUpForm.confirmPassword}
                        onChange={updateSignUpForm("confirmPassword")}
                        onBlur={handleSignUpBlur("confirmPassword")}
                        placeholder="비밀번호 확인"
                        autoComplete="new-password"
                        className={getFieldClassName({
                          hasError: Boolean(
                            getVisibleSignUpFieldError("confirmPassword"),
                          ),
                          hasTrailingIcon: true,
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i
                          className={
                            showConfirmPassword
                              ? "ri-eye-off-line"
                              : "ri-eye-line"
                          }
                        ></i>
                      </button>
                    </div>
                    {getVisibleSignUpFieldError("confirmPassword") && (
                      <p className="mt-2 text-xs text-red-500">
                        {getVisibleSignUpFieldError("confirmPassword")}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                          <i className="ri-user-line"></i>
                        </div>
                        <input
                          type="text"
                          value={signUpForm.name}
                          onChange={updateSignUpForm("name")}
                          placeholder="이름 또는 닉네임"
                          autoComplete="name"
                          className={getFieldClassName({})}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                          <i className="ri-phone-line"></i>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={signUpForm.phone}
                          onChange={updateSignUpForm("phone")}
                          onBlur={handleSignUpBlur("phone")}
                          placeholder="전화번호"
                          autoComplete="tel"
                          className={getFieldClassName({
                            hasError: Boolean(
                              getVisibleSignUpFieldError("phone"),
                            ),
                          })}
                        />
                      </div>
                      {getVisibleSignUpFieldError("phone") && (
                        <p className="mt-2 text-xs text-red-500">
                          {getVisibleSignUpFieldError("phone")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                      <i className="ri-men-line"></i>
                    </div>
                    <select
                      value={signUpForm.gender}
                      onChange={updateSignUpForm("gender")}
                      className={`${getFieldClassName({})} appearance-none`}
                    >
                      <option value="">성별 선택 안함</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <i className="ri-arrow-down-s-line"></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold py-3.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {isSubmitting ? "회원가입 처리 중..." : "회원가입"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            로그인 및 회원가입 시{" "}
            <span className="text-gray-500 cursor-pointer">이용약관</span> 및{" "}
            <span className="text-gray-500 cursor-pointer">
              개인정보처리방침
            </span>
            에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

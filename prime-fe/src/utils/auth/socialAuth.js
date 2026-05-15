const AUTH_BASE_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

const SOCIAL_LOGIN_PATHS = {
  kakao: "/oauth/kakao/login?client=prime",
  naver: "/oauth/naver/login?client=prime",
  google: "/oauth/google/login?client=prime",
};

export const getSocialLoginUrl = (provider) => {
  const path = SOCIAL_LOGIN_PATHS[provider];

  if (!AUTH_BASE_URL || !path) {
    return "";
  }

  return `${AUTH_BASE_URL}${path}`;
};

export const redirectToSocialLogin = (provider) => {
  const loginUrl = getSocialLoginUrl(provider);

  if (!loginUrl) {
    throw new Error("소셜 로그인 주소를 확인할 수 없습니다.");
  }

  window.location.href = loginUrl;
};

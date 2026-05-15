import { normalizeAuthUser } from "./authStorage";

const API_BASE_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(
  /\/$/,
  ""
);

const createAuthError = (message, status, payload) => {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
};

const getRequestUrl = (path) => {
  if (!API_BASE_URL) {
    throw createAuthError(
      "REACT_APP_BACKEND_URL 설정이 필요합니다.",
      500,
      null
    );
  }

  return `${API_BASE_URL}${path}`;
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(getRequestUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);

  return { response, payload };
};

const getLoginFailMessage = (failType) => {
  switch (failType) {
    case "email":
      return "가입된 이메일을 찾을 수 없습니다.";
    case "password":
      return "비밀번호가 올바르지 않습니다.";
    case "social":
      return "소셜 가입 계정입니다. 소셜 로그인 기능은 추후 지원될 예정입니다.";
    default:
      return "로그인에 실패했습니다.";
  }
};

export const loginWithEmail = async ({ email, password }) => {
  const { response, payload } = await requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (payload?.status === "success") {
    return normalizeAuthUser(payload.data);
  }

  if (payload?.status === "fail") {
    throw createAuthError(
      getLoginFailMessage(payload.fail),
      response.status,
      payload
    );
  }

  throw createAuthError(
    payload?.message || "로그인 요청에 실패했습니다.",
    response.status,
    payload
  );
};

export const signUpWithEmail = async ({
  email,
  password,
  name,
  gender,
  phone,
}) => {
  const requestBody = { email, password };

  if (name) {
    requestBody.name = name;
  }

  if (gender) {
    requestBody.gender = gender;
  }

  if (phone) {
    requestBody.phone = phone;
  }

  const { response, payload } = await requestJson("/user/sign-up", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  if (payload?.status === "success") {
    return normalizeAuthUser(payload.data);
  }

  if (response.status === 409) {
    throw createAuthError("이미 가입된 이메일입니다.", response.status, payload);
  }

  if (response.status === 400) {
    throw createAuthError(
      payload?.message || "회원가입 입력값을 다시 확인해주세요.",
      response.status,
      payload
    );
  }

  throw createAuthError(
    payload?.message || "회원가입 요청에 실패했습니다.",
    response.status,
    payload
  );
};

export const logoutUser = async () => {
  const { response, payload } = await requestJson("/auth/logout", {
    method: "GET",
  });

  if (response.ok && payload?.status === "success") {
    return payload;
  }

  throw createAuthError(
    payload?.message || "로그아웃에 실패했습니다.",
    response.status,
    payload
  );
};

export const fetchCurrentUser = async () => {
  const { response, payload } = await requestJson("/user/info", {
    method: "GET",
    headers: {
      "x-requested-with": "prime-fe",
    },
  });

  if (response.ok && payload?.status === "success") {
    return normalizeAuthUser(payload.data);
  }

  if (response.status === 401) {
    throw createAuthError(
      payload?.message || "로그인 정보가 만료되었습니다.",
      response.status,
      payload
    );
  }

  if (response.status === 404) {
    throw createAuthError(
      payload?.message || "사용자 정보를 찾을 수 없습니다.",
      response.status,
      payload
    );
  }

  throw createAuthError(
    payload?.message || "사용자 정보 조회에 실패했습니다.",
    response.status,
    payload
  );
};

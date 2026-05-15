import axios from "axios";

export const REQUESTED_WITH_HEADER_NAME = "X-REQUESTED-WITH";
export const REQUESTED_WITH_HEADER_VALUE = "request";

// 환경변수에 trailing slash가 들어와도 경로 결합이 깨지지 않도록 정규화한다.
export function normalizeBaseUrl(value) {
  if (!value) return "";
  return value.replace(/\/$/, "");
}

// 특정 API 경로를 절대 URL 또는 same-origin 상대 경로로 조합한다.
export function buildApiUrl(path) {
  const apiBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);
  return `${apiBaseUrl}${path}`;
}

// 관리자 API는 서버가 요청 출처를 구분할 수 있도록
// 공통 헤더를 한 번 더 붙여서 보낸다.
export function appendRequestedWithHeader(config) {
  if (typeof config.headers?.set === "function") {
    config.headers.set(REQUESTED_WITH_HEADER_NAME, REQUESTED_WITH_HEADER_VALUE);
    return config;
  }

  config.headers = {
    ...(config.headers || {}),
    [REQUESTED_WITH_HEADER_NAME]: REQUESTED_WITH_HEADER_VALUE,
  };
  return config;
}

// axios 에러 객체에서 HTTP status만 안전하게 꺼내는 헬퍼다.
export function getErrorStatus(error) {
  return error?.response?.status || 0;
}

export function createApiClient({ includeRequestedWithHeader = false } = {}) {
  const apiBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL);

  // baseURL이 비어 있으면 react-scripts dev server 기준 same-origin 요청으로 동작한다.
  const client = axios.create({
    baseURL: apiBaseUrl || undefined,
    withCredentials: true,
  });

  if (includeRequestedWithHeader) {
    client.interceptors.request.use((config) =>
      appendRequestedWithHeader(config),
    );
  }

  return client;
}

export const publicApi = createApiClient();
export const adminApi = createApiClient({
  includeRequestedWithHeader: true,
});

// 관리자 전용 엔드포인트는 공통 헤더가 붙은 adminApi를 통해 호출한다.
export function requestAdminApi(path, config = {}) {
  return adminApi(path, config);
}

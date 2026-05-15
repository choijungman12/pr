/**
 * 관리자 로그인 응답 원문 구조를 화면에서 사용할 값으로 정규화한다.
 *
 * axios 응답 단계 설명:
 * - response.data: HTTP body 전체
 * - response.data.data: 백엔드 공통 응답 envelope 안의 실제 payload
 * - response.data.data.login_id: 인증에 성공한 관리자 로그인 아이디
 */
export function mapAdminSignInResponse(response) {
  const returnedLoginId = response.data?.data?.login_id;

  if (!returnedLoginId) {
    return {
      ok: false,
      status: response.status,
      errorMessage: "로그인 응답 형식이 올바르지 않습니다.",
    };
  }

  return {
    ok: true,
    status: response.status,
    loginId: returnedLoginId,
  };
}

/**
 * 관리자 로그아웃 응답에서 현재 세션의 로그인 아이디를 꺼낸다.
 *
 * axios 응답 단계 설명:
 * - response.data: HTTP body 전체
 * - response.data.data: 로그아웃 결과 payload
 * - response.data.data.login_id: 로그아웃된 관리자 로그인 아이디
 */
export function mapAdminSignOutResponse(response) {
  return {
    ok: true,
    status: response.status,
    loginId: response.data?.data?.login_id || "",
  };
}

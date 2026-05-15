import { getErrorStatus, publicApi } from "../../../shared/api/httpClient";
import { mapAdminSignInResponse } from "./mapAuthResponse";

function mapSignInError(status) {
  switch (status) {
    case 400:
      return "요청 형식이 올바르지 않습니다. 로그인 아이디와 비밀번호를 다시 확인해주세요.";
    case 401:
      return "아이디 또는 비밀번호가 일치하지 않습니다.";
    case 404:
      return "허용되지 않은 관리자 로그인 아이디입니다.";
    case 500:
      return "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 관리자 로그인 요청
 *
 * 요청 body:
 * - login_id: 서버가 기대하는 관리자 계정 식별자
 * - password: 관리자 비밀번호
 *
 * 응답 body:
 * - response.data.data.login_id: 인증에 성공한 관리자 로그인 아이디
 */
export async function requestAdminSignIn({ loginId, password }) {
  try {
    const response = await publicApi.post("/sign/in", {
      login_id: loginId,
      password,
    });

    return mapAdminSignInResponse(response);
  } catch (error) {
    const status = getErrorStatus(error);

    return {
      ok: false,
      status,
      errorMessage: mapSignInError(status),
    };
  }
}

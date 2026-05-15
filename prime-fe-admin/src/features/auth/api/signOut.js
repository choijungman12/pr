import { getErrorStatus, requestAdminApi } from "../../../shared/api/httpClient";
import { mapAdminSignOutResponse } from "./mapAuthResponse";

function mapSignOutError(status) {
  switch (status) {
    case 401:
      return "인증 정보가 없거나 만료되었습니다. 다시 로그인해주세요.";
    case 500:
      return "서버 내부 오류로 로그아웃하지 못했습니다. 잠시 후 다시 시도해주세요.";
    default:
      return "로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.";
  }
}

/**
 * 관리자 로그아웃 요청
 *
 * 응답 body:
 * - response.data.data.login_id: 로그아웃 처리된 관리자 로그인 아이디
 * - 프론트에서는 이 값을 표시용으로만 사용하고, 실제 세션 정리는 Context 쪽에서 처리한다
 */
export async function requestAdminSignOut() {
  try {
    const response = await requestAdminApi("/sign/out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {},
    });

    return mapAdminSignOutResponse(response);
  } catch (error) {
    const status = getErrorStatus(error);

    return {
      ok: false,
      status,
      errorMessage: mapSignOutError(status),
    };
  }
}

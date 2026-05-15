import { requestAdminApi } from "../../../shared/api/httpClient";

/**
 * 토지 매물 등록 요청
 *
 * 응답 규칙:
 * - response.data.data: 등록 완료 후 서버가 내려주는 저장 결과 payload
 * - 현재 화면에서는 table_name, real_region_id 값을 성공 안내에 표시한다
 */
export function requestLandRegister(payload) {
  return requestAdminApi("/land/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: payload,
  });
}

import { requestAdminApi } from "../../../shared/api/httpClient";

/**
 * 등록 가능한 지역 코드 목록 조회
 *
 * 응답 규칙:
 * - response.data.data: 저장 가능한 region code 배열
 * - 예: ["seoul", "gyeonggi", "jeju"]
 */
export function requestLandTable() {
  return requestAdminApi("/land/table", {
    method: "GET",
  });
}

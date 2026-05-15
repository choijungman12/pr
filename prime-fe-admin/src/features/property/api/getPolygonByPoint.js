import { requestAdminApi } from "../../../shared/api/httpClient";

/**
 * 좌표 기반 polygon 조회
 *
 * 응답 규칙:
 * - response.data.data: 해당 좌표에 포함된 토지 polygon 후보 배열
 * - 현재 화면은 첫 번째 후보만 사용하므로 mapper에서 data[0]을 꺼낸다
 * - response.data.message: 후보가 없을 때 사용자 메시지로 사용할 수 있는 서버 메시지
 */
export function requestPolygonByPoint({ lat, lng }) {
  return requestAdminApi(`/polygon/point?lat=${lat}&lng=${lng}`, {
    method: "GET",
  });
}

import { requestAdminApi } from "../../../shared/api/httpClient";

/**
 * 주소 기반 좌표 조회
 *
 * 응답 규칙:
 * - response.data: HTTP body 전체
 * - response.data.data: 주소 검색 결과 payload
 * - payload 안에는 latitude/longitude 또는 lat/lng 형태의 좌표가 들어올 수 있다
 * - 실제 화면 사용 전에는 mapper에서 좌표 키를 정규화해야 한다
 */
export function requestGeocoding(address) {
  return requestAdminApi(`/geocoding?address=${encodeURIComponent(address)}`, {
    method: "GET",
  });
}

/**
 * 주소 검색 응답에서 실제 주소 payload를 꺼낸다.
 *
 * response.data.data
 * - 백엔드 공통 응답 envelope 안의 실제 주소 검색 결과
 * - 좌표 키는 latitude/longitude 또는 lat/lng 둘 다 가능하다
 */
export function mapGeocodingResponse(response) {
  return response?.data?.data ?? null;
}

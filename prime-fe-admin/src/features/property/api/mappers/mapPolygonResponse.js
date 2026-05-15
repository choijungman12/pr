/**
 * polygon 조회 응답에서 현재 화면이 사용할 첫 번째 polygon payload를 꺼낸다.
 *
 * response.data.data
 * - 좌표에 매칭되는 polygon 후보 배열
 * - 현재 UI는 첫 번째 후보만 사용한다
 */
export function mapPolygonResponse(response) {
  return Array.isArray(response?.data?.data) ? response.data.data[0] ?? null : null;
}

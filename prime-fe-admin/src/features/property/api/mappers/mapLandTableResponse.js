/**
 * 지역 코드 목록 응답을 배열 형태로 정규화한다.
 *
 * response.data.data
 * - 저장 가능한 region code 문자열 배열
 */
export function mapLandTableResponse(response) {
  return Array.isArray(response?.data?.data) ? response.data.data : [];
}

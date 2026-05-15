/**
 * 등록 완료 응답에서 실제 저장 결과 payload를 꺼낸다.
 *
 * response.data.data
 * - 생성된 레코드 관련 메타 정보
 * - 현재 화면에서는 table_name, real_region_id를 읽어 성공 메시지에 노출한다
 */
export function mapLandRegisterResponse(response) {
  return response?.data?.data || {};
}

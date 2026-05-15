// 관리자 세션 만료 시간을 한 곳에 모아두면
// 로그인 성공 처리와 이후 store 마이그레이션에서 같은 값을 재사용할 수 있다.
export const ACTION_TICKET_MAX_AGE_MS = 6 * 60 * 60 * 1000;

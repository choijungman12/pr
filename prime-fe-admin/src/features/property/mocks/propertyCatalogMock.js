// 매물 관리 화면이 전역 data 폴더를 직접 바라보지 않도록 feature 경계에서 다시 export한다.
// 이후 property 도메인 mock 또는 store로 완전히 대체할 때 진입점을 하나로 유지하기 위한 파일이다.
export { adminProperties } from "../../../data/adminDataV2";

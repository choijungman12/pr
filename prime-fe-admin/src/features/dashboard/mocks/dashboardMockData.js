// Dashboard 전용 mock을 feature 경계에서 다시 export한다.
// 실제 데이터 소스는 아직 src/data에 남아 있지만, 소비 코드는 이 파일만 보게 만들어
// 이후 data 폴더 해체 시 import churn을 줄인다.
export {
  categoryStats,
  monthlyPropertyStats,
  weeklyInquiries,
} from "../../../data/mockAdminData";

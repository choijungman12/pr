// 재개발·재건축·도시개발 요건 판단 데이터

// 재개발 요건 체크리스트
export const redevelopRequirements = {
  type: "redevelop",
  overallStatus: "possible",
  overallScore: 85,
  requirements: [
    {
      id: "old-building-ratio",
      label: "노후불량건축물 비율",
      description: "전체 건축물 중 노후불량건축물이 2/3 이상이어야 합니다",
      required: "66.7% 이상",
      current: "78.5%",
      isMet: true,
      importance: "critical",
    },
    {
      id: "household-density",
      label: "호수밀도",
      description: "1ha당 50호 이상의 주택이 밀집되어 있어야 합니다",
      required: "50호/ha 이상",
      current: "62호/ha",
      isMet: true,
      importance: "critical",
    },
    {
      id: "road-access",
      label: "주택접도율",
      description: "4m 이상 도로에 접한 주택 비율이 50% 미만이어야 합니다",
      required: "50% 미만",
      current: "38%",
      isMet: true,
      importance: "important",
    },
    {
      id: "small-lot-ratio",
      label: "과소필지 비율",
      description: "90㎡ 미만 필지가 전체의 2/3 이상이어야 합니다",
      required: "66.7% 이상",
      current: "71.2%",
      isMet: true,
      importance: "important",
    },
    {
      id: "area-requirement",
      label: "정비구역 면적",
      description: "최소 10,000㎡ 이상의 면적이 필요합니다",
      required: "10,000㎡ 이상",
      current: "15,420㎡",
      isMet: true,
      importance: "critical",
    },
    {
      id: "landowner-consent",
      label: "토지등소유자 동의",
      description:
        "토지면적 2/3 이상 및 토지등소유자 1/2 이상 동의 필요",
      required: "토지 66.7% + 소유자 50%",
      current: "토지 45% + 소유자 38%",
      isMet: false,
      importance: "critical",
    },
    {
      id: "building-coverage",
      label: "건폐율",
      description: "현재 건폐율이 법정 건폐율을 초과하는 경우 유리",
      required: "법정 초과",
      current: "법정 이하",
      isMet: false,
      importance: "normal",
    },
  ],
  recommendations: [
    "토지등소유자 동의율 확보가 시급합니다. 현재 45%에서 67% 이상으로 끌어올려야 합니다.",
    "추진위원회 구성 후 적극적인 주민 설명회를 통해 동의율을 높이세요.",
    "노후불량건축물 비율과 호수밀도가 우수하여 재개발 가능성이 높습니다.",
  ],
};

// 재건축 요건 체크리스트
export const rebuildRequirements = {
  type: "rebuild",
  overallStatus: "conditional",
  overallScore: 65,
  requirements: [
    {
      id: "safety-grade",
      label: "안전진단 등급",
      description: "D등급 또는 E등급을 받아야 재건축이 가능합니다",
      required: "D등급 이하",
      current: "C등급",
      isMet: false,
      importance: "critical",
    },
    {
      id: "building-age",
      label: "준공연도",
      description: "준공 후 30년 이상 경과해야 합니다 (2023년 기준)",
      required: "1993년 이전",
      current: "1988년",
      isMet: true,
      importance: "critical",
    },
    {
      id: "household-count",
      label: "세대수",
      description: "최소 200세대 이상이어야 합니다",
      required: "200세대 이상",
      current: "340세대",
      isMet: true,
      importance: "important",
    },
    {
      id: "floor-area-ratio",
      label: "용적률",
      description: "현재 용적률이 법정 용적률의 50% 미만인 경우 유리",
      required: "법정의 50% 미만",
      current: "법정의 62%",
      isMet: false,
      importance: "normal",
    },
    {
      id: "resident-consent",
      label: "조합원 동의",
      description: "구분소유자 3/4 이상 및 토지면적 3/4 이상 동의 필요",
      required: "75% 이상",
      current: "68%",
      isMet: false,
      importance: "critical",
    },
    {
      id: "maintenance-cost",
      label: "유지관리비",
      description: "연간 유지관리비가 신축 대비 과다한 경우 유리",
      required: "신축의 150% 이상",
      current: "신축의 180%",
      isMet: true,
      importance: "normal",
    },
  ],
  recommendations: [
    "안전진단 등급이 C등급으로 재건축 요건을 충족하지 못합니다. 정밀안전진단을 재신청하거나 리모델링을 검토하세요.",
    "조합원 동의율이 68%로 목표치(75%)에 근접했습니다. 추가 설득이 필요합니다.",
    "준공연도와 세대수는 요건을 충족하고 있어 긍정적입니다.",
  ],
};

// 도시개발 요건 체크리스트
export const urbanDevRequirements = {
  type: "urban",
  overallStatus: "possible",
  overallScore: 92,
  requirements: [
    {
      id: "area-size",
      label: "사업면적",
      description: "주거지역 10,000㎡ 이상, 상업지역 3,000㎡ 이상",
      required: "10,000㎡ 이상",
      current: "28,500㎡",
      isMet: true,
      importance: "critical",
    },
    {
      id: "urban-plan",
      label: "도시기본계획 부합",
      description: "해당 지역이 도시기본계획상 개발예정지역이어야 합니다",
      required: "개발예정지역",
      current: "개발예정지역",
      isMet: true,
      importance: "critical",
    },
    {
      id: "infrastructure",
      label: "기반시설 확보율",
      description: "도로, 상하수도 등 기반시설 확보율 60% 이상",
      required: "60% 이상",
      current: "75%",
      isMet: true,
      importance: "important",
    },
    {
      id: "land-use",
      label: "용도지역",
      description:
        "주거지역, 상업지역, 공업지역, 녹지지역 등 개발 가능 지역",
      required: "개발 가능 지역",
      current: "제2종일반주거지역",
      isMet: true,
      importance: "critical",
    },
    {
      id: "landowner-ratio",
      label: "토지소유자 동의",
      description: "토지면적 2/3 이상 및 토지소유자 1/2 이상 동의",
      required: "토지 66.7% + 소유자 50%",
      current: "토지 82% + 소유자 65%",
      isMet: true,
      importance: "critical",
    },
    {
      id: "environment",
      label: "환경성 검토",
      description: "환경영향평가 또는 소규모 환경영향평가 통과 필요",
      required: "통과",
      current: "통과",
      isMet: true,
      importance: "important",
    },
    {
      id: "traffic",
      label: "교통영향평가",
      description: "일정 규모 이상 개발 시 교통영향평가 통과 필요",
      required: "통과",
      current: "통과",
      isMet: true,
      importance: "normal",
    },
  ],
  recommendations: [
    "모든 주요 요건을 충족하고 있어 도시개발사업 추진이 가능합니다.",
    "토지소유자 동의율이 82%로 매우 높아 사업 추진이 원활할 것으로 예상됩니다.",
    "기반시설 확보율이 75%로 양호하여 추가 인프라 투자 부담이 적습니다.",
  ],
};

// 구역별 요건 판단 함수
export function getRequirementsByType(type) {
  switch (type) {
    case "redevelop":
      return redevelopRequirements;
    case "rebuild":
      return rebuildRequirements;
    case "urban":
      return urbanDevRequirements;
    default:
      return redevelopRequirements;
  }
}

// 요건 충족률 계산
export function calculateRequirementScore(requirements) {
  const criticalReqs = requirements.filter((r) => r.importance === "critical");
  const importantReqs = requirements.filter(
    (r) => r.importance === "important"
  );
  const normalReqs = requirements.filter((r) => r.importance === "normal");

  const criticalScore =
    (criticalReqs.filter((r) => r.isMet).length / criticalReqs.length) * 60;
  const importantScore =
    (importantReqs.filter((r) => r.isMet).length / importantReqs.length) * 30;
  const normalScore =
    (normalReqs.filter((r) => r.isMet).length / normalReqs.length) * 10;

  return Math.round(criticalScore + importantScore + normalScore);
}

export const investmentAnalysisData = {
  developmentSimulation: {
    apartmentComplex: {
      complexCount: 3,
      totalHouseholds: 2850,
      buildingCount: 15,
      floorAreaRatio: 280,
      buildingCoverageRatio: 18,
      averageFloors: 25,
      parkingSpaces: 3420,
      greenSpaceRatio: 35,
      complexDetails: [
        {
          name: '1단지',
          households: 950,
          buildings: 5,
          floors: 25,
          types: ['59㎡ (350세대)', '84㎡ (450세대)', '114㎡ (150세대)']
        },
        {
          name: '2단지',
          households: 1050,
          buildings: 6,
          floors: 28,
          types: ['59㎡ (400세대)', '84㎡ (500세대)', '114㎡ (150세대)']
        },
        {
          name: '3단지',
          households: 850,
          buildings: 4,
          floors: 22,
          types: ['59㎡ (300세대)', '84㎡ (400세대)', '114㎡ (150세대)']
        }
      ]
    },
    residentialDevelopment: {
      totalArea: 185000,
      singleFamilyArea: 35000,
      multiFamilyArea: 95000,
      commercialArea: 28000,
      publicFacilityArea: 15000,
      roadArea: 12000,
      singleFamilyLots: 145,
      multiFamilyHouseholds: 2850,
      commercialLots: 42,
      distribution: [
        { type: '단독주택용지', area: 35000, ratio: 18.9, lots: 145 },
        { type: '공동주택용지', area: 95000, ratio: 51.4, households: 2850 },
        { type: '상업용지', area: 28000, ratio: 15.1, lots: 42 },
        { type: '공공시설용지', area: 15000, ratio: 8.1, facilities: '학교, 공원, 주민센터' },
        { type: '도로', area: 12000, ratio: 6.5, description: '폭 12~25m' }
      ]
    }
  },

  projectCost: {
    totalCost: 485000000000,
    breakdown: [
      {
        category: '토지보상비',
        amount: 285000000000,
        ratio: 58.8,
        details: [
          { item: '토지매입비', amount: 245000000000 },
          { item: '건물보상비', amount: 32000000000 },
          { item: '이주비', amount: 5500000000 },
          { item: '영업손실보상', amount: 2500000000 }
        ]
      },
      {
        category: '공사비',
        amount: 145000000000,
        ratio: 29.9,
        details: [
          { item: '토목공사', amount: 28000000000 },
          { item: '건축공사', amount: 95000000000 },
          { item: '기계설비', amount: 12000000000 },
          { item: '전기통신', amount: 10000000000 }
        ]
      },
      {
        category: '설계비',
        amount: 18500000000,
        ratio: 3.8,
        details: [
          { item: '기본설계', amount: 5500000000 },
          { item: '실시설계', amount: 9500000000 },
          { item: '인허가비용', amount: 3500000000 }
        ]
      },
      {
        category: '감리비',
        amount: 12500000000,
        ratio: 2.6,
        details: [
          { item: '건축감리', amount: 7500000000 },
          { item: '토목감리', amount: 3500000000 },
          { item: '전기감리', amount: 1500000000 }
        ]
      },
      {
        category: '부대비용',
        amount: 24000000000,
        ratio: 4.9,
        details: [
          { item: '금융비용', amount: 8500000000 },
          { item: '일반관리비', amount: 6500000000 },
          { item: '예비비', amount: 5500000000 },
          { item: '법무비용', amount: 3500000000 }
        ]
      }
    ],
    perHousehold: 170175438,
    perSquareMeter: 2621621
  },

  developmentCharge: {
    endPointLandValue: 385000000000,
    startPointLandValue: 245000000000,
    normalAppreciation: 28500000000,
    developmentCost: 485000000000,
    grossProfit: 140000000000,
    chargeRate: 25,
    finalCharge: 35000000000,
    calculation: {
      step1: { label: '종료시점 지가', value: 385000000000 },
      step2: { label: '개시시점 지가', value: -245000000000 },
      step3: { label: '정상지가상승분', value: -28500000000 },
      step4: { label: '개발비용', value: -485000000000 },
      step5: { label: '개발이익', value: 140000000000 },
      step6: { label: '부담금율 (25%)', value: 0.25 },
      step7: { label: '개발부담금', value: 35000000000 }
    },
    exemptions: [
      { condition: '공공임대주택 20% 이상 공급', reduction: 50 },
      { condition: '친환경 건축물 인증 취득', reduction: 10 },
      { condition: '에너지절약형 설계', reduction: 5 }
    ]
  },

  landReadjustment: {
    totalOriginalArea: 185000,
    reductionRate: 35,
    reserveSiteRatio: 28,
    totalReadjustedArea: 120250,
    reserveSiteArea: 51800,
    publicFacilityArea: 12950,
    details: [
      {
        ownerType: '토지소유자',
        originalArea: 185000,
        reductionArea: 64750,
        readjustedArea: 120250,
        reductionRate: 35
      }
    ],
    reserveSiteAllocation: [
      { purpose: '분양용 체비지', area: 35000, ratio: 67.6, expectedRevenue: 125000000000 },
      { purpose: '보류지 (사업비 충당)', area: 12500, ratio: 24.1, expectedRevenue: 42500000000 },
      { purpose: '공공기여 체비지', area: 4300, ratio: 8.3, expectedRevenue: 0 }
    ],
    readjustmentProcess: [
      { step: 1, name: '환지계획 수립', duration: '6개월', status: 'pending' },
      { step: 2, name: '환지예정지 지정', duration: '3개월', status: 'pending' },
      { step: 3, name: '공사 시행', duration: '36개월', status: 'pending' },
      { step: 4, name: '환지처분', duration: '6개월', status: 'pending' },
      { step: 5, name: '등기 완료', duration: '3개월', status: 'pending' }
    ],
    collectiveLandReadjustment: {
      eligible: true,
      conditions: [
        { requirement: '면적 10,000㎡ 이상', status: 'pass', value: '185,000㎡' },
        { requirement: '토지소유자 동의 2/3 이상', status: 'pass', value: '75%' },
        { requirement: '토지면적 동의 2/3 이상', status: 'pass', value: '78%' },
        { requirement: '도시계획 부합', status: 'pass', value: '적합' }
      ],
      benefits: [
        '개별 환지보다 감보율 5~10% 절감',
        '체비지 집단화로 분양가 상승',
        '기반시설 효율적 배치',
        '사업기간 단축 (평균 6개월)'
      ]
    }
  },

  profitability: {
    totalRevenue: 512000000000,
    totalCost: 485000000000,
    netProfit: 27000000000,
    profitRate: 5.57,
    roi: 11.02,
    paybackPeriod: 9.07,
    revenueBreakdown: [
      { source: '아파트 분양수입', amount: 425000000000, ratio: 83.0 },
      { source: '상업시설 분양수입', amount: 52000000000, ratio: 10.2 },
      { source: '체비지 처분수입', amount: 28000000000, ratio: 5.5 },
      { source: '기타 수입', amount: 7000000000, ratio: 1.3 }
    ],
    riskAnalysis: [
      { factor: '분양가 10% 하락 시', impact: -42500000000, profitRate: -3.2 },
      { factor: '공사비 15% 증가 시', impact: -21750000000, profitRate: 1.1 },
      { factor: '사업기간 1년 지연 시', impact: -8500000000, profitRate: 3.8 }
    ],
    timeline: [
      { phase: '인허가 및 설계', duration: 12, cost: 18500000000 },
      { phase: '토지보상', duration: 18, cost: 285000000000 },
      { phase: '공사 시행', duration: 36, cost: 145000000000 },
      { phase: '분양 및 입주', duration: 12, revenue: 512000000000 }
    ]
  }
};

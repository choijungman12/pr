export const landShareListings = [
  {
    id: 'ls001',
    title: '강남구 역삼동 상업용지 지분',
    address: '서울특별시 강남구 역삼동 123-45',
    position: { lat: 37.5007, lng: 127.0365 },
    totalArea: '1,250㎡',
    shareRatio: '30%',
    shareArea: '375㎡',
    price: '15억원',
    pricePerPyeong: '1,320만원',
    zoneType: '일반상업지역',
    landUse: '상업용지',
    buildingCoverage: '80%',
    floorAreaRatio: '800%',
    roadCondition: '20m 대로 접면',
    registrationDate: '2024-01-15',
    status: 'active',
    images: [
      'https://readdy.ai/api/search-image?query=commercial%20land%20plot%20in%20urban%20area%20with%20clear%20boundaries%20aerial%20view%20showing%20rectangular%20lot%20surrounded%20by%20buildings%20and%20roads%20professional%20real%20estate%20photography%20bright%20daylight%20clean%20composition&width=800&height=600&seq=ls001-1&orientation=landscape',
      'https://readdy.ai/api/search-image?query=urban%20commercial%20district%20street%20view%20with%20modern%20buildings%20wide%20road%20pedestrian%20sidewalk%20business%20area%20professional%20photography%20clear%20sky&width=800&height=600&seq=ls001-2&orientation=landscape'
    ],
    description: '역삼역 도보 5분 거리의 프리미엄 상업용지 지분입니다. 대로변 접면으로 접근성이 우수하며, 주변 개발호재가 풍부합니다.',
    nearbyDevelopments: ['gtx-gangnam', 'teheran-renewal']
  },
  {
    id: 'ls002',
    title: '송파구 잠실동 주거용지 지분',
    address: '서울특별시 송파구 잠실동 456-78',
    position: { lat: 37.5145, lng: 127.1059 },
    totalArea: '2,800㎡',
    shareRatio: '25%',
    shareArea: '700㎡',
    price: '22억원',
    pricePerPyeong: '1,034만원',
    zoneType: '제2종일반주거지역',
    landUse: '공동주택용지',
    buildingCoverage: '60%',
    floorAreaRatio: '250%',
    roadCondition: '12m 도로 접면',
    registrationDate: '2024-01-20',
    status: 'active',
    images: [
      'https://readdy.ai/api/search-image?query=residential%20land%20plot%20in%20urban%20neighborhood%20with%20clear%20lot%20lines%20aerial%20view%20showing%20rectangular%20parcel%20near%20apartment%20buildings%20professional%20real%20estate%20photo&width=800&height=600&seq=ls002-1&orientation=landscape'
    ],
    description: '잠실 롯데월드타워 인근 주거용지 지분입니다. 재건축 가능 지역으로 향후 개발 가치가 높습니다.',
    nearbyDevelopments: ['jamsil-sports-complex']
  },
  {
    id: 'ls003',
    title: '마포구 상암동 업무용지 지분',
    address: '서울특별시 마포구 상암동 789-12',
    position: { lat: 37.5663, lng: 126.9019 },
    totalArea: '3,500㎡',
    shareRatio: '40%',
    shareArea: '1,400㎡',
    price: '35억원',
    pricePerPyeong: '823만원',
    zoneType: '준주거지역',
    landUse: '업무시설용지',
    buildingCoverage: '70%',
    floorAreaRatio: '500%',
    roadCondition: '25m 대로 접면',
    registrationDate: '2024-01-25',
    status: 'active',
    images: [
      'https://readdy.ai/api/search-image?query=business%20district%20land%20plot%20with%20modern%20office%20buildings%20nearby%20wide%20boulevard%20urban%20development%20area%20aerial%20perspective%20professional%20real%20estate%20photography&width=800&height=600&seq=ls003-1&orientation=landscape'
    ],
    description: '상암 DMC 핵심지역 업무용지 지분입니다. IT 기업 밀집지역으로 임대수요가 높습니다.',
    nearbyDevelopments: ['dmc-expansion']
  }
];

export const developmentPlans = [
  {
    id: 'gtx-gangnam',
    name: 'GTX-C 노선 삼성역 환승센터',
    type: '교통인프라',
    location: '강남구 역삼동 일대',
    position: { lat: 37.5087, lng: 127.0632 },
    status: '공사중',
    startDate: '2021-03',
    expectedCompletion: '2027-12',
    budget: '2조 3,000억원',
    projectMethod: '민관합동 개발',
    description: 'GTX-C 노선과 지하철 2호선 환승센터 건설. 수도권 광역급행철도 핵심 거점으로 개발',
    impact: '매우 높음',
    benefits: [
      '강남권 교통 허브 형성',
      '주변 상권 활성화',
      '부동산 가치 상승',
      '업무시설 수요 증가'
    ],
    relatedDocuments: [
      { title: '국토교통부 GTX-C 노선 기본계획', date: '2020-11-15' },
      { title: '서울시 광역교통 개선대책', date: '2021-03-20' }
    ]
  },
  {
    id: 'teheran-renewal',
    name: '테헤란로 도시환경정비사업',
    type: '도시정비',
    location: '강남구 역삼동·삼성동 일대',
    position: { lat: 37.5007, lng: 127.0365 },
    status: '계획중',
    startDate: '2024-06',
    expectedCompletion: '2030-12',
    budget: '15조원',
    projectMethod: '민간주도 재개발',
    description: '테헤란로 일대 노후 업무시설 재개발. 초고층 복합시설 건립',
    impact: '높음',
    benefits: [
      '업무환경 개선',
      '랜드마크 건물 조성',
      '일자리 창출',
      '지역 이미지 제고'
    ],
    relatedDocuments: [
      { title: '강남구 도시환경정비 기본계획', date: '2023-08-10' },
      { title: '서울시 도심재생 마스터플랜', date: '2023-05-15' }
    ]
  },
  {
    id: 'jamsil-sports-complex',
    name: '잠실 종합운동장 재건축',
    type: '체육시설',
    location: '송파구 잠실동',
    position: { lat: 37.5145, lng: 127.0720 },
    status: '설계중',
    startDate: '2025-01',
    expectedCompletion: '2032-12',
    budget: '3조 5,000억원',
    projectMethod: '서울시 직접 시행',
    description: '잠실종합운동장 전면 재건축. 최첨단 스포츠 복합시설 조성',
    impact: '매우 높음',
    benefits: [
      '국제 스포츠 이벤트 유치',
      '관광객 증가',
      '주변 상권 활성화',
      '주거환경 개선'
    ],
    relatedDocuments: [
      { title: '서울시 체육시설 현대화 계획', date: '2023-12-01' },
      { title: '잠실 종합운동장 재건축 기본설계', date: '2024-01-15' }
    ]
  },
  {
    id: 'dmc-expansion',
    name: '상암 DMC 2단계 개발',
    type: '산업단지',
    location: '마포구 상암동',
    position: { lat: 37.5663, lng: 126.9019 },
    status: '진행중',
    startDate: '2023-03',
    expectedCompletion: '2028-12',
    budget: '8,000억원',
    projectMethod: 'SH공사 주관',
    description: 'DMC 미개발 부지 추가 개발. IT·미디어 기업 유치',
    impact: '높음',
    benefits: [
      'IT 산업 클러스터 확대',
      '일자리 창출',
      '업무시설 수요 증가',
      '지역경제 활성화'
    ],
    relatedDocuments: [
      { title: '서울시 DMC 확장 계획', date: '2022-11-20' },
      { title: '마포구 산업단지 개발계획', date: '2023-01-10' }
    ]
  }
];

export const landShareCategories = [
  { id: 'commercial', name: '상업용지', icon: 'ri-store-2-line' },
  { id: 'residential', name: '주거용지', icon: 'ri-home-4-line' },
  { id: 'business', name: '업무용지', icon: 'ri-building-line' },
  { id: 'industrial', name: '공업용지', icon: 'ri-factory-line' },
  { id: 'mixed', name: '복합용지', icon: 'ri-community-line' }
];

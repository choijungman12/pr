export const buildingProperties = [
  {
    id: 'bld1', name: '역삼 비즈타워', address: '서울 강남구 역삼동 678-90', district: '강남구', dong: '역삼동',
    price: 18500000000, priceText: '185억', pricePerPyeong: '2.1억/평', area: 2640, areaText: '2,640㎡', areaPyeong: '800평',
    floors: 12, builtYear: 2016, usage: '오피스', type: 'sale',
    position: { lat: 37.5020, lng: 127.0390 }, change: 1.8, previousPrice: 18170000000,
    transactionDate: '2024.01.15', features: ['프리미엄', '대규모', '교통편의'],
    parking: 120, monthlyIncome: 145000000, rentYield: 4.8, landAreaText: '3,200㎡', tenants: 35
  },
  {
    id: 'bld2', name: '청담 프라자', address: '서울 강남구 청담동 345-12', district: '강남구', dong: '청담동',
    price: 32000000000, priceText: '320억', pricePerPyeong: '3.2억/평', area: 3300, areaText: '3,300㎡', areaPyeong: '1,000평',
    floors: 8, builtYear: 2012, usage: '오피스/소매', type: 'sale',
    position: { lat: 37.5247, lng: 127.0470 }, change: 2.5, previousPrice: 31222000000,
    transactionDate: '2024.01.14', features: ['복합용도', '역세권', '고급'],
    parking: 150, monthlyIncome: 220000000, rentYield: 5.2, landAreaText: '4,100㎡', tenants: 50
  },
  {
    id: 'bld3', name: '서초 센트럴빌딩', address: '서울 서초구 서초동 456-78', district: '서초구', dong: '서초동',
    price: 12800000000, priceText: '128억', pricePerPyeong: '1.6억/평', area: 2310, areaText: '2,310㎡', areaPyeong: '700평',
    floors: 10, builtYear: 2018, usage: '오피스', type: 'rent',
    position: { lat: 37.4920, lng: 127.0150 }, change: 0.5, previousPrice: 12740000000,
    transactionDate: '2024.01.13', features: ['최신시설', '친환경', '교통편의'],
    parking: 100, monthlyIncome: 98000000, rentYield: 4.5, landAreaText: '2,800㎡', tenants: 28
  },
  {
    id: 'bld4', name: '강남역 프리미엄빌딩', address: '서울 강남구 강남동 234-56', district: '강남구', dong: '강남동',
    price: 25000000000, priceText: '250억', pricePerPyeong: '2.8억/평', area: 2970, areaText: '2,970㎡', areaPyeong: '900평',
    floors: 15, builtYear: 2013, usage: '오피스/소매', type: 'sale',
    position: { lat: 37.4960, lng: 127.0670 }, change: 3.2, previousPrice: 24200000000,
    transactionDate: '2024.01.12', features: ['초고층', '프리미엄', '강남역'],
    parking: 140, monthlyIncome: 175000000, rentYield: 5.0, landAreaText: '3,600㎡', tenants: 42
  },
  {
    id: 'bld5', name: '논현 글로벌빌딩', address: '서울 강남구 논현동 567-89', district: '강남구', dong: '논현동',
    price: 16500000000, priceText: '165억', pricePerPyeong: '2.0억/평', area: 2475, areaText: '2,475㎡', areaPyeong: '750평',
    floors: 11, builtYear: 2014, usage: '오피스', type: 'sale',
    position: { lat: 37.5100, lng: 127.0280 }, change: 2.1, previousPrice: 16160000000,
    transactionDate: '2024.01.11', features: ['국제적', '스타일', '교통'],
    parking: 115, monthlyIncome: 125000000, rentYield: 4.6, landAreaText: '3,000㎡', tenants: 32
  },
  {
    id: 'bld6', name: '반포 비즈센터', address: '서울 서초구 반포동 789-01', district: '서초구', dong: '반포동',
    price: 21000000000, priceText: '210억', pricePerPyeong: '2.5억/평', area: 2640, areaText: '2,640㎡', areaPyeong: '800평',
    floors: 9, builtYear: 2017, usage: '오피스/주거', type: 'rent',
    position: { lat: 37.5050, lng: 127.0050 }, change: 1.3, previousPrice: 20730000000,
    transactionDate: '2024.01.10', features: ['한강조망', '복합', '신축'],
    parking: 130, monthlyIncome: 162000000, rentYield: 4.7, landAreaText: '3,200㎡', tenants: 38
  }
];

export const buildingData = buildingProperties;

export const buildingDevelopments = [
  {
    id: 'blddev1', name: '강남역 초고층 프리미엄빌딩', description: '50층 규모의 초고층 프리미엄 사무용 빌딩',
    expectedDate: '2027년 12월', distance: '도보 3분', impact: '높음'
  },
  {
    id: 'blddev2', name: '청담 글로벌 빌딩 2', description: '42층 복합상업시설 국제적 수준',
    expectedDate: '2028년 06월', distance: '도보 7분', impact: '중간'
  },
  {
    id: 'blddev3', name: '서초 혁신 빌딩 프로젝트', description: '45층 친환경 스마트시티 건물',
    expectedDate: '2027년 09월', distance: '도보 5분', impact: '높음'
  },
  {
    id: 'blddev4', name: '반포 미래 복합빌딩', description: '48층 한강조망 복합 고급시설',
    expectedDate: '2028년 03월', distance: '도보 10분', impact: '중간'
  }
];

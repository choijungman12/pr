export const officetelProperties = [
  {
    id: 'oft1', name: '역삼 오피스텔', address: '서울 강남구 역삼동 123-45', district: '강남구', dong: '역삼동',
    price: 850000000, priceText: '8.5억', pricePerPyeong: '3,400만/평', area: 78, areaText: '78㎡', areaPyeong: '25평',
    floor: '12층', builtYear: 2015, rooms: 1, bath: 1, parking: true, type: 'sale',
    position: { lat: 37.5007, lng: 127.0365 }, change: 2.1, previousPrice: 832000000,
    transactionDate: '2024.01.15', features: ['역세권', '풀옵션', '남향'],
    managementFee: 150000, options: ['에어컨', '냉장고', '세탁기']
  },
  {
    id: 'oft2', name: '삼성 스타 오피스텔', address: '서울 강남구 삼성동 234-56', district: '강남구', dong: '삼성동',
    price: 1200000000, priceText: '12억', pricePerPyeong: '4,500만/평', area: 87, areaText: '87㎡', areaPyeong: '27평',
    floor: '18층', builtYear: 2018, rooms: 1, bath: 1, parking: true, type: 'sale',
    position: { lat: 37.5145, lng: 127.0590 }, change: 3.5, previousPrice: 1160000000,
    transactionDate: '2024.01.14', features: ['풀옵션', '주차가능', '보안시스템'],
    managementFee: 120000, options: ['에어컨', '냉장고', '세탁기', '피트니스']
  },
  {
    id: 'oft3', name: '강남역 프리미엄 오피스텔', address: '서울 강남구 강남동 345-67', district: '강남구', dong: '강남동',
    price: 1450000000, priceText: '14.5억', pricePerPyeong: '5,100만/평', area: 91, areaText: '91㎡', areaPyeong: '28평',
    floor: '25층', builtYear: 2020, rooms: 1, bath: 1, parking: true, type: 'sale',
    position: { lat: 37.4980, lng: 127.0620 }, change: 1.8, previousPrice: 1424000000,
    transactionDate: '2024.01.13', features: ['한강뷰', '풀옵션', '고층'],
    managementFee: 180000, options: ['에어컨', '냉장고', '세탁기', '침대', '책상']
  },
  {
    id: 'oft4', name: '서초 그린 오피스텔', address: '서울 서초구 서초동 456-78', district: '서초구', dong: '서초동',
    price: 950000000, priceText: '9.5억', pricePerPyeong: '3,600만/평', area: 81, areaText: '81㎡', areaPyeong: '25평',
    floor: '14층', builtYear: 2017, rooms: 1, bath: 1, parking: true, type: 'rent',
    position: { lat: 37.4920, lng: 127.0150 }, change: 2.8, previousPrice: 923000000,
    transactionDate: '2024.01.12', features: ['역세권', '풀옵션', '남향'],
    managementFee: 140000, options: ['에어컨', '냉장고', '세탁기'],
    deposit: 950000000
  },
  {
    id: 'oft5', name: '잠실 한강 오피스텔', address: '서울 송파구 잠실동 567-89', district: '송파구', dong: '잠실동',
    price: 750000000, priceText: '7.5억', pricePerPyeong: '3,100만/평', area: 76, areaText: '76㎡', areaPyeong: '24평',
    floor: '10층', builtYear: 2019, rooms: 1, bath: 1, parking: true, type: 'monthly',
    position: { lat: 37.5145, lng: 127.0850 }, change: 1.5, previousPrice: 739000000,
    transactionDate: '2024.01.11', features: ['한강뷰', '풀옵션', '고층'],
    managementFee: 160000, options: ['에어컨', '냉장고', '세탁기', '침대'],
    deposit: 100000000, monthlyRent: 1000000
  }
];

export const officetelData = officetelProperties;

export const officetelDevelopments = [
  {
    id: 'oftdev1', name: '강남 신축 오피스텔 프로젝트', description: '새로운 프리미엄 오피스텔 개발',
    expectedDate: '2026년 12월', distance: '도보 5분', impact: '높음'
  },
  {
    id: 'oftdev2', name: '서초 이음 오피스텔', description: '친환경 복합시설 개발',
    expectedDate: '2025년 06월', distance: '도보 8분', impact: '중간'
  },
  {
    id: 'oftdev3', name: '잠실 아크 오피스텔', description: '한강조망 프리미엄 빌딩',
    expectedDate: '2027년 03월', distance: '도보 10분', impact: '높음'
  }
];

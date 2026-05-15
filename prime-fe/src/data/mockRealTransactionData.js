export const realTransactionItems = [
  // 아파트
  {
    id: 'rtx1', type: 'apt', typeLabel: '아파트', address: '서울 강남구 역삼동 123-45', buildingName: '래미안역삼',
    price: 2850000000, priceText: '28.5억', pricePerPyeong: '8,500만/평', area: 84, areaText: '84㎡', areaPyeong: '25평',
    floor: 15, builtYear: 2019, transactionDate: '2024.01.15', district: '강남구', dong: '역삼동',
    position: { lat: 37.5007, lng: 127.0365 }, priceChange: 3.2, previousPrice: '27.6억'
  },
  {
    id: 'rtx2', type: 'apt', typeLabel: '아파트', address: '서울 강남구 삼성동 345-67', buildingName: '아이파크삼성',
    price: 3200000000, priceText: '32억', pricePerPyeong: '9,500만/평', area: 102, areaText: '102㎡', areaPyeong: '31평',
    floor: 35, builtYear: 2017, transactionDate: '2024.01.12', district: '강남구', dong: '삼성동',
    position: { lat: 37.5145, lng: 127.0590 }, priceChange: 4.5, previousPrice: '30.6억'
  },
  {
    id: 'rtx3', type: 'apt', typeLabel: '아파트', address: '서울 서초구 반포동 567-89', buildingName: '래미안퍼스티지',
    price: 4200000000, priceText: '42억', pricePerPyeong: '1.25억/평', area: 114, areaText: '114㎡', areaPyeong: '34평',
    floor: 28, builtYear: 2018, transactionDate: '2024.01.14', district: '서초구', dong: '반포동',
    position: { lat: 37.5050, lng: 127.0050 }, priceChange: 5.0, previousPrice: '40억'
  },
  {
    id: 'rtx4', type: 'apt', typeLabel: '아파트', address: '서울 송파구 잠실동 678-90', buildingName: '잠실엘스',
    price: 2600000000, priceText: '26억', pricePerPyeong: '7,800만/평', area: 84, areaText: '84㎡', areaPyeong: '25평',
    floor: 18, builtYear: 2008, transactionDate: '2024.01.13', district: '송파구', dong: '잠실동',
    position: { lat: 37.5145, lng: 127.0850 }, priceChange: 3.5, previousPrice: '25.1억'
  },
  {
    id: 'rtx5', type: 'apt', typeLabel: '아파트', address: '서울 용산구 이촌동 345-67', buildingName: '래미안첼리투스',
    price: 3500000000, priceText: '35억', pricePerPyeong: '1.03억/평', area: 114, areaText: '114㎡', areaPyeong: '34평',
    floor: 25, builtYear: 2018, transactionDate: '2024.01.08', district: '용산구', dong: '이촌동',
    position: { lat: 37.5324, lng: 126.9906 }, priceChange: 2.9, previousPrice: '34억'
  },
  {
    id: 'rtx6', type: 'apt', typeLabel: '아파트', address: '서울 마포구 상암동 789-12', buildingName: 'DMC파크뷰자이',
    price: 1450000000, priceText: '14.5억', pricePerPyeong: '4,300만/평', area: 84, areaText: '84㎡', areaPyeong: '25평',
    floor: 18, builtYear: 2020, transactionDate: '2024.01.07', district: '마포구', dong: '상암동',
    position: { lat: 37.5770, lng: 126.8910 }, priceChange: 1.5, previousPrice: '14.3억'
  },
  {
    id: 'rtx7', type: 'apt', typeLabel: '아파트', address: '서울 강남구 대치동 456-78', buildingName: '래미안대치팰리스',
    price: 2950000000, priceText: '29.5억', pricePerPyeong: '8,800만/평', area: 84, areaText: '84㎡', areaPyeong: '25평',
    floor: 20, builtYear: 2015, transactionDate: '2024.01.13', district: '강남구', dong: '대치동',
    position: { lat: 37.4940, lng: 127.0620 }, priceChange: 3.8, previousPrice: '28.4억'
  },
  // 빌라
  {
    id: 'rtx8', type: 'villa', typeLabel: '빌라', address: '서울 강남구 논현동 234-12', buildingName: '논현 프라임빌',
    price: 850000000, priceText: '8.5억', pricePerPyeong: '3,400만/평', area: 76, areaText: '76㎡', areaPyeong: '23평',
    floor: 3, builtYear: 2021, transactionDate: '2024.01.11', district: '강남구', dong: '논현동',
    position: { lat: 37.5110, lng: 127.0280 }, priceChange: 1.2, previousPrice: '8.4억'
  },
  {
    id: 'rtx9', type: 'villa', typeLabel: '빌라', address: '서울 서초구 방배동 567-34', buildingName: '방배 그린하우스',
    price: 720000000, priceText: '7.2억', pricePerPyeong: '3,000만/평', area: 72, areaText: '72㎡', areaPyeong: '22평',
    floor: 2, builtYear: 2019, transactionDate: '2024.01.09', district: '서초구', dong: '방배동',
    position: { lat: 37.4820, lng: 126.9920 }, priceChange: -0.8, previousPrice: '7.26억'
  },
  {
    id: 'rtx10', type: 'villa', typeLabel: '빌라', address: '서울 광진구 자양동 890-12', buildingName: '자양 리버빌',
    price: 480000000, priceText: '4.8억', pricePerPyeong: '2,200만/평', area: 66, areaText: '66㎡', areaPyeong: '20평',
    floor: 4, builtYear: 2022, transactionDate: '2024.01.10', district: '광진구', dong: '자양동',
    position: { lat: 37.5385, lng: 127.0823 }, priceChange: 0.6, previousPrice: '4.77억'
  },
  {
    id: 'rtx11', type: 'villa', typeLabel: '빌라', address: '서울 성동구 성수동 123-56', buildingName: '성수 아트빌',
    price: 620000000, priceText: '6.2억', pricePerPyeong: '2,800만/평', area: 68, areaText: '68㎡', areaPyeong: '21평',
    floor: 3, builtYear: 2020, transactionDate: '2024.01.06', district: '성동구', dong: '성수동',
    position: { lat: 37.5440, lng: 127.0560 }, priceChange: 2.0, previousPrice: '6.08억'
  },
  // 빌딩
  {
    id: 'rtx12', type: 'building', typeLabel: '빌딩', address: '서울 강남구 역삼동 678-90', buildingName: '역삼 비즈타워',
    price: 18500000000, priceText: '185억', pricePerPyeong: '2.1억/평', area: 2640, areaText: '2,640㎡', areaPyeong: '800평',
    floor: 12, builtYear: 2016, transactionDate: '2024.01.10', district: '강남구', dong: '역삼동',
    position: { lat: 37.5020, lng: 127.0390 }, priceChange: 1.8, previousPrice: '181.7억'
  },
  {
    id: 'rtx13', type: 'building', typeLabel: '빌딩', address: '서울 강남구 청담동 345-12', buildingName: '청담 프라자',
    price: 32000000000, priceText: '320억', pricePerPyeong: '3.2억/평', area: 3300, areaText: '3,300㎡', areaPyeong: '1,000평',
    floor: 8, builtYear: 2012, transactionDate: '2024.01.05', district: '강남구', dong: '청담동',
    position: { lat: 37.5247, lng: 127.0470 }, priceChange: 2.5, previousPrice: '312.2억'
  },
  {
    id: 'rtx14', type: 'building', typeLabel: '빌딩', address: '서울 서초구 서초동 456-78', buildingName: '서초 센트럴빌딩',
    price: 12800000000, priceText: '128억', pricePerPyeong: '1.6억/평', area: 2310, areaText: '2,310㎡', areaPyeong: '700평',
    floor: 10, builtYear: 2018, transactionDate: '2024.01.08', district: '서초구', dong: '서초동',
    position: { lat: 37.4920, lng: 127.0150 }, priceChange: 0.5, previousPrice: '127.4억'
  },
  // 토지
  {
    id: 'rtx15', type: 'land', typeLabel: '토지', address: '서울 강남구 도곡동 123-4',
    price: 13600000000, priceText: '136억', pricePerPyeong: '6,766만/평', area: 663, areaText: '663㎡', areaPyeong: '201평',
    transactionDate: '2024.01.12', district: '강남구', dong: '도곡동',
    position: { lat: 37.4880, lng: 127.0460 }, priceChange: 4.2, previousPrice: '130.5억',
    landUse: '대', zoning: '제2종일반주거지역'
  },
  {
    id: 'rtx16', type: 'land', typeLabel: '토지', address: '서울 강남구 역삼동 234-5',
    price: 7200000000, priceText: '72억', pricePerPyeong: '1.2억/평', area: 198, areaText: '198㎡', areaPyeong: '60평',
    transactionDate: '2024.01.09', district: '강남구', dong: '역삼동',
    position: { lat: 37.5000, lng: 127.0400 }, priceChange: 3.5, previousPrice: '69.6억',
    landUse: '대', zoning: '일반상업지역'
  },
  {
    id: 'rtx17', type: 'land', typeLabel: '토지', address: '서울 서초구 반포동 78-9',
    price: 9750000000, priceText: '97.5억', pricePerPyeong: '6,500만/평', area: 495, areaText: '495㎡', areaPyeong: '150평',
    transactionDate: '2024.01.07', district: '서초구', dong: '반포동',
    position: { lat: 37.5050, lng: 127.0100 }, priceChange: 2.1, previousPrice: '95.5억',
    landUse: '주차장', zoning: '제3종일반주거지역'
  },
  {
    id: 'rtx18', type: 'land', typeLabel: '토지', address: '서울 송파구 잠실동 56-7',
    price: 5800000000, priceText: '58억', pricePerPyeong: '5,800만/평', area: 330, areaText: '330㎡', areaPyeong: '100평',
    transactionDate: '2024.01.06', district: '송파구', dong: '잠실동',
    position: { lat: 37.5120, lng: 127.0900 }, priceChange: 1.8, previousPrice: '57억',
    landUse: '대', zoning: '제2종일반주거지역'
  }
];

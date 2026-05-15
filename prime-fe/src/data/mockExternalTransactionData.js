// 외부 실거래가 통합 mock 데이터
// 소스: 국토교통부(molit) | 한국부동산원(reb) | KB부동산(kab) | 법원경매(court)

export const externalTransactionData = [
  { id: 'ext1',  source: 'molit', name: '래미안역삼 84㎡',         address: '서울 강남구 역삼동',      price: '28.5억', pricePerPyeong: '8,500만/평', area: '84㎡',   floor: '15/25층', date: '2024.01.15', change: 3.2,   type: '매매',   position: { lat: 37.5007, lng: 127.0365 } },
  { id: 'ext2',  source: 'molit', name: '아이파크삼성 102㎡',       address: '서울 강남구 삼성동',      price: '32억',   pricePerPyeong: '9,500만/평', area: '102㎡',  floor: '35/45층', date: '2024.01.12', change: 4.5,   type: '매매',   position: { lat: 37.5145, lng: 127.0590 } },
  { id: 'ext3',  source: 'molit', name: '래미안퍼스티지 114㎡',     address: '서울 서초구 반포동',      price: '42억',   pricePerPyeong: '1.25억/평',  area: '114㎡',  floor: '28/35층', date: '2024.01.14', change: 5.0,   type: '매매',   position: { lat: 37.5050, lng: 127.0050 } },
  { id: 'ext4',  source: 'reb',   name: '잠실엘스 84㎡',            address: '서울 송파구 잠실동',      price: '26억',   pricePerPyeong: '7,800만/평', area: '84㎡',   floor: '18/30층', date: '2024.01.13', change: 3.5,   type: '매매',   position: { lat: 37.5120, lng: 127.0850 } },
  { id: 'ext5',  source: 'reb',   name: '래미안첼리투스 114㎡',     address: '서울 용산구 이촌동',      price: '35억',   pricePerPyeong: '1.03억/평',  area: '114㎡',  floor: '25/35층', date: '2024.01.08', change: 2.9,   type: '매매',   position: { lat: 37.5324, lng: 126.9906 } },
  { id: 'ext6',  source: 'kab',   name: '반포자이 84㎡',            address: '서울 서초구 반포동',      price: '38.5억', pricePerPyeong: '1.15억/평',  area: '84㎡',   floor: '22/35층', date: '2024.01.10', change: 6.2,   type: 'KB시세', position: { lat: 37.5080, lng: 127.0130 } },
  { id: 'ext7',  source: 'kab',   name: '래미안대치팰리스 84㎡',    address: '서울 강남구 대치동',      price: '29.5억', pricePerPyeong: '8,800만/평', area: '84㎡',   floor: '20/28층', date: '2024.01.11', change: 3.8,   type: 'KB시세', position: { lat: 37.4940, lng: 127.0620 } },
  { id: 'ext8',  source: 'kab',   name: '헬리오시티 84㎡',          address: '서울 송파구 가락동',      price: '18.2억', pricePerPyeong: '5,430만/평', area: '84㎡',   floor: '15/35층', date: '2024.01.09', change: 2.1,   type: 'KB시세', position: { lat: 37.4965, lng: 127.1180 } },
  { id: 'ext9',  source: 'court', name: '강남구 역삼동 빌라',        address: '서울 강남구 역삼동 234-5', price: '감정가 8.5억', pricePerPyeong: '3,400만/평', area: '76㎡', floor: '3/5층',   date: '2024.02.15', change: -25.0, type: '경매',   position: { lat: 37.4980, lng: 127.0420 } },
  { id: 'ext10', source: 'court', name: '서초구 방배동 아파트',      address: '서울 서초구 방배동 567-8', price: '감정가 12억', pricePerPyeong: '4,800만/평', area: '84㎡', floor: '8/15층',  date: '2024.02.20', change: -30.0, type: '경매',   position: { lat: 37.4820, lng: 126.9920 } },
  { id: 'ext11', source: 'molit', name: 'DMC파크뷰자이 84㎡',        address: '서울 마포구 상암동',      price: '14.5억', pricePerPyeong: '4,300만/평', area: '84㎡',   floor: '18/25층', date: '2024.01.07', change: 1.5,   type: '매매',   position: { lat: 37.5770, lng: 126.8910 } },
  { id: 'ext12', source: 'reb',   name: '성수 트리마제 84㎡',        address: '서울 성동구 성수동',      price: '20억',   pricePerPyeong: '5,950만/평', area: '84㎡',   floor: '15/25층', date: '2024.01.11', change: 8.1,   type: '매매',   position: { lat: 37.5440, lng: 127.0560 } },
  { id: 'ext13', source: 'molit', name: '래미안원베일리 84㎡',       address: '서울 서초구 반포동',      price: '45억',   pricePerPyeong: '1.34억/평',  area: '84㎡',   floor: '30/35층', date: '2024.01.16', change: 7.1,   type: '매매',   position: { lat: 37.5095, lng: 127.0020 } },
  { id: 'ext14', source: 'kab',   name: '아크로리버파크 84㎡',       address: '서울 서초구 반포동',      price: '43억',   pricePerPyeong: '1.28억/평',  area: '84㎡',   floor: '25/36층', date: '2024.01.14', change: 5.5,   type: 'KB시세', position: { lat: 37.5110, lng: 127.0080 } },
  { id: 'ext15', source: 'reb',   name: '잠실리센츠 84㎡',           address: '서울 송파구 잠실동',      price: '24.5억', pricePerPyeong: '7,300만/평', area: '84㎡',   floor: '22/33층', date: '2024.01.12', change: 2.8,   type: '매매',   position: { lat: 37.5155, lng: 127.0920 } },
  { id: 'ext16', source: 'court', name: '마포구 공덕동 오피스텔',    address: '서울 마포구 공덕동 123-4', price: '감정가 5.2억', pricePerPyeong: '2,600만/평', area: '59㎡', floor: '12/20층', date: '2024.02.25', change: -18.0, type: '경매',   position: { lat: 37.5440, lng: 126.9520 } },
  { id: 'ext17', source: 'molit', name: '래미안블레스티지 102㎡',    address: '서울 서초구 서초동',      price: '25.8억', pricePerPyeong: '7,650만/평', area: '102㎡',  floor: '16/28층', date: '2024.01.09', change: 2.3,   type: '매매',   position: { lat: 37.4920, lng: 127.0150 } },
  { id: 'ext18', source: 'kab',   name: '도곡렉슬 84㎡',             address: '서울 강남구 도곡동',      price: '22억',   pricePerPyeong: '6,560만/평', area: '84㎡',   floor: '18/25층', date: '2024.01.13', change: 3.0,   type: 'KB시세', position: { lat: 37.4880, lng: 127.0460 } },
];

export const getSourceColor = (source) => {
  switch (source) {
    case 'molit': return { bg: 'bg-rose-500',    light: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-400' };
    case 'reb':   return { bg: 'bg-amber-500',   light: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-400' };
    case 'kab':   return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-400' };
    case 'court': return { bg: 'bg-sky-500',     light: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-400' };
    default:      return { bg: 'bg-gray-500',    light: 'bg-gray-100',    text: 'text-gray-700',    border: 'border-gray-400' };
  }
};

export const getSourceLabel = (source) => {
  switch (source) {
    case 'molit': return '국토부';
    case 'reb':   return '부동산원';
    case 'kab':   return 'KB';
    case 'court': return '법원';
    default:      return source;
  }
};

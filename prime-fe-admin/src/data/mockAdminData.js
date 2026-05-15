// mockAdminData는 대시보드/게시글 중심의 레거시 mock 모음이다.
// 최종 목표는 feature별 mocks 파일로 쪼개는 것이다.
// ── 관리자 대시보드 통계 ────────────────────────────────────────
export const adminStats = [
  {
    icon: 'ri-building-line',
    label: '전체 매물',
    value: '248',
    change: '+12%',
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: 'ri-article-line',
    label: '게시글',
    value: '156',
    change: '+8%',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: 'ri-user-line',
    label: '회원',
    value: '1,234',
    change: '+24%',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: 'ri-eye-line',
    label: '방문자',
    value: '8,456',
    change: '+18%',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

// ── 매물 목록 ────────────────────────────────────────────────────
export const adminProperties = [
  {
    id: '1',
    name: '강남구 역삼동 토지지분',
    type: '토지',
    location: '강남구 역삼동',
    area: '330㎡',
    share: '25%',
    price: '5억 2천만원',
    status: 'approved',
    date: '2024-01-15',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=80&fit=crop',
  },
  {
    id: '2',
    name: '서초구 반포동 아파트지분',
    type: '아파트',
    location: '서초구 반포동',
    area: '84㎡',
    share: '50%',
    price: '12억 8천만원',
    status: 'pending',
    date: '2024-01-18',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&h=80&fit=crop',
  },
  {
    id: '3',
    name: '송파구 잠실동 오피스텔',
    type: '오피스텔',
    location: '송파구 잠실동',
    area: '33㎡',
    share: '100%',
    price: '3억 5천만원',
    status: 'completed',
    date: '2024-01-20',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=80&h=80&fit=crop',
  },
  {
    id: '4',
    name: '마포구 상암동 빌딩지분',
    type: '빌딩',
    location: '마포구 상암동',
    area: '1,250㎡',
    share: '15%',
    price: '8억 1천만원',
    status: 'approved',
    date: '2024-01-22',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=80&h=80&fit=crop',
  },
  {
    id: '5',
    name: '용산구 이태원동 토지지분',
    type: '토지',
    location: '용산구 이태원동',
    area: '220㎡',
    share: '30%',
    price: '6억 7천만원',
    status: 'pending',
    date: '2024-01-25',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&h=80&fit=crop',
  },
];

// ── 게시글 목록 ──────────────────────────────────────────────────
export const adminPosts = [
  {
    id: '1',
    title: '2024년 강남권 재개발 사업 현황 분석',
    category: '시장분석',
    excerpt: '강남구 일대의 주요 재개발 사업 진행 상황과 향후 전망을 분석한 보고서입니다. 주요 사업지별 진행률과 투자 포인트를 정리했습니다.',
    date: '2024-01-15',
    views: '1,234',
    comments: '45',
    content: '',
  },
  {
    id: '2',
    title: '토지지분 투자 완벽 가이드 2024',
    category: '투자정보',
    excerpt: '토지 지분 투자의 기초부터 실전 전략까지 상세히 안내합니다. 법적 절차, 세금, 수익률 분석 방법을 포함합니다.',
    date: '2024-01-18',
    views: '2,891',
    comments: '78',
    content: '',
  },
  {
    id: '3',
    title: '2024년 1월 부동산 시장 동향 공지',
    category: '공지사항',
    excerpt: '2024년 1월 부동산 시장의 주요 동향과 정책 변화 사항을 공지합니다. 금리 인하 기대감에 따른 시장 변화를 살펴봅니다.',
    date: '2024-01-20',
    views: '3,102',
    comments: '22',
    content: '',
  },
  {
    id: '4',
    title: '서울 도시재생 뉴딜 개발 계획 총정리',
    category: '개발계획',
    excerpt: '서울시 도시재생 뉴딜 사업의 전체 계획과 주요 사업지를 정리했습니다. 투자 기회와 유의사항을 함께 안내합니다.',
    date: '2024-01-22',
    views: '987',
    comments: '31',
    content: '',
  },
  {
    id: '5',
    title: '부동산 지분 거래 세금 완벽 정리',
    category: '투자정보',
    excerpt: '지분 거래 시 발생하는 양도소득세, 취득세, 증여세 등 세금 관련 사항을 상세히 정리한 가이드입니다.',
    date: '2024-01-25',
    views: '4,567',
    comments: '103',
    content: '',
  },
];

export const monthlyPropertyStats = [
  { month: '7월', registered: 18, views: 5200, inquiries: 142 },
  { month: '8월', registered: 22, views: 6100, inquiries: 168 },
  { month: '9월', registered: 19, views: 5800, inquiries: 155 },
  { month: '10월', registered: 27, views: 7400, inquiries: 201 },
  { month: '11월', registered: 31, views: 8200, inquiries: 234 },
  { month: '12월', registered: 25, views: 7100, inquiries: 189 },
  { month: '1월', registered: 35, views: 9300, inquiries: 267 },
];

export const categoryStats = [
  { category: '토지', count: 82, color: '#f97316' },
  { category: '아파트', count: 64, color: '#0ea5e9' },
  { category: '오피스텔', count: 41, color: '#10b981' },
  { category: '빌딩', count: 28, color: '#f59e0b' },
  { category: '상가', count: 19, color: '#8b5cf6' },
  { category: '기타', count: 14, color: '#6b7280' },
];

export const weeklyInquiries = [
  { day: '월', count: 34 },
  { day: '화', count: 48 },
  { day: '수', count: 41 },
  { day: '목', count: 56 },
  { day: '금', count: 62 },
  { day: '토', count: 38 },
  { day: '일', count: 27 },
];

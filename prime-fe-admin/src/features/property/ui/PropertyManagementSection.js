import { useState } from 'react';
import PropertyForm from "./form/PropertyForm";
import { usePropertyStore } from "../store/usePropertyStore";

// PropertyManagement는 게시 중인 매물 목록을 관리하는 화면이다.
// 실제 목록 source of truth는 property store의 catalogProperties다.
const PROPERTY_TYPES = ['전체', '아파트', '오피스텔', '빌딩', '상가', '지식산업센터', '토지'];
const DEAL_TYPES = ['전체', '매매', '전세', '월세'];
const STATUS_TYPES = ['전체', '등록중', '승인', '완료'];
const TYPE_ICONS = {
    아파트: 'ri-building-2-line',
    오피스텔: 'ri-hotel-line',
    빌딩: 'ri-building-4-line',
    상가: 'ri-store-2-line',
    지식산업센터: 'ri-computer-line',
    토지: 'ri-map-2-line',
};
const TYPE_COLORS = {
    아파트: 'bg-sky-100 text-sky-700',
    오피스텔: 'bg-teal-100 text-teal-700',
    빌딩: 'bg-amber-100 text-amber-700',
    상가: 'bg-rose-100 text-rose-700',
    지식산업센터: 'bg-violet-100 text-violet-700',
    토지: 'bg-orange-100 text-orange-700',
};
const DEAL_COLORS = {
    매매: 'bg-red-50 text-red-600 border border-red-200',
    전세: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    월세: 'bg-amber-50 text-amber-600 border border-amber-200',
};
const STATUS_MAP = {
    pending: { label: '검토중', style: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '승인', style: 'bg-green-100 text-green-700' },
    completed: { label: '완료', style: 'bg-gray-100 text-gray-600' },
};
const STATUS_FILTER_MAP = {
    전체: null,
    등록중: 'pending',
    승인: 'approved',
    완료: 'completed',
};
// 종류별 세부 필드 레이블
const TYPE_FIELD_LABELS = {
    아파트: { floor: '해당 층수', totalFloors: '총 층수', households: '세대수', roomCount: '방 개수', bathroomCount: '욕실 개수', parkingCount: '주차 대수' },
    오피스텔: { floor: '해당 층수', totalFloors: '총 층수', exclusiveArea: '전용 면적', roomCount: '방 개수', direction: '방향', parkingCount: '주차 대수' },
    빌딩: { totalFloors: '지상 층수', undergroundFloors: '지하 층수', parkingCount: '주차 대수', elevatorCount: '엘리베이터 수', buildYear: '준공 연도', rentalIncome: '월 임대 수익' },
    상가: { floor: '위치 층수', keyMoney: '권리금', businessType: '업종', monthlyRevenue: '월 매출', contractPeriod: '임대 계약 기간', frontage: '전면 폭' },
    지식산업센터: { floor: '해당 층수', totalFloors: '총 층수', usagePurpose: '용도', ceilingHeight: '층고', loadCapacity: '하중', parkingCount: '주차 대수' },
    토지: { landCategory: '지목', zoning: '용도지역', roadContact: '도로 접면', shape: '토지 형상', slope: '경사도', buildingCoverage: '건폐율', floorAreaRatio: '용적률' },
};

// 상세 패널은 목록 화면과 같은 파일에 두고 있지만,
// 의미상으로는 property 상세 정보 viewer 역할을 한다.
function PropertyDetailPanel({ property, onClose, onEdit }) {
    const statusInfo = STATUS_MAP[property.status] ?? { label: property.status, style: 'bg-gray-100 text-gray-600' };
    const extraLabels = TYPE_FIELD_LABELS[property.type] ?? {};
    const extraEntries = property.extraFields
        ? Object.entries(property.extraFields).filter(([, v]) => v && String(v).trim() !== '')
        : [];
    return (<div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[480px] h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInRight 0.28s cubic-bezier(0.4,0,0.2,1)' }}
      >
        {/* 패널 헤더 */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${TYPE_COLORS[property.type] ?? 'bg-gray-100 text-gray-600'}`}>
              <i className={`${TYPE_ICONS[property.type] ?? 'ri-building-line'} text-base`}></i>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{property.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[property.type] ?? 'bg-gray-100 text-gray-600'}`}>{property.type}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DEAL_COLORS[property.dealType] ?? 'bg-gray-100 text-gray-600'}`}>{property.dealType}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-edit-line"></i>수정
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 대표 이미지 */}
          <div className="w-full h-52 bg-gray-100 relative overflow-hidden flex-shrink-0">
            <img src={property.image} alt={property.name} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <p className="text-white font-bold text-lg drop-shadow">{property.price}</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.style}`}>{statusInfo.label}</span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* 기본 정보 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-information-line text-orange-500"></i>기본 정보
              </h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                {[
                    { label: '매물명', value: property.name },
                    { label: '부동산 종류', value: property.type },
                    { label: '거래 유형', value: property.dealType },
                    { label: '위치', value: property.location },
                    { label: '면적', value: property.area },
                    { label: '등록일', value: property.date },
                ].map(({ label, value }) => value ? (<div key={label} className="flex items-start justify-between gap-3">
                    <span className="text-xs text-gray-500 whitespace-nowrap w-20 shrink-0">{label}</span>
                    <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                  </div>) : null)}
              </div>
            </div>

            {/* 종류별 세부 정보 */}
            {extraEntries.length > 0 && (<div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <i className="ri-list-check-2 text-orange-500"></i>{property.type} 세부 정보
                </h4>
                <div className="bg-orange-50 rounded-xl p-4 space-y-2.5">
                  {extraEntries.map(([key, value]) => (<div key={key} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-orange-700 whitespace-nowrap w-24 shrink-0">{extraLabels[key] ?? key}</span>
                      <span className="text-xs font-semibold text-orange-900 text-right">{String(value)}</span>
                    </div>))}
                </div>
              </div>)}

            {/* 지도 미리보기 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-map-pin-line text-orange-500"></i>위치 미리보기
              </h4>
              <div className="rounded-xl overflow-hidden border border-gray-200 h-44 relative">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${property.lng ?? 127.0396}!3d${property.lat ?? 37.5012}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="매물 위치"
                ></iframe>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow text-xs font-medium text-gray-700 max-w-[200px] truncate">
                  <i className="ri-map-pin-fill text-orange-500 mr-1"></i>{property.location}
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-2 flex items-center justify-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
              >
                <i className="ri-external-link-line"></i>Google Maps에서 열기
              </a>
            </div>

            {/* 상태 정보 */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-shield-check-line text-orange-500"></i>처리 상태
              </h4>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.style}`}>{statusInfo.label}</span>
                <span className="text-xs text-gray-500">등록일: {property.date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <i className="ri-edit-line"></i>매물 수정
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            닫기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>);
}

export default function PropertyManagement() {
    const [showForm, setShowForm] = useState(false);
    const properties = usePropertyStore((state) => state.catalogProperties);
    const addPropertyDraft = usePropertyStore((state) => state.addPropertyDraft);
    const [notice, setNotice] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [activeType, setActiveType] = useState('전체');
    const [activeDeal, setActiveDeal] = useState('전체');
    const [activeStatus, setActiveStatus] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = properties.filter((p) => {
        // 현재 필터링은 client-side로 모두 처리한다.
        const matchType = activeType === '전체' || p.type === activeType;
        const matchDeal = activeDeal === '전체' || p.dealType === activeDeal;
        const matchStatus = activeStatus === '전체' || p.status === STATUS_FILTER_MAP[activeStatus];
        const matchSearch = searchQuery === '' || p.name.includes(searchQuery) || p.location.includes(searchQuery);
        return matchType && matchDeal && matchStatus && matchSearch;
    });
    const countByType = (type) => type === '전체' ? properties.length : properties.filter((p) => p.type === type).length;
    const countByDeal = (deal) => deal === '전체' ? properties.length : properties.filter((p) => p.dealType === deal).length;
    const handleEdit = (property) => {
        setSelectedProperty(null);
        setNotice({
            tone: 'info',
            message: `"${property.name}" 수정은 아직 지원하지 않습니다. 현재는 신규 토지 매물 등록만 사용할 수 있습니다.`,
        });
    };
    const handleDelete = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            console.log('Delete property:', id);
        }
    };
    const handleRowClick = (property) => {
        setSelectedProperty(property);
    };
    return (<div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">매물 관리</h2>
          <p className="text-sm text-gray-500 mt-1">현재 등록 플로우는 토지 매물 신규 등록 기준으로 동작합니다</p>
        </div>
        <button onClick={() => { setShowForm(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap">
          <i className="ri-add-line text-lg"></i>토지 매물 등록
        </button>
      </div>

      {notice && (<div className={`rounded-2xl border px-4 py-3 flex items-start justify-between gap-3 ${notice.tone === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
          <p className="text-sm font-medium">{notice.message}</p>
          <button onClick={() => setNotice(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/60 transition-colors cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>)}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {['아파트', '오피스텔', '빌딩', '상가', '지식산업센터', '토지'].map((type) => {
            const count = properties.filter((p) => p.type === type).length;
            return (<button key={type} onClick={() => setActiveType(activeType === type ? '전체' : type)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${activeType === type ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200'}`}>
              <div className={`w-9 h-9 flex items-center justify-center rounded-lg mb-2 ${TYPE_COLORS[type]}`}>
                <i className={`${TYPE_ICONS[type]} text-base`}></i>
              </div>
              <p className="text-xs text-gray-500 font-medium">{type}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{count}</p>
            </button>);
        })}
      </div>

      {showForm && (<PropertyForm onClose={() => { setShowForm(false); }} onSave={(data) => {
                // 등록 폼 저장 결과는 게시 목록이 아니라 검수 대기열로 보낸다.
                addPropertyDraft(data);
                setNotice({
                    tone: 'success',
                    message: `"${data.name}" 토지 매물이 검수 대기 목록에 추가되었습니다.`,
                });
                setShowForm(false);
            }}/>)}

      <div className="bg-white rounded-xl border border-gray-200 min-w-0">
        {/* 필터 */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">종류</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PROPERTY_TYPES.map((type) => (<button key={type} onClick={() => setActiveType(type)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${activeType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {type !== '전체' && <i className={`${TYPE_ICONS[type]} text-xs`}></i>}
                  {type}
                  <span className={`ml-0.5 text-xs ${activeType === type ? 'text-orange-100' : 'text-gray-400'}`}>{countByType(type)}</span>
                </button>))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">거래</span>
            <div className="flex items-center gap-1.5">
              {DEAL_TYPES.map((deal) => (<button key={deal} onClick={() => setActiveDeal(deal)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeDeal === deal ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {deal}
                  <span className={`ml-1 text-xs ${activeDeal === deal ? 'text-gray-300' : 'text-gray-400'}`}>{countByDeal(deal)}</span>
                </button>))}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 w-16 shrink-0">상태</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUS_TYPES.map((s) => (<button key={s} onClick={() => setActiveStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeStatus === s ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {s}
                  </button>))}
              </div>
            </div>
            <div className="relative w-full md:w-auto">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input type="text" placeholder="매물명, 위치 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 w-full md:w-56"/>
            </div>
          </div>
        </div>

        {/* 결과 수 */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-gray-600">
            총 <strong className="text-gray-900">{filtered.length}</strong>건
            {activeType !== '전체' && <span className="ml-2 text-orange-600 font-medium">· {activeType}</span>}
            {activeDeal !== '전체' && <span className="ml-1 text-gray-700 font-medium">· {activeDeal}</span>}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
            <i className="ri-mouse-line"></i>
            <span>행을 클릭하면 상세 정보를 확인할 수 있습니다</span>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-[1180px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">매물 정보</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">종류</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">거래</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">위치</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">면적</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">가격</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">상태</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">등록일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (<tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <i className="ri-building-line text-4xl"></i>
                      </div>
                      <p className="text-sm">조건에 맞는 매물이 없습니다</p>
                    </div>
                  </td>
                </tr>) : (filtered.map((property) => {
                    const statusInfo = STATUS_MAP[property.status] ?? { label: property.status, style: 'bg-gray-100 text-gray-600' };
                    const isSelected = selectedProperty?.id === property.id;
                    return (<tr
                      key={property.id}
                      onClick={() => handleRowClick(property)}
                      className={`transition-colors cursor-pointer border-l-2 ${isSelected ? 'bg-orange-50 border-orange-400' : 'border-transparent hover:bg-orange-50/30'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img src={property.image} alt={property.name} className="w-full h-full object-cover object-top" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 leading-snug max-w-[180px] truncate whitespace-nowrap">{property.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[property.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          <i className={`${TYPE_ICONS[property.type] ?? 'ri-building-line'} text-xs`}></i>
                          {property.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${DEAL_COLORS[property.dealType] ?? 'bg-gray-100 text-gray-600'}`}>
                          {property.dealType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap max-w-[220px] truncate">{property.location}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{property.area}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{property.price}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.style}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">{property.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 min-w-[72px]" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(property)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="수정"
                          >
                            <i className="ri-edit-line text-base"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="삭제"
                          >
                            <i className="ri-delete-bin-line text-base"></i>
                          </button>
                        </div>
                      </td>
                    </tr>);
                }))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {filtered.length > 0 && (<div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">{filtered.length}개 매물 표시 중</p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">
                <i className="ri-arrow-left-s-line text-base"></i>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white text-sm font-medium cursor-pointer">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer">
                <i className="ri-arrow-right-s-line text-base"></i>
              </button>
            </div>
          </div>)}
      </div>

      {/* 상세 슬라이드 패널 */}
      {selectedProperty && (<PropertyDetailPanel
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onEdit={() => handleEdit(selectedProperty)}
        />)}
    </div>);
}

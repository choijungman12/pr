import { useState, useRef, useCallback } from 'react';
const ZONING_OPTIONS = [
    '제1종전용주거지역', '제2종전용주거지역',
    '제1종일반주거지역', '제2종일반주거지역', '제3종일반주거지역',
    '준주거지역', '중심상업지역', '일반상업지역', '근린상업지역', '유통상업지역',
    '전용공업지역', '일반공업지역', '준공업지역',
    '보전녹지지역', '생산녹지지역', '자연녹지지역',
    '보전관리지역', '생산관리지역', '계획관리지역', '농림지역', '자연환경보전지역'
];
const CATEGORY_OPTIONS = ['아파트', '오피스텔', '빌딩', '상가', '지식산업센터', '토지'];
const DEAL_TYPE_OPTIONS = ['매매', '전세', '월세'];
const DEAL_TYPE_COLORS = {
    매매: 'bg-red-500 text-white border-red-500',
    전세: 'bg-emerald-500 text-white border-emerald-500',
    월세: 'bg-amber-500 text-white border-amber-500',
};
const DEAL_TYPE_INACTIVE = 'bg-white text-gray-600 border-gray-300 hover:border-orange-300';
const LAND_CATEGORY_OPTIONS = ['대', '전', '답', '임야', '잡종지', '공장용지', '도로', '하천', '구거', '유지'];
const BUSINESS_TYPE_OPTIONS = ['음식점', '카페', '편의점', '의류', '미용실', '약국', '학원', '병원', '사무실', '기타'];
const MOCK_LAND_DATA = {
    '서울특별시 강남구 역삼동 123-45': {
        address: '서울특별시 강남구 역삼동 123-45',
        landCategory: '대',
        area: '330.5㎡',
        officialPrice: '18,500,000원/㎡',
        zoning: '제3종일반주거지역',
        ownerName: '홍길동',
        ownerType: '개인',
        ownerShare: '1/1',
        registrationDate: '2015.03.12',
        verified: true,
    },
    '서울특별시 서초구 반포동 567-89': {
        address: '서울특별시 서초구 반포동 567-89',
        landCategory: '대',
        area: '412.0㎡',
        officialPrice: '22,100,000원/㎡',
        zoning: '제2종일반주거지역',
        ownerName: '김철수',
        ownerType: '개인',
        ownerShare: '2/3',
        registrationDate: '2018.07.25',
        verified: true,
    },
};
const MAP_PINS = [
    { id: 'pin1', x: 38, y: 42, label: '역삼동 123-45' },
    { id: 'pin2', x: 28, y: 58, label: '반포동 567-89' },
    { id: 'pin3', x: 52, y: 35, label: '잠실동 234-56' },
];
// 종류별 추가 필드 정의
const TYPE_EXTRA_FIELDS = {
    아파트: [
        { key: 'floor', label: '해당 층수', placeholder: '예: 12', unit: '층' },
        { key: 'totalFloors', label: '총 층수', placeholder: '예: 25', unit: '층' },
        { key: 'households', label: '세대수', placeholder: '예: 500', unit: '세대' },
        { key: 'roomCount', label: '방 개수', placeholder: '예: 3', unit: '개' },
        { key: 'bathroomCount', label: '욕실 개수', placeholder: '예: 2', unit: '개' },
        { key: 'parkingCount', label: '주차 가능 대수', placeholder: '예: 2', unit: '대' },
    ],
    오피스텔: [
        { key: 'floor', label: '해당 층수', placeholder: '예: 8', unit: '층' },
        { key: 'totalFloors', label: '총 층수', placeholder: '예: 20', unit: '층' },
        { key: 'exclusiveArea', label: '전용 면적', placeholder: '예: 33.5', unit: '㎡' },
        { key: 'roomCount', label: '방 개수', placeholder: '예: 1', unit: '개' },
        { key: 'direction', label: '방향', placeholder: '예: 남향' },
        { key: 'parkingCount', label: '주차 가능 대수', placeholder: '예: 1', unit: '대' },
    ],
    빌딩: [
        { key: 'totalFloors', label: '지상 층수', placeholder: '예: 10', unit: '층' },
        { key: 'undergroundFloors', label: '지하 층수', placeholder: '예: 2', unit: '층' },
        { key: 'parkingCount', label: '주차 대수', placeholder: '예: 30', unit: '대' },
        { key: 'elevatorCount', label: '엘리베이터 수', placeholder: '예: 2', unit: '대' },
        { key: 'buildYear', label: '준공 연도', placeholder: '예: 2010', unit: '년' },
        { key: 'rentalIncome', label: '월 임대 수익', placeholder: '예: 500만원' },
    ],
    상가: [
        { key: 'floor', label: '위치 층수', placeholder: '예: 1', unit: '층' },
        { key: 'keyMoney', label: '권리금', placeholder: '예: 5,000만원' },
        { key: 'businessType', label: '업종', placeholder: '예: 음식점', type: 'select', options: BUSINESS_TYPE_OPTIONS },
        { key: 'monthlyRevenue', label: '월 매출 (참고)', placeholder: '예: 3,000만원' },
        { key: 'contractPeriod', label: '임대 계약 기간', placeholder: '예: 2년' },
        { key: 'frontage', label: '전면 폭', placeholder: '예: 6', unit: 'm' },
    ],
    지식산업센터: [
        { key: 'floor', label: '해당 층수', placeholder: '예: 5', unit: '층' },
        { key: 'totalFloors', label: '총 층수', placeholder: '예: 15', unit: '층' },
        { key: 'usagePurpose', label: '용도', placeholder: '예: 제조업, IT, 연구소' },
        { key: 'ceilingHeight', label: '층고', placeholder: '예: 4.5', unit: 'm' },
        { key: 'loadCapacity', label: '하중', placeholder: '예: 1.5', unit: 't/㎡' },
        { key: 'parkingCount', label: '주차 대수', placeholder: '예: 2', unit: '대' },
    ],
    토지: [
        { key: 'landCategory', label: '지목', placeholder: '선택', type: 'select', options: LAND_CATEGORY_OPTIONS },
        { key: 'zoning', label: '용도지역', placeholder: '선택', type: 'select', options: ZONING_OPTIONS },
        { key: 'roadContact', label: '도로 접면', placeholder: '예: 6m 도로 접함' },
        { key: 'shape', label: '토지 형상', placeholder: '예: 정방형, 부정형' },
        { key: 'slope', label: '경사도', placeholder: '예: 평지, 완경사' },
        { key: 'buildingCoverage', label: '건폐율', placeholder: '예: 60', unit: '%' },
        { key: 'floorAreaRatio', label: '용적률', placeholder: '예: 200', unit: '%' },
    ],
};
export default function PropertyForm({ property, onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: property?.name || '',
        type: property?.type || '아파트',
        dealType: property?.dealType || '매매',
        location: property?.location || '',
        address: property?.address || '',
        detailAddress: property?.detailAddress || '',
        area: property?.area || '',
        ownerArea: property?.ownerArea || '',
        price: property?.price || '',
        depositPrice: property?.depositPrice || '',
        monthlyPrice: property?.monthlyPrice || '',
        zoning: property?.zoning || '',
        description: property?.description || '',
        status: property?.status || 'pending',
        lat: property?.lat || 37.5012,
        lng: property?.lng || 127.0396,
        // 종류별 추가 필드
        floor: '', totalFloors: '', households: '', roomCount: '', bathroomCount: '',
        parkingCount: '', exclusiveArea: '', direction: '', undergroundFloors: '',
        elevatorCount: '', buildYear: '', rentalIncome: '', keyMoney: '',
        businessType: '', monthlyRevenue: '', contractPeriod: '', frontage: '',
        usagePurpose: '', ceilingHeight: '', loadCapacity: '', landCategory: '',
        roadContact: '', shape: '', slope: '', buildingCoverage: '', floorAreaRatio: '',
    });
    const [addressSearch, setAddressSearch] = useState('');
    const [addressResults, setAddressResults] = useState([]);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [landInfo, setLandInfo] = useState(null);
    const [landVerifyLoading, setLandVerifyLoading] = useState(false);
    const [landVerifyDone, setLandVerifyDone] = useState(false);
    const [selectedMapPin, setSelectedMapPin] = useState(null);
    const [images, setImages] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitDone, setSubmitDone] = useState(false);
    const fileInputRef = useRef(null);
    const currentType = formData.type;
    const currentDeal = formData.dealType;
    const extraFields = TYPE_EXTRA_FIELDS[currentType] || [];
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleAddressSearch = () => {
        if (!addressSearch.trim())
            return;
        const mockResults = [
            `서울특별시 강남구 역삼동 ${addressSearch}`,
            `서울특별시 서초구 반포동 ${addressSearch}`,
            `서울특별시 송파구 잠실동 ${addressSearch}`,
            `서울특별시 마포구 상암동 ${addressSearch}`,
        ].filter((_, i) => i < 4);
        setAddressResults(mockResults);
        setShowAddressDropdown(true);
    };
    const handleAddressSelect = (addr) => {
        setFormData({ ...formData, address: addr });
        setAddressSearch(addr);
        setShowAddressDropdown(false);
        setLandVerifyDone(false);
        setLandInfo(null);
    };
    const handleLandVerify = () => {
        if (!formData.address)
            return;
        setLandVerifyLoading(true);
        setLandInfo(null);
        setTimeout(() => {
            const found = MOCK_LAND_DATA[formData.address];
            if (found) {
                setLandInfo(found);
                setFormData(prev => ({ ...prev, area: found.area, zoning: found.zoning }));
            }
            else {
                setLandInfo({
                    address: formData.address,
                    landCategory: '대',
                    area: '250.0㎡',
                    officialPrice: '12,000,000원/㎡',
                    zoning: '제2종일반주거지역',
                    ownerName: '소유자 정보',
                    ownerType: '개인',
                    ownerShare: '1/1',
                    registrationDate: '2020.01.01',
                    verified: true,
                });
            }
            setLandVerifyLoading(false);
            setLandVerifyDone(true);
        }, 1800);
    };
    const handleMapClick = (pin) => {
        setSelectedMapPin(pin.id);
        setFormData(prev => ({ ...prev, address: `서울특별시 ${pin.label}` }));
        setAddressSearch(`서울특별시 ${pin.label}`);
        setLandVerifyDone(false);
        setLandInfo(null);
    };
    const handleFileSelect = useCallback((files) => {
        if (!files)
            return;
        const newImages = Array.from(files).slice(0, 10 - images.length).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            name: file.name,
        }));
        setImages(prev => [...prev, ...newImages]);
    }, [images.length]);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };
    const removeImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };
    const getPriceDisplay = () => {
        if (currentDeal === '매매')
            return formData.price;
        if (currentDeal === '전세')
            return `전세 ${formData.depositPrice}`;
        return `월세 ${formData.depositPrice}/${formData.monthlyPrice}`;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setTimeout(() => {
            setSubmitLoading(false);
            setSubmitDone(true);
            const newProperty = {
                id: `pv-${Date.now()}`,
                name: formData.name,
                type: formData.type,
                dealType: formData.dealType,
                address: formData.address,
                detailAddress: formData.detailAddress,
                area: formData.area ? `${formData.area}㎡` : '',
                ownerArea: formData.ownerArea ? `${formData.ownerArea}㎡` : '',
                price: getPriceDisplay(),
                zoning: formData.zoning,
                description: formData.description,
                images: images.map(i => i.preview),
                extraFields: Object.fromEntries(extraFields.map(f => [f.key, formData[f.key]])),
                landInfo: landInfo ? {
                    landCategory: landInfo.landCategory,
                    officialPrice: landInfo.officialPrice,
                    ownerName: landInfo.ownerName,
                    ownerType: landInfo.ownerType,
                    ownerShare: landInfo.ownerShare,
                    registrationDate: landInfo.registrationDate,
                    verified: landInfo.verified,
                } : undefined,
                submittedAt: new Date().toLocaleString('ko-KR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                }),
                submittedBy: '관리자',
                status: 'pending',
                lat: formData.lat,
                lng: formData.lng,
            };
            const stored = localStorage.getItem('pendingProperties');
            const existing = stored ? JSON.parse(stored) : [];
            localStorage.setItem('pendingProperties', JSON.stringify([...existing, newProperty]));
            const approvedStored = localStorage.getItem('approvedProperties');
            const approved = approvedStored ? JSON.parse(approvedStored) : [];
            localStorage.setItem('approvedProperties', JSON.stringify(approved));
            setTimeout(() => { onSave(newProperty); }, 1200);
        }, 1500);
    };
    const canProceedStep1 = formData.name && formData.type && formData.address && formData.dealType;
    const canProceedStep2 = landVerifyDone;
    const stepLabels = ['기본 정보', '토지대장 확인', '사진 및 설명'];
    return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
              <i className="ri-building-2-line text-white text-lg"></i>
            </div>
            <h3 className="text-lg font-bold text-white">{property ? '매물 수정' : '매물 등록'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {stepLabels.map((label, idx) => {
            const num = idx + 1;
            const isActive = step === num;
            const isDone = step > num;
            return (<div key={num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {isDone ? <i className="ri-check-line text-sm"></i> : num}
                    </div>
                    <span className={`text-sm font-medium whitespace-nowrap ${isActive ? 'text-orange-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {idx < stepLabels.length - 1 && (<div className={`flex-1 h-0.5 mx-3 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`}></div>)}
                </div>);
        })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── STEP 1 ─── */}
          {step === 1 && (<div className="flex flex-col lg:flex-row h-full min-h-[500px]">
              {/* Left: Form */}
              <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto lg:border-r border-gray-100">
                {/* 매물명 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">매물명 <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="예: 강남구 역삼동 래미안 아파트" required/>
                </div>

                {/* 부동산 종류 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">부동산 종류 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {CATEGORY_OPTIONS.map(cat => (<button key={cat} type="button" onClick={() => setFormData(prev => ({ ...prev, type: cat }))} className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${formData.type === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'}`}>
                        {cat}
                      </button>))}
                  </div>
                </div>

                {/* 거래 유형 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">거래 유형 <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {DEAL_TYPE_OPTIONS.map(deal => (<button key={deal} type="button" onClick={() => setFormData(prev => ({ ...prev, dealType: deal }))} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all cursor-pointer whitespace-nowrap ${formData.dealType === deal ? DEAL_TYPE_COLORS[deal] : DEAL_TYPE_INACTIVE}`}>
                        {deal}
                      </button>))}
                  </div>
                </div>

                {/* 가격 (거래 유형별) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {currentDeal === '매매' ? '매매가' : currentDeal === '전세' ? '전세 보증금' : '보증금 / 월세'} <span className="text-red-500">*</span>
                  </label>
                  {currentDeal === '매매' && (<input type="text" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="예: 12억 5천만원"/>)}
                  {currentDeal === '전세' && (<input type="text" name="depositPrice" value={formData.depositPrice} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="예: 9억원"/>)}
                  {currentDeal === '월세' && (<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <input type="text" name="depositPrice" value={formData.depositPrice} onChange={handleChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="보증금 예: 1,000만원"/>
                      <span className="text-gray-400 font-bold">/</span>
                      <input type="text" name="monthlyPrice" value={formData.monthlyPrice} onChange={handleChange} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="월세 예: 100만원"/>
                    </div>)}
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">주소 검색 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 relative">
                    <input type="text" value={addressSearch} onChange={e => setAddressSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddressSearch()} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="지번 또는 도로명 주소 입력"/>
                    <button type="button" onClick={handleAddressSearch} className="px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-search-line mr-1"></i>검색
                    </button>
                    {showAddressDropdown && addressResults.length > 0 && (<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {addressResults.map((addr, i) => (<button key={i} type="button" onClick={() => handleAddressSelect(addr)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer border-b border-gray-100 last:border-0">
                            <i className="ri-map-pin-line mr-2 text-orange-400"></i>{addr}
                          </button>))}
                      </div>)}
                  </div>
                  {formData.address && (<div className="mt-2 flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                      <i className="ri-map-pin-fill text-orange-500 text-sm"></i>
                      <span className="text-sm text-orange-700 font-medium">{formData.address}</span>
                    </div>)}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">상세 주소</label>
                  <input type="text" name="detailAddress" value={formData.detailAddress} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder="동/호수 등 상세 주소 입력"/>
                </div>

                {/* 면적 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">공급 면적</label>
                    <div className="relative">
                      <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm pr-10" placeholder="예: 84.5"/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">㎡</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">소유 면적</label>
                    <div className="relative">
                      <input type="text" name="ownerArea" value={formData.ownerArea} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm pr-10" placeholder="예: 82.6"/>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">㎡</span>
                    </div>
                  </div>
                </div>

                {/* 종류별 추가 필드 */}
                {extraFields.length > 0 && (<div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <span className="text-xs font-semibold text-orange-600 px-2 py-1 bg-orange-50 rounded-full whitespace-nowrap">
                        {currentType} 세부 정보
                      </span>
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {extraFields.map(field => (<div key={field.key}>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                          {field.type === 'select' ? (<select name={field.key} value={formData[field.key]} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm cursor-pointer">
                              <option value="">선택</option>
                              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>) : (<div className="relative">
                              <input type="text" name={field.key} value={formData[field.key]} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm" placeholder={field.placeholder}/>
                              {field.unit && (<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{field.unit}</span>)}
                            </div>)}
                        </div>))}
                    </div>
                  </div>)}
              </div>

              {/* Right: Map */}
              <div className="w-full lg:w-80 flex-shrink-0 p-4 flex flex-col gap-3 border-t lg:border-t-0 border-gray-100">
                <div className="flex items-center gap-2">
                  <i className="ri-map-2-line text-orange-500"></i>
                  <span className="text-sm font-semibold text-gray-700">지도에서 위치 선택</span>
                </div>
                <div className="relative flex-1 min-h-[380px] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d25000!2d127.0396!3d37.5012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr" className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="매물 위치 지도"></iframe>
                  <div className="absolute inset-0 pointer-events-none">
                    {MAP_PINS.map(pin => (<button key={pin.id} type="button" onClick={() => handleMapClick(pin)} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all ${selectedMapPin === pin.id ? 'scale-125' : 'hover:scale-110'}`}>
                        <div className={`flex flex-col items-center ${selectedMapPin === pin.id ? 'text-orange-600' : 'text-red-500'}`}>
                          <div className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap mb-0.5 ${selectedMapPin === pin.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 shadow'}`}>{pin.label}</div>
                          <i className="ri-map-pin-fill text-2xl drop-shadow"></i>
                        </div>
                      </button>))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">핀을 클릭하거나 주소를 검색하여 위치를 선택하세요</p>
              </div>
            </div>)}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (<div className="p-4 sm:p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <i className="ri-information-line text-amber-500 text-lg mt-0.5"></i>
                <div>
                  <p className="text-sm font-semibold text-amber-800">매물 등록 전 토지대장 및 소유자 확인</p>
                  <p className="text-xs text-amber-700 mt-0.5">등록하려는 주소의 토지대장과 소유자 정보를 조회하여 매물 정보의 정확성을 확인합니다.</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">조회 주소</p>
                    <p className="text-sm text-orange-600 mt-0.5 font-medium">{formData.address || '주소를 먼저 입력해주세요'}</p>
                  </div>
                  <button type="button" onClick={handleLandVerify} disabled={!formData.address || landVerifyLoading} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${landVerifyDone ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                    {landVerifyLoading ? <><i className="ri-loader-4-line animate-spin"></i>조회 중...</> : landVerifyDone ? <><i className="ri-check-double-line"></i>확인 완료</> : <><i className="ri-file-search-line"></i>토지대장 조회</>}
                  </button>
                </div>
                {landVerifyLoading && (<div className="flex flex-col items-center py-10 gap-3">
                    <i className="ri-loader-4-line text-4xl text-orange-400 animate-spin"></i>
                    <p className="text-sm text-gray-500">토지대장 및 소유자 정보를 조회하고 있습니다...</p>
                  </div>)}
                {landInfo && !landVerifyLoading && (<div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      <span className="text-sm font-semibold text-green-700">토지대장 조회 완료</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3"><i className="ri-map-2-line text-orange-500"></i><span className="text-sm font-bold text-gray-800">토지 정보</span></div>
                        <div className="space-y-2">
                          {[{ label: '소재지', value: landInfo.address }, { label: '지목', value: landInfo.landCategory }, { label: '면적', value: landInfo.area }, { label: '공시지가', value: landInfo.officialPrice }, { label: '용도지역', value: landInfo.zoning }].map(({ label, value }) => (<div key={label} className="flex justify-between items-start gap-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
                              <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                            </div>))}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3"><i className="ri-user-line text-orange-500"></i><span className="text-sm font-bold text-gray-800">소유자 정보</span></div>
                        <div className="space-y-2">
                          {[{ label: '소유자명', value: landInfo.ownerName }, { label: '소유 구분', value: landInfo.ownerType }, { label: '지분', value: landInfo.ownerShare }, { label: '등기일', value: landInfo.registrationDate }].map(({ label, value }) => (<div key={label} className="flex justify-between items-start gap-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
                              <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                            </div>))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1.5">
                          <i className="ri-shield-check-line text-green-500 text-sm"></i>
                          <span className="text-xs text-green-600 font-medium">소유자 확인 완료</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-2">
                      <i className="ri-magic-line text-blue-500 text-sm"></i>
                      <p className="text-xs text-blue-700">토지대장 정보가 면적 및 용도지역에 자동으로 입력되었습니다.</p>
                    </div>
                  </div>)}
                {!landInfo && !landVerifyLoading && (<div className="flex flex-col items-center py-10 gap-2 text-gray-400">
                    <i className="ri-file-search-line text-4xl"></i>
                    <p className="text-sm">위 버튼을 클릭하여 토지대장을 조회하세요</p>
                  </div>)}
              </div>
            </div>)}

          {/* ─── STEP 3 ─── */}
          {step === 3 && (<div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 업로드 <span className="text-gray-400 font-normal text-xs ml-1">({images.length}/10)</span></label>
                <div onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'}`}>
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <i className="ri-image-add-line text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-sm font-medium text-gray-700">클릭하거나 파일을 드래그하여 업로드</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · 최대 10장 · 각 5MB 이하</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)}/>
                </div>
                {images.length > 0 && (<div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                    {images.map((img, idx) => (<div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.preview} alt={img.name} className="w-full h-full object-cover"/>
                        {idx === 0 && <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">대표</div>}
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <i className="ri-close-line text-xs"></i>
                        </button>
                      </div>))}
                  </div>)}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 설명</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={6} maxLength={500} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm resize-none" placeholder="매물의 특징, 주변 환경, 투자 포인트 등 상세 설명을 입력하세요..."/>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">매물의 특징과 투자 포인트를 상세히 작성할수록 문의가 늘어납니다</p>
                  <span className="text-xs text-gray-400">{formData.description.length}/500</span>
                </div>
              </div>

              {/* 등록 요약 */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">등록 정보 요약</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                { label: '매물명', value: formData.name },
                { label: '종류', value: formData.type },
                { label: '거래 유형', value: formData.dealType },
                { label: '주소', value: formData.address },
                { label: '면적', value: formData.area ? `${formData.area}㎡` : '-' },
                { label: '가격', value: getPriceDisplay() || '-' },
                { label: '토지대장', value: landVerifyDone ? '✅ 확인 완료' : '⚠️ 미확인' },
            ].map(({ label, value }) => (<div key={label} className="flex gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{label}:</span>
                      <span className="text-xs font-medium text-gray-800 truncate">{value}</span>
                    </div>))}
                </div>
              </div>
            </div>)}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          <button type="button" onClick={() => step > 1 ? setStep(prev => (prev - 1)) : onClose()} className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap">
            {step === 1 ? '취소' : '← 이전'}
          </button>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map(n => (<div key={n} className={`w-2 h-2 rounded-full transition-all ${step === n ? 'bg-orange-500 w-4' : step > n ? 'bg-green-400' : 'bg-gray-300'}`}></div>))}
          </div>
          {step < 3 ? (<button type="button" onClick={() => setStep(prev => (prev + 1))} disabled={step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : false} className="w-full sm:w-auto px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed">
              다음 →
            </button>) : (<button type="button" onClick={handleSubmit} disabled={submitLoading || submitDone} className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${submitDone ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70'}`}>
              {submitLoading ? <><i className="ri-loader-4-line animate-spin"></i>등록 중...</> : submitDone ? <><i className="ri-check-double-line"></i>등록 완료!</> : <><i className="ri-save-line"></i>{property ? '수정 완료' : '매물 등록'}</>}
            </button>)}
        </div>
      </div>
    </div>);
}

import { useState, useEffect } from 'react';
const MOCK_PENDING = [
    {
        id: 'pv-001',
        name: '강남구 역삼동 토지지분 25%',
        type: '토지',
        address: '서울특별시 강남구 역삼동 123-45',
        area: '330.5㎡',
        ownerArea: '82.6㎡',
        price: '5억 2천만원',
        zoning: '제3종일반주거지역',
        description: '역삼역 도보 5분 거리의 우량 토지지분입니다. 재개발 구역 내 위치하여 향후 개발 기대감이 높습니다. 지하철 2호선 역세권으로 교통이 매우 편리하며, 주변 상권이 잘 발달되어 있습니다.',
        images: [
            'https://readdy.ai/api/search-image?query=urban%20land%20plot%20gangnam%20seoul%20aerial%20view%20clear%20boundaries%20development%20potential%20simple%20white%20background&width=400&height=300&seq=pv001a&orientation=landscape',
            'https://readdy.ai/api/search-image?query=street%20view%20gangnam%20seoul%20modern%20buildings%20commercial%20area%20daytime%20clear%20sky&width=400&height=300&seq=pv001b&orientation=landscape',
        ],
        landInfo: {
            landCategory: '대',
            officialPrice: '18,500,000원/㎡',
            ownerName: '홍길동',
            ownerType: '개인',
            ownerShare: '1/4',
            registrationDate: '2015.03.12',
            verified: true,
        },
        submittedAt: '2024-01-15 14:32',
        submittedBy: '홍길동',
        status: 'pending',
        lat: 37.5012,
        lng: 127.0396,
    },
    {
        id: 'pv-002',
        name: '서초구 반포동 아파트 지분',
        type: '아파트',
        address: '서울특별시 서초구 반포동 567-89',
        area: '84㎡',
        ownerArea: '28㎡',
        price: '8억 5천만원',
        zoning: '제2종일반주거지역',
        description: '반포 한강변 인근 아파트 지분 매물입니다. 한강 조망이 가능하며 재건축 추진 중인 단지입니다.',
        images: [
            'https://readdy.ai/api/search-image?query=modern%20apartment%20complex%20banpo%20seoul%20han%20river%20view%20high%20rise%20residential%20building%20simple%20background&width=400&height=300&seq=pv002a&orientation=landscape',
        ],
        landInfo: {
            landCategory: '대',
            officialPrice: '22,100,000원/㎡',
            ownerName: '김철수',
            ownerType: '개인',
            ownerShare: '1/3',
            registrationDate: '2018.07.25',
            verified: true,
        },
        submittedAt: '2024-01-15 11:20',
        submittedBy: '김철수',
        status: 'pending',
        lat: 37.5045,
        lng: 126.9940,
    },
    {
        id: 'pv-003',
        name: '마포구 상암동 빌딩 지분 15%',
        type: '빌딩',
        address: '서울특별시 마포구 상암동 1600',
        area: '1,200㎡',
        ownerArea: '180㎡',
        price: '18억원',
        zoning: '일반상업지역',
        description: '상암 DMC 인근 상업용 빌딩 지분입니다. 방송·미디어 클러스터 중심부에 위치하여 임대 수요가 안정적입니다.',
        images: [
            'https://readdy.ai/api/search-image?query=commercial%20office%20building%20sangam%20DMC%20mapo%20seoul%20modern%20glass%20facade%20simple%20background&width=400&height=300&seq=pv003a&orientation=landscape',
        ],
        landInfo: {
            landCategory: '대',
            officialPrice: '9,800,000원/㎡',
            ownerName: '(주)상암개발',
            ownerType: '법인',
            ownerShare: '3/20',
            registrationDate: '2020.11.03',
            verified: true,
        },
        submittedAt: '2024-01-14 16:45',
        submittedBy: '이영희',
        status: 'pending',
        lat: 37.5665,
        lng: 126.8980,
    },
    {
        id: 'pv-004',
        name: '용산구 이촌동 토지 40%',
        type: '토지',
        address: '서울특별시 용산구 이촌동 302-15',
        area: '550㎡',
        ownerArea: '220㎡',
        price: '8억 3천만원',
        zoning: '제1종일반주거지역',
        description: '한강변 이촌동 토지지분입니다. 한강 조망 가능 위치이며 개발 잠재력이 높습니다.',
        images: [
            'https://readdy.ai/api/search-image?query=riverside%20land%20plot%20ichon%20yongsan%20seoul%20han%20river%20view%20development%20potential%20simple%20background&width=400&height=300&seq=pv004a&orientation=landscape',
        ],
        landInfo: {
            landCategory: '대',
            officialPrice: '14,200,000원/㎡',
            ownerName: '박민준',
            ownerType: '개인',
            ownerShare: '2/5',
            registrationDate: '2012.05.18',
            verified: true,
        },
        submittedAt: '2024-01-14 09:10',
        submittedBy: '박민준',
        status: 'pending',
        lat: 37.5220,
        lng: 126.9680,
    },
];
export default function PropertyVerification() {
    const [properties, setProperties] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [imageIndex, setImageIndex] = useState(0);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showMapPreview, setShowMapPreview] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    useEffect(() => {
        const loadData = () => {
            const stored = localStorage.getItem('pendingProperties');
            if (stored) {
                const parsed = JSON.parse(stored);
                const merged = [
                    ...MOCK_PENDING,
                    ...parsed.filter(p => !MOCK_PENDING.find(m => m.id === p.id)),
                ];
                setProperties(merged);
            }
            else {
                setProperties(MOCK_PENDING);
            }
        };
        loadData();
        const interval = setInterval(loadData, 3000);
        // 알림 불러오기
        const storedNotifs = localStorage.getItem('rejectionNotifications');
        if (storedNotifs)
            setNotifications(JSON.parse(storedNotifs));
        return () => clearInterval(interval);
    }, []);
    const saveToStorage = (updated) => {
        localStorage.setItem('pendingProperties', JSON.stringify(updated));
        const approved = updated.filter(p => p.status === 'approved');
        localStorage.setItem('approvedProperties', JSON.stringify(approved));
    };
    const saveNotification = (notif) => {
        const stored = localStorage.getItem('rejectionNotifications');
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [notif, ...existing];
        localStorage.setItem('rejectionNotifications', JSON.stringify(updated));
        setNotifications(updated);
    };
    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };
    const handleApprove = (property) => {
        setActionLoading(property.id);
        setTimeout(() => {
            const updated = properties.map(p => p.id === property.id ? { ...p, status: 'approved' } : p);
            setProperties(updated);
            saveToStorage(updated);
            if (selectedProperty?.id === property.id) {
                setSelectedProperty({ ...property, status: 'approved' });
            }
            setActionLoading(null);
            showToast(`"${property.name}" 매물이 승인되었습니다. 메인 화면에 표시됩니다.`, 'success');
        }, 800);
    };
    const handleRejectConfirm = () => {
        if (!rejectTarget)
            return;
        setActionLoading(rejectTarget.id);
        setTimeout(() => {
            const updated = properties.map(p => p.id === rejectTarget.id
                ? { ...p, status: 'rejected', rejectionReason }
                : p);
            setProperties(updated);
            saveToStorage(updated);
            if (selectedProperty?.id === rejectTarget.id) {
                setSelectedProperty({ ...rejectTarget, status: 'rejected', rejectionReason });
            }
            // 반려 알림 생성
            const notif = {
                id: `notif-${Date.now()}`,
                propertyId: rejectTarget.id,
                propertyName: rejectTarget.name,
                type: 'rejected',
                reason: rejectionReason,
                createdAt: new Date().toLocaleString('ko-KR', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                }),
                read: false,
            };
            saveNotification(notif);
            setActionLoading(null);
            setShowRejectModal(false);
            setRejectionReason('');
            setRejectTarget(null);
            showToast(`"${rejectTarget.name}" 매물이 반려되었습니다. 신청자에게 알림이 전송되었습니다.`, 'error');
        }, 800);
    };
    const openRejectModal = (property) => {
        setRejectTarget(property);
        setRejectionReason('');
        setShowRejectModal(true);
    };
    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem('rejectionNotifications', JSON.stringify(updated));
    };
    const unreadCount = notifications.filter(n => !n.read).length;
    const filtered = properties.filter(p => filterStatus === 'all' ? true : p.status === filterStatus);
    const shouldScrollMobileList = filtered.length >= 5;
    const counts = {
        all: properties.length,
        pending: properties.filter(p => p.status === 'pending').length,
        approved: properties.filter(p => p.status === 'approved').length,
        rejected: properties.filter(p => p.status === 'rejected').length,
    };
    const statusConfig = {
        pending: { label: '검토 대기', color: 'bg-amber-100 text-amber-700' },
        approved: { label: '승인 완료', color: 'bg-green-100 text-green-700' },
        rejected: { label: '반려', color: 'bg-red-100 text-red-700' },
    };
    const getMapEmbedUrl = (property) => {
        const lat = property.lat ?? 37.5665;
        const lng = property.lng ?? 126.9780;
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1500!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr`;
    };
    return (<div className="h-full min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden">
      {/* Toast */}
      {toast && (<div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-medium transition-all animate-fade-in ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <i className={`text-lg ${toast.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'}`}></i>
          {toast.message}
        </div>)}

      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">매물 검증 관리</h2>
            <p className="text-sm text-gray-500 mt-1">등록 신청된 매물을 검토하고 승인 또는 반려합니다. 승인된 매물만 메인 화면에 표시됩니다.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 알림 벨 */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(v => !v); if (unreadCount > 0)
        markAllRead(); }} className="relative w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <i className="ri-notification-3-line text-gray-600 text-lg"></i>
                {unreadCount > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>)}
              </button>

              {/* 알림 드롭다운 */}
              {showNotifications && (<div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="ri-notification-3-line text-orange-500"></i>
                      <span className="text-sm font-bold text-gray-800">반려 알림</span>
                      {notifications.length > 0 && (<span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                          {notifications.length}건
                        </span>)}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (<div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <i className="ri-notification-off-line text-3xl"></i>
                        </div>
                        <p className="text-sm">반려 알림이 없습니다</p>
                      </div>) : (<div className="divide-y divide-gray-50">
                        {notifications.map(notif => (<div key={notif.id} className={`px-4 py-3.5 ${!notif.read ? 'bg-red-50/50' : ''}`}>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full flex-shrink-0 mt-0.5">
                                <i className="ri-close-circle-line text-red-500 text-sm"></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-xs font-bold text-gray-800 truncate">{notif.propertyName}</p>
                                  {!notif.read && (<span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>)}
                                </div>
                                <p className="text-xs text-red-600 font-medium mb-1">매물 반려 — 신청자에게 알림 전송됨</p>
                                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-1">
                                  <p className="text-xs text-gray-600">
                                    <span className="font-semibold text-gray-700">반려 사유: </span>
                                    {notif.reason}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400">{notif.createdAt}</p>
                              </div>
                            </div>
                          </div>))}
                      </div>)}
                  </div>
                  {notifications.length > 0 && (<div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <button onClick={() => {
                    setNotifications([]);
                    localStorage.removeItem('rejectionNotifications');
                }} className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                        알림 전체 삭제
                      </button>
                    </div>)}
                </div>)}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-amber-700">대기 중 {counts.pending}건</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-5">
          {[
            { key: 'all', label: '전체 신청', icon: 'ri-file-list-3-line', color: 'text-gray-600', bg: 'bg-gray-50' },
            { key: 'pending', label: '검토 대기', icon: 'ri-time-line', color: 'text-amber-600', bg: 'bg-amber-50' },
            { key: 'approved', label: '승인 완료', icon: 'ri-checkbox-circle-line', color: 'text-green-600', bg: 'bg-green-50' },
            { key: 'rejected', label: '반려', icon: 'ri-close-circle-line', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(stat => (<div key={stat.key} className={`${stat.bg} rounded-xl p-4 border border-gray-100`}>
              <div className="flex items-center gap-2 mb-1">
                <i className={`${stat.icon} ${stat.color} text-lg`}></i>
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{counts[stat.key]}</p>
            </div>))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* Left: List */}
        <div className="w-full lg:w-[400px] lg:flex-shrink-0 border-r border-gray-200 border-b lg:border-b-0 flex flex-col bg-white lg:min-h-0 lg:h-full">
          <div className="px-4 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
            {['all', 'pending', 'approved', 'rejected'].map(status => (<button key={status} onClick={() => setFilterStatus(status)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${filterStatus === status
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {status === 'all' ? `전체 (${counts.all})` :
                status === 'pending' ? `대기 (${counts.pending})` :
                    status === 'approved' ? `승인 (${counts.approved})` :
                        `반려 (${counts.rejected})`}
              </button>))}
          </div>

          <div className={`${shouldScrollMobileList ? 'max-h-[52vh] overflow-y-auto' : 'overflow-visible'} lg:max-h-none lg:flex-1 lg:min-h-0 lg:overflow-y-auto`}>
            {filtered.length === 0 ? (<div className="flex flex-col items-center justify-center min-h-[180px] text-gray-400 gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-inbox-line text-4xl"></i>
                </div>
                <p className="text-sm">해당 상태의 매물이 없습니다</p>
              </div>) : (<div className="divide-y divide-gray-100">
                {filtered.map(property => {
                const sc = statusConfig[property.status];
                const isSelected = selectedProperty?.id === property.id;
                return (<div key={property.id} onClick={() => { setSelectedProperty(property); setImageIndex(0); setShowMapPreview(false); }} className={`p-4 cursor-pointer transition-all hover:bg-orange-50/50 ${isSelected ? 'bg-orange-50 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {property.images[0] ? (<img src={property.images[0]} alt="" className="w-full h-full object-cover object-top"/>) : (<div className="w-full h-full flex items-center justify-center">
                              <i className="ri-image-line text-gray-400 text-xl"></i>
                            </div>)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{property.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${sc.color}`}>
                              {sc.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1 mb-1.5">
                            <i className="ri-map-pin-line mr-1"></i>{property.address}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-orange-600">{property.price}</span>
                            <span className="text-xs text-gray-400">{property.submittedAt}</span>
                          </div>
                        </div>
                      </div>
                      {property.status === 'pending' && (<div className="flex gap-2 mt-3">
                          <button onClick={e => { e.stopPropagation(); handleApprove(property); }} disabled={actionLoading === property.id} className="flex-1 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1">
                            {actionLoading === property.id ? (<i className="ri-loader-4-line animate-spin"></i>) : (<i className="ri-checkbox-circle-line"></i>)}
                            승인
                          </button>
                          <button onClick={e => { e.stopPropagation(); openRejectModal(property); }} disabled={actionLoading === property.id} className="flex-1 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 flex items-center justify-center gap-1">
                            <i className="ri-close-circle-line"></i>
                            반려
                          </button>
                        </div>)}
                      {/* 반려된 매물 — 사유 미리보기 */}
                      {property.status === 'rejected' && property.rejectionReason && (<div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs text-red-600">
                            <i className="ri-information-line mr-1"></i>
                            반려 사유: {property.rejectionReason}
                          </p>
                        </div>)}
                    </div>);
            })}
              </div>)}
          </div>
        </div>

        {/* Right: Detail */}
        <div className="flex-none lg:flex-1 min-h-0 overflow-visible lg:overflow-y-auto bg-gray-50">
          {!selectedProperty ? (<div className="flex flex-col items-center justify-center text-gray-400 gap-4 py-14 md:py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-building-2-line text-3xl"></i>
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-gray-500">매물을 선택하세요</p>
                <p className="text-sm text-gray-400 mt-1">좌측 목록에서 검토할 매물을 클릭하세요</p>
              </div>
            </div>) : (<div className="p-6 space-y-5">
              {/* Status Banner */}
              {selectedProperty.status === 'approved' && (<div className="flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-200 rounded-xl">
                  <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
                  <div>
                    <p className="text-sm font-bold text-green-800">승인 완료 — 메인 화면에 표시 중</p>
                    <p className="text-xs text-green-600 mt-0.5">이 매물은 프라임지분거래소 메인 화면에 노출되고 있습니다.</p>
                  </div>
                </div>)}
              {selectedProperty.status === 'rejected' && (<div className="flex items-start gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                  <i className="ri-close-circle-fill text-red-500 text-xl mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">반려됨 — 메인 화면 미표시</p>
                    {selectedProperty.rejectionReason && (<div className="mt-2 bg-white border border-red-200 rounded-lg px-3 py-2.5">
                        <p className="text-xs text-gray-500 mb-0.5 font-medium">신청자에게 전달된 반려 사유</p>
                        <p className="text-sm text-red-700 font-medium">{selectedProperty.rejectionReason}</p>
                      </div>)}
                    <div className="mt-2 flex items-center gap-1.5">
                      <i className="ri-send-plane-line text-red-400 text-xs"></i>
                      <p className="text-xs text-red-500">신청자({selectedProperty.submittedBy})에게 반려 알림이 전송되었습니다.</p>
                    </div>
                  </div>
                </div>)}
              {selectedProperty.status === 'pending' && (<div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <i className="ri-time-line text-amber-500 text-xl"></i>
                  <div>
                    <p className="text-sm font-bold text-amber-800">검토 대기 중 — 승인 전까지 메인 화면 미표시</p>
                    <p className="text-xs text-amber-600 mt-0.5">아래 정보를 검토 후 승인 또는 반려해주세요.</p>
                  </div>
                </div>)}

              {/* Image Gallery */}
              {selectedProperty.images.length > 0 && (<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative h-56 bg-gray-100">
                    <img src={selectedProperty.images[imageIndex]} alt="" className="w-full h-full object-cover object-top"/>
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {imageIndex + 1} / {selectedProperty.images.length}
                    </div>
                    {selectedProperty.images.length > 1 && (<>
                        <button onClick={() => setImageIndex(i => Math.max(0, i - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer">
                          <i className="ri-arrow-left-s-line text-lg"></i>
                        </button>
                        <button onClick={() => setImageIndex(i => Math.min(selectedProperty.images.length - 1, i + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors cursor-pointer">
                          <i className="ri-arrow-right-s-line text-lg"></i>
                        </button>
                      </>)}
                  </div>
                  {selectedProperty.images.length > 1 && (<div className="flex gap-2 p-3 overflow-x-auto">
                      {selectedProperty.images.map((img, i) => (<button key={i} onClick={() => setImageIndex(i)} className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${imageIndex === i ? 'border-orange-500' : 'border-transparent'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover object-top"/>
                        </button>))}
                    </div>)}
                </div>)}

              {/* 지도 위치 미리보기 */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => setShowMapPreview(v => !v)} className="w-full flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <i className="ri-map-2-line text-orange-500 text-lg"></i>
                    <span className="text-sm font-bold text-gray-800 whitespace-nowrap">지도 위치 미리보기</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium max-w-[140px] sm:max-w-[220px] truncate">
                      {selectedProperty.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{showMapPreview ? '접기' : '펼치기'}</span>
                    <i className={`ri-arrow-${showMapPreview ? 'up' : 'down'}-s-line text-gray-400 text-lg`}></i>
                  </div>
                </button>

                {showMapPreview && (<div className="border-t border-gray-100">
                    {/* 좌표 정보 */}
                    <div className="px-4 sm:px-5 py-3 bg-gray-50 flex flex-wrap items-center gap-3 sm:gap-6 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <i className="ri-crosshair-line text-orange-400 text-sm"></i>
                        <span className="text-xs text-gray-500">위도</span>
                        <span className="text-xs font-semibold text-gray-800">{selectedProperty.lat?.toFixed(4) ?? '37.5665'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ri-crosshair-2-line text-orange-400 text-sm"></i>
                        <span className="text-xs text-gray-500">경도</span>
                        <span className="text-xs font-semibold text-gray-800">{selectedProperty.lng?.toFixed(4) ?? '126.9780'}</span>
                      </div>
                      <a href={`https://www.google.com/maps?q=${selectedProperty.lat ?? 37.5665},${selectedProperty.lng ?? 126.9780}`} target="_blank" rel="nofollow noopener noreferrer" className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap">
                        <i className="ri-external-link-line"></i>
                        Google Maps에서 열기
                      </a>
                    </div>

                    {/* 지도 iframe */}
                    <div className="relative w-full h-72">
                      <iframe src={getMapEmbedUrl(selectedProperty)} className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`${selectedProperty.name} 위치`}></iframe>
                      {/* 매물 위치 오버레이 배지 */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center bg-orange-500 rounded-full flex-shrink-0">
                          <i className="ri-map-pin-fill text-white text-xs"></i>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{selectedProperty.name}</p>
                          <p className="text-xs text-gray-500 leading-tight">{selectedProperty.type} · {selectedProperty.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <i className="ri-building-2-line text-orange-500"></i>
                    기본 정보
                  </h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                    {selectedProperty.type}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {[
                { label: '매물명', value: selectedProperty.name },
                { label: '주소', value: selectedProperty.address },
                { label: '상세주소', value: selectedProperty.detailAddress || '-' },
                { label: '면적', value: selectedProperty.area },
                { label: '소유면적', value: selectedProperty.ownerArea || '-' },
                { label: '가격', value: selectedProperty.price },
                { label: '용도지역', value: selectedProperty.zoning || '-' },
                { label: '신청자', value: selectedProperty.submittedBy || '-' },
                { label: '신청일시', value: selectedProperty.submittedAt },
            ].map(({ label, value }) => (<div key={label} className="flex gap-3">
                      <span className="text-xs text-gray-400 whitespace-nowrap w-20 flex-shrink-0">{label}</span>
                      <span className="text-xs font-medium text-gray-800">{value}</span>
                    </div>))}
                </div>
              </div>

              {/* Land Registry */}
              {selectedProperty.landInfo && (<div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <i className="ri-file-text-line text-orange-500"></i>
                    토지대장 / 소유자 확인
                    {selectedProperty.landInfo.verified && (<span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                        <i className="ri-shield-check-line"></i>확인 완료
                      </span>)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                      <p className="text-xs font-bold text-gray-700 mb-2">토지 정보</p>
                      {[
                    { label: '지목', value: selectedProperty.landInfo.landCategory },
                    { label: '공시지가', value: selectedProperty.landInfo.officialPrice },
                    { label: '용도지역', value: selectedProperty.zoning || '-' },
                ].map(({ label, value }) => (<div key={label} className="flex justify-between">
                          <span className="text-xs text-gray-500">{label}</span>
                          <span className="text-xs font-medium text-gray-800">{value}</span>
                        </div>))}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                      <p className="text-xs font-bold text-gray-700 mb-2">소유자 정보</p>
                      {[
                    { label: '소유자명', value: selectedProperty.landInfo.ownerName },
                    { label: '소유구분', value: selectedProperty.landInfo.ownerType },
                    { label: '지분', value: selectedProperty.landInfo.ownerShare },
                    { label: '등기일', value: selectedProperty.landInfo.registrationDate },
                ].map(({ label, value }) => (<div key={label} className="flex justify-between">
                          <span className="text-xs text-gray-500">{label}</span>
                          <span className="text-xs font-medium text-gray-800">{value}</span>
                        </div>))}
                    </div>
                  </div>
                </div>)}

              {/* Description */}
              {selectedProperty.description && (<div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <i className="ri-align-left text-orange-500"></i>
                    상세 설명
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedProperty.description}</p>
                </div>)}

              {/* Action Buttons */}
              {selectedProperty.status === 'pending' && (<div className="flex flex-col sm:flex-row gap-3 bg-gray-50 pt-2 pb-1 lg:sticky lg:bottom-0">
                  <button onClick={() => openRejectModal(selectedProperty)} disabled={!!actionLoading} className="flex-1 py-3.5 bg-white border-2 border-red-400 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60">
                    <i className="ri-close-circle-line text-lg"></i>
                    반려하기
                  </button>
                  <button onClick={() => handleApprove(selectedProperty)} disabled={!!actionLoading} className="flex-1 py-3.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-green-200">
                    {actionLoading === selectedProperty.id ? (<><i className="ri-loader-4-line animate-spin text-lg"></i>처리 중...</>) : (<><i className="ri-checkbox-circle-line text-lg"></i>승인하여 메인에 표시</>)}
                  </button>
                </div>)}
            </div>)}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && rejectTarget && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
                  <i className="ri-close-circle-line text-red-500 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">매물 반려</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{rejectTarget.name}</p>
                </div>
              </div>

              {/* 알림 안내 */}
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <i className="ri-notification-3-line text-amber-500 text-sm mt-0.5"></i>
                <div>
                  <p className="text-xs font-semibold text-amber-800">신청자 알림 전송</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    반려 확인 시 <strong>{rejectTarget.submittedBy ?? '신청자'}</strong>에게 반려 사유가 포함된 알림이 자동으로 전송됩니다.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  반려 사유 <span className="text-red-500">*</span>
                </label>
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} maxLength={500} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent" placeholder="반려 사유를 입력하세요. 신청자에게 그대로 전달됩니다."/>
                <div className="flex justify-between mt-1.5">
                  <div className="flex gap-2 flex-wrap">
                    {['서류 미비', '정보 불일치', '중복 매물', '허위 정보', '사진 불량'].map(reason => (<button key={reason} onClick={() => setRejectionReason(reason)} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer whitespace-nowrap">
                        {reason}
                      </button>))}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{rejectionReason.length}/500</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); setRejectTarget(null); }} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  취소
                </button>
                <button onClick={handleRejectConfirm} disabled={!rejectionReason.trim() || !!actionLoading} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {actionLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-line"></i>}
                  반려 및 알림 전송
                </button>
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}

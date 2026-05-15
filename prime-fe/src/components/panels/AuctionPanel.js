import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { auctionItems, publicSaleItems } from '../../data/mockAuctionData';

function AuctionPanel({ onClose, selectedAuction, onSelectAuction, onMoveToLocation }) {
  const [mode, setMode] = useState('auction');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedPublicSale, setSelectedPublicSale] = useState(null);

  // 마커 클릭 시 자동 상세 전환
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const prevSideMapRef = useRef(null);

  // 지도 마커 클릭 → 해당 경매/공매 상세로 자동 전환
  useEffect(() => {
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    const props = sideMapData.properties;
    // 경매 아이템에서 매칭
    const matchedAuction = auctionItems.find((item) => item.id === props.id);
    if (matchedAuction) {
      setMode('auction');
      onSelectAuction(matchedAuction);
      return;
    }
    // 공매 아이템에서 매칭
    const matchedPublicSale = publicSaleItems.find((item) => item.id === props.id);
    if (matchedPublicSale) {
      setMode('publicSale');
      setSelectedPublicSale(matchedPublicSale);
    }
  }, [sideMapData, onSelectAuction]);

  const filteredAuctionItems = auctionItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const filteredPublicSaleItems = publicSaleItems.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'proceeding': return 'bg-emerald-100 text-emerald-700';
      case 'failed': return 'bg-gray-200 text-gray-600';
      case 'sold': return 'bg-sky-100 text-sky-700';
      case 'upcoming': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRightsPriorityStyle = (priority) => {
    switch (priority) {
      case 'safe': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'caution': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'danger': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const openCourtAuctionSite = (caseNumber) => {
    window.open(`https://www.courtauction.go.kr/`, '_blank');
  };

  const openOnbidSite = (saleNumber) => {
    window.open(`https://www.onbid.co.kr/`, '_blank');
  };

  // 경매 상세 보기
  if (selectedAuction && mode === 'auction') {
    return (
      <div className="w-[420px] bg-white h-full flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="relative">
          <div className="h-44 w-full">
            <img src={selectedAuction.image} alt={selectedAuction.address} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>
          <button onClick={() => onSelectAuction(null)} className="absolute top-3 left-3 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
            <i className="ri-arrow-left-line text-white text-lg"></i>
          </button>
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedAuction.status)}`}>
              {selectedAuction.statusLabel}
            </span>
            {selectedAuction.failCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                {selectedAuction.failCount}회 유찰
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white text-lg font-bold">{selectedAuction.address}</p>
            <p className="text-white/70 text-xs">{selectedAuction.caseNumber} · {selectedAuction.court}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 핵심 가격 정보 */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">감정가</p>
                <p className="text-xl font-bold text-gray-900">{selectedAuction.appraisalPriceText}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">최저입찰가</p>
                <p className="text-xl font-bold text-rose-600">{selectedAuction.minimumBidPriceText}</p>
                <p className="text-xs text-rose-500 font-medium">{selectedAuction.bidRatio}%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full" style={{ width: `${selectedAuction.bidRatio}%` }}></div>
              </div>
              <span className="text-xs font-bold text-gray-500">{selectedAuction.bidRatio}%</span>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '물건종류', value: selectedAuction.typeLabel },
              { label: '면적', value: selectedAuction.areaText },
              { label: '매각기일', value: selectedAuction.auctionDate },
              ...(selectedAuction.floor ? [{ label: '층수', value: `${selectedAuction.floor}층` }] : []),
              ...(selectedAuction.builtYear ? [{ label: '준공년도', value: `${selectedAuction.builtYear}년` }] : []),
              ...(selectedAuction.zoning ? [{ label: '용도지역', value: selectedAuction.zoning }] : []),
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-gray-400">{item.label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* 설명 */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 leading-relaxed">{selectedAuction.description}</p>
          </div>

          {/* 권리분석 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-shield-check-line text-orange-500"></i></div>
              권리분석
            </h4>
            <div className="space-y-2">
              {selectedAuction.rights.map((right, idx) => (
                <div key={idx} className={`border rounded-xl p-3 ${getRightsPriorityStyle(right.priority)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{right.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      right.priority === 'safe' ? 'bg-emerald-200 text-emerald-800' :
                      right.priority === 'caution' ? 'bg-amber-200 text-amber-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {right.priority === 'safe' ? '안전' : right.priority === 'caution' ? '주의' : '위험'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>{right.holder}</span>
                    {right.amount && <span className="font-bold">{right.amount}</span>}
                  </div>
                  <p className="text-[10px] opacity-70 mt-1">{right.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 입찰 히스토리 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-history-line text-orange-500"></i></div>
              입찰 이력
            </h4>
            <div className="space-y-2">
              {selectedAuction.bidHistory.map((bid, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-600">{bid.round}회</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{bid.minimumPrice}</p>
                    <p className="text-[10px] text-gray-400">{bid.date}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    bid.result === '유찰' ? 'bg-gray-200 text-gray-600' :
                    bid.result === '낙찰' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {bid.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
            <i className="ri-notification-3-line"></i>
            알림 설정
          </button>
          <button
            onClick={() => openCourtAuctionSite(selectedAuction.caseNumber)}
            className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold rounded-xl text-sm hover:from-rose-600 hover:to-red-600 transition-all cursor-pointer whitespace-nowrap shadow-lg flex items-center justify-center gap-1.5"
          >
            <i className="ri-external-link-line"></i>
            법원 경매 사이트
          </button>
        </div>
      </div>
    );
  }

  // 공매 상세 보기
  if (selectedPublicSale && mode === 'public') {
    return (
      <div className="w-[420px] bg-white h-full flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="relative">
          <div className="h-44 w-full">
            <img src={selectedPublicSale.image} alt={selectedPublicSale.address} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </div>
          <button onClick={() => setSelectedPublicSale(null)} className="absolute top-3 left-3 w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer">
            <i className="ri-arrow-left-line text-white text-lg"></i>
          </button>
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(selectedPublicSale.status)}`}>
              {selectedPublicSale.statusLabel}
            </span>
            {selectedPublicSale.attemptCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-600">
                {selectedPublicSale.attemptCount}차 입찰
              </span>
            )}
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white text-lg font-bold">{selectedPublicSale.address}</p>
            <p className="text-white/70 text-xs">{selectedPublicSale.saleNumber} · {selectedPublicSale.agency}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 핵심 가격 정보 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">감정가</p>
                <p className="text-xl font-bold text-gray-900">{selectedPublicSale.appraisalPriceText}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">최저입찰가</p>
                <p className="text-xl font-bold text-purple-600">{selectedPublicSale.minimumBidPriceText}</p>
                <p className="text-xs text-purple-500 font-medium">{selectedPublicSale.bidRatio}%</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full" style={{ width: `${selectedPublicSale.bidRatio}%` }}></div>
              </div>
              <span className="text-xs font-bold text-gray-500">{selectedPublicSale.bidRatio}%</span>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '물건종류', value: selectedPublicSale.typeLabel },
              { label: '면적', value: selectedPublicSale.areaText },
              { label: '입찰마감', value: selectedPublicSale.bidDeadline },
              ...(selectedPublicSale.floor ? [{ label: '층수', value: `${selectedPublicSale.floor}층` }] : []),
              ...(selectedPublicSale.builtYear ? [{ label: '준공년도', value: `${selectedPublicSale.builtYear}년` }] : []),
              { label: '입찰방식', value: selectedPublicSale.bidMethod },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-gray-400">{item.label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* 설명 */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-600 leading-relaxed">{selectedPublicSale.description}</p>
          </div>

          {/* 공매 특이사항 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-information-line text-purple-500"></i></div>
              특이사항
            </h4>
            <div className="space-y-2">
              {selectedPublicSale.notes.map((note, idx) => (
                <div key={idx} className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-xs text-purple-900">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 입찰 이력 */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-history-line text-purple-500"></i></div>
              입찰 이력
            </h4>
            <div className="space-y-2">
              {selectedPublicSale.bidHistory.map((bid, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-600">{bid.round}차</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{bid.minimumPrice}</p>
                    <p className="text-[10px] text-gray-400">{bid.date}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    bid.result === '유찰' ? 'bg-gray-200 text-gray-600' :
                    bid.result === '낙찰' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {bid.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
            <i className="ri-notification-3-line"></i>
            알림 설정
          </button>
          <button
            onClick={() => openOnbidSite(selectedPublicSale.saleNumber)}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl text-sm hover:from-purple-600 hover:to-indigo-600 transition-all cursor-pointer whitespace-nowrap shadow-lg flex items-center justify-center gap-1.5"
          >
            <i className="ri-external-link-line"></i>
            온비드 사이트
          </button>
        </div>
      </div>
    );
  }

  // 목록 보기
  return (
    <div className="w-[420px] bg-white h-full flex flex-col shadow-2xl">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 bg-gradient-to-br ${mode === 'auction' ? 'from-rose-500 to-red-500' : 'from-purple-500 to-indigo-500'} rounded-xl flex items-center justify-center shadow-lg`}>
              <i className={`${mode === 'auction' ? 'ri-auction-line' : 'ri-government-line'} text-white text-lg`}></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{mode === 'auction' ? '경매 물건' : '공매 물건'}</h2>
              <p className="text-xs text-gray-500">총 {mode === 'auction' ? filteredAuctionItems.length : filteredPublicSaleItems.length}건</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer">
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>

        {/* 경매/공매 탭 전환 */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 mb-3">
          <button
            onClick={() => {
              setMode('auction');
              onSelectAuction(null);
              setSelectedPublicSale(null);
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              mode === 'auction' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <i className="ri-auction-line"></i>
            경매
          </button>
          <button
            onClick={() => {
              setMode('public');
              onSelectAuction(null);
              setSelectedPublicSale(null);
            }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
              mode === 'public' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <i className="ri-government-line"></i>
            공매
          </button>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'proceeding', label: '진행중' },
              { id: 'failed', label: '유찰' },
              { id: 'upcoming', label: '예정' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === s.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-100 rounded-lg px-2 py-1.5 text-xs text-gray-600 outline-none cursor-pointer"
          >
            <option value="all">전체유형</option>
            <option value="apt">아파트</option>
            <option value="land">토지</option>
            <option value="commercial">상가</option>
            <option value="villa">빌라</option>
          </select>
        </div>

        {/* 외부 사이트 바로가기 */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.open('https://www.courtauction.go.kr/', '_blank')}
            className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
          >
            <i className="ri-external-link-line"></i>
            대법원 경매
          </button>
          <button
            onClick={() => window.open('https://www.onbid.co.kr/', '_blank')}
            className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
          >
            <i className="ri-external-link-line"></i>
            온비드 공매
          </button>
        </div>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'auction' ? (
          filteredAuctionItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectAuction(item);
                onMoveToLocation?.(item.position.lat, item.position.lng, 15);
              }}
              className="p-4 border-b border-gray-50 hover:bg-rose-50/40 transition-all cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img src={item.image} alt={item.address} className="w-full h-full rounded-xl object-cover object-top shadow-md" />
                  <span className={`absolute top-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded-md font-bold ${getStatusStyle(item.status)}`}>
                    {item.statusLabel}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{item.typeLabel}</span>
                      {item.failCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-medium">{item.failCount}회 유찰</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-rose-600 transition-colors">{item.address}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.caseNumber} · {item.areaText}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">감정가 <span className="line-through">{item.appraisalPriceText}</span></p>
                      <p className="text-base font-bold text-rose-600">{item.minimumBidPriceText}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">매각기일</p>
                      <p className="text-xs font-bold text-gray-700">{item.auctionDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredPublicSaleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedPublicSale(item);
                onMoveToLocation?.(item.position.lat, item.position.lng, 15);
              }}
              className="p-4 border-b border-gray-50 hover:bg-purple-50/40 transition-all cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img src={item.image} alt={item.address} className="w-full h-full rounded-xl object-cover object-top shadow-md" />
                  <span className={`absolute top-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded-md font-bold ${getStatusStyle(item.status)}`}>
                    {item.statusLabel}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{item.typeLabel}</span>
                      {item.attemptCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded font-medium">{item.attemptCount}차</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">{item.address}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.saleNumber} · {item.areaText}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400">감정가 <span className="line-through">{item.appraisalPriceText}</span></p>
                      <p className="text-base font-bold text-purple-600">{item.minimumBidPriceText}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400">입찰마감</p>
                      <p className="text-xs font-bold text-gray-700">{item.bidDeadline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuctionPanel;

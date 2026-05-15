import React, { useState } from 'react';
import {
  externalTransactionData,
  getSourceColor,
  getSourceLabel,
} from '../../data/mockExternalTransactionData';

const dataSources = [
  { id: 'molit', label: '국토교통부', icon: 'ri-government-line',     desc: '실거래가 공개시스템', color: 'from-rose-500 to-rose-600' },
  { id: 'reb',   label: '한국부동산원', icon: 'ri-building-line',      desc: '부동산 통계정보',    color: 'from-amber-500 to-amber-600' },
  { id: 'kab',   label: 'KB부동산',    icon: 'ri-bank-line',           desc: 'KB시세 및 통계',     color: 'from-emerald-500 to-emerald-600' },
  { id: 'court', label: '법원경매',    icon: 'ri-auction-line',        desc: '대법원 경매정보',    color: 'from-sky-500 to-sky-600' },
];

// 주변 시세 비교 (반경 약 1.5km)
function getNearbyComparison(item) {
  const nearby = externalTransactionData.filter(
    (d) =>
      d.id !== item.id &&
      Math.abs(d.position.lat - item.position.lat) < 0.015 &&
      Math.abs(d.position.lng - item.position.lng) < 0.015,
  );
  const priceNum = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
  const nearbyPrices = nearby.map((n) => parseFloat(n.price.replace(/[^0-9.]/g, '')) || 0).filter((p) => p > 0);
  const avgPrice = nearbyPrices.length > 0 ? nearbyPrices.reduce((a, b) => a + b, 0) / nearbyPrices.length : 0;
  const maxPrice = nearbyPrices.length > 0 ? Math.max(...nearbyPrices) : 0;
  const minPrice = nearbyPrices.length > 0 ? Math.min(...nearbyPrices) : 0;
  const diffPercent = avgPrice > 0 ? ((priceNum - avgPrice) / avgPrice) * 100 : 0;
  return { nearby, avgPrice, maxPrice, minPrice, diffPercent, priceNum };
}

function ExternalTransactionPanel({ onClose, onMoveToLocation }) {
  const [activeSource, setActiveSource] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered =
    activeSource === 'all'
      ? externalTransactionData
      : externalTransactionData.filter((d) => d.source === activeSource);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onMoveToLocation?.(item.position.lat, item.position.lng, 15);
  };

  const getSourceColorClass = (source) => {
    const c = getSourceColor(source);
    return `${c.light} ${c.text}`;
  };

  // ── 상세 보기 ────────────────────────────────────────────────
  if (selectedItem) {
    const comparison = getNearbyComparison(selectedItem);

    return (
      <div className="h-full bg-white shadow-2xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>
            <h3 className="text-lg font-bold text-gray-900">외부 실거래 상세</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 기본 정보 */}
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getSourceColorClass(selectedItem.source)}`}>
                {getSourceLabel(selectedItem.source)}
              </span>
              <span className="text-xs text-gray-400">{selectedItem.type}</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">{selectedItem.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedItem.address}</p>
            <div className="text-3xl font-bold text-orange-600">{selectedItem.price}</div>
          </div>

          {/* 상세 그리드 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '전용면적', value: selectedItem.area },
              { label: '평당가',   value: selectedItem.pricePerPyeong },
              { label: '층수',     value: selectedItem.floor },
              { label: '거래일',   value: selectedItem.date },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="text-sm font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 가격 변동 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">가격 변동</h5>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">변동률</span>
              <span className={`text-lg font-bold ${selectedItem.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedItem.change > 0 ? '+' : ''}{selectedItem.change}%
              </span>
            </div>
          </div>

          {/* 주변 시세 비교 */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-4 border border-indigo-100">
            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <i className="ri-bar-chart-grouped-line text-indigo-500"></i>
              주변 시세 비교 (반경 1.5km)
            </h5>

            {comparison.nearby.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: '주변 평균', value: `${comparison.avgPrice.toFixed(1)}억`, color: 'text-gray-900' },
                    { label: '주변 최고', value: `${comparison.maxPrice}억`,            color: 'text-red-600' },
                    { label: '주변 최저', value: `${comparison.minPrice}억`,            color: 'text-blue-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-lg p-2.5 text-center border border-gray-100">
                      <div className="text-[10px] text-gray-400 mb-0.5">{s.label}</div>
                      <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 비교 바 */}
                <div className="bg-white rounded-lg p-3 border border-gray-100 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">현재 매물 vs 주변 평균</span>
                    <span className={`text-sm font-bold ${comparison.diffPercent > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {comparison.diffPercent > 0 ? '+' : ''}{comparison.diffPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-200 to-indigo-300 rounded-full" style={{ width: '50%' }}></div>
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full ${comparison.diffPercent > 0 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gradient-to-r from-sky-400 to-blue-400'}`}
                      style={{ width: `${Math.min(95, Math.max(5, 50 + comparison.diffPercent))}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {comparison.diffPercent > 0 ? '평균 대비 높음' : comparison.diffPercent < -1 ? '평균 대비 낮음' : '평균 수준'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                    <span>저가</span>
                    <span>평균 {comparison.avgPrice.toFixed(1)}억</span>
                    <span>고가</span>
                  </div>
                </div>

                {/* 주변 거래 목록 */}
                <div>
                  <div className="text-xs font-bold text-gray-700 mb-2">주변 거래 내역 ({comparison.nearby.length}건)</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {comparison.nearby.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleItemClick(n)}
                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-100 hover:border-indigo-300 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${getSourceColorClass(n.source)}`}>
                              {getSourceLabel(n.source)}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">{n.name}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{n.address}</p>
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          <div className="text-sm font-bold text-gray-900">{n.price}</div>
                          <div className="text-[10px] text-gray-400">{n.pricePerPyeong}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <i className="ri-map-pin-line text-gray-400 text-lg"></i>
                </div>
                <p className="text-xs text-gray-500">반경 1.5km 내 비교 가능한 거래가 없습니다</p>
              </div>
            )}
          </div>

          {/* 데이터 출처 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h5 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <i className="ri-information-line text-orange-500"></i>데이터 출처
            </h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedItem.source === 'molit' && '국토교통부 실거래가 공개시스템에서 제공하는 공식 거래 데이터입니다. 계약일 기준 30일 이내 신고된 거래입니다.'}
              {selectedItem.source === 'reb'   && '한국부동산원에서 제공하는 부동산 통계정보 기반 데이터입니다. 주간/월간 시세 동향을 반영합니다.'}
              {selectedItem.source === 'kab'   && 'KB국민은행 부동산 시세 데이터입니다. 감정평가 및 시장 조사를 기반으로 산출된 시세입니다.'}
              {selectedItem.source === 'court' && '대법원 법원경매정보 시스템에서 제공하는 경매 물건 데이터입니다. 감정가 대비 낙찰가율을 참고하세요.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 메인 리스트 ────────────────────────────────────────────────
  return (
    <div className="h-full bg-white shadow-2xl flex flex-col">
      {/* 헤더 */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-exchange-funds-line text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">외부 실거래가</h2>
            <p className="text-xs text-gray-500">국토부·부동산원·KB·법원 통합 데이터</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* 지도 연동 안내 */}
      <div className="mx-4 mt-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg px-3 py-2 border border-orange-200 flex items-center gap-2 flex-shrink-0">
        <i className="ri-map-pin-line text-orange-500 text-sm"></i>
        <span className="text-[11px] text-orange-700 font-medium">항목 클릭 시 지도가 해당 위치로 이동합니다</span>
      </div>

      {/* 데이터 소스 선택 */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {dataSources.map((src) => (
            <button
              key={src.id}
              onClick={() => setActiveSource(activeSource === src.id ? 'all' : src.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeSource === src.id
                  ? `bg-gradient-to-r ${src.color} text-white border-transparent shadow-lg`
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              <i className={`${src.icon} text-sm shrink-0`}></i>
              <div className="text-left">
                <div>{src.label}</div>
                <div className={`text-[9px] ${activeSource === src.id ? 'text-white/70' : 'text-gray-400'}`}>
                  {src.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">총 {filtered.length}건</span>
          {activeSource !== 'all' && (
            <button onClick={() => setActiveSource('all')} className="text-xs text-orange-600 font-medium cursor-pointer">
              전체 보기
            </button>
          )}
        </div>
      </div>

      {/* 거래 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${getSourceColorClass(item.source)}`}>
                      {getSourceLabel(item.source)}
                    </span>
                    <span className="text-[10px] text-gray-400">{item.type}</span>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-0.5 text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{item.address}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                  <div className={`text-sm font-bold ${item.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-orange-100 transition-colors">
                    <i className="ri-map-pin-line text-[10px] text-gray-400 group-hover:text-orange-500 transition-colors"></i>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="text-base font-bold text-gray-900">{item.price}</div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{item.area}</div>
                  <div className="text-[10px] text-gray-400">{item.pricePerPyeong}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExternalTransactionPanel;

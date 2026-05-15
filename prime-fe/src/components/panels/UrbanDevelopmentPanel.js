import React, { useState } from 'react';
import { urbanDevZones, redevelopZones, rebuildZones } from '../../data/mockUrbanDevelopmentData';

const devTypeMeta = {
  urban: {
    label: '도시개발추진위',
    icon: 'ri-building-line',
    color: 'text-purple-600',
    bgColor: 'from-purple-500 to-purple-600',
  },
  redevelop: {
    label: '재개발추진위',
    icon: 'ri-building-4-line',
    color: 'text-rose-600',
    bgColor: 'from-rose-500 to-rose-600',
  },
  rebuild: {
    label: '재건축추진위',
    icon: 'ri-building-2-line',
    color: 'text-amber-600',
    bgColor: 'from-amber-500 to-amber-600',
  },
};

function UrbanDevelopmentPanel({ onClose, onMoveToLocation }) {
  const [activeType, setActiveType] = useState('urban');
  const [expandedId, setExpandedId] = useState(null);

  const meta = devTypeMeta[activeType];

  const getCurrentZones = () => {
    switch (activeType) {
      case 'urban':    return urbanDevZones;
      case 'redevelop': return redevelopZones;
      case 'rebuild':  return rebuildZones;
      default:         return [];
    }
  };
  const zones = getCurrentZones();

  const getStatusColor = (status) => {
    if (status.includes('추진위')) return 'bg-emerald-100 text-emerald-700';
    if (status.includes('구역계')) return 'bg-amber-100 text-amber-700';
    if (status.includes('협의'))  return 'bg-gray-100 text-gray-600';
    return 'bg-sky-100 text-sky-700';
  };

  const getConsentColor = (rate) => {
    if (rate >= 30) return 'text-emerald-600';
    if (rate >= 20) return 'text-amber-600';
    return 'text-gray-500';
  };

  return (
    <div className="h-full bg-white shadow-2xl flex flex-col">
      {/* 헤더 */}
      <div className={`p-5 border-b border-gray-100 bg-gradient-to-r ${meta.bgColor} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i className={`${meta.icon} text-white text-lg`}></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{meta.label}</h2>
              <p className="text-xs text-white/70">총 {zones.length}개 구역</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-white"></i>
          </button>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          {Object.entries(devTypeMeta).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setActiveType(key); setExpandedId(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeType === key
                  ? `bg-gradient-to-r ${val.bgColor} text-white shadow-md`
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <i className={`${val.icon} text-sm`}></i>
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex-shrink-0">
        <div className="flex items-start gap-2 text-xs text-purple-700">
          <i className="ri-information-line text-sm mt-0.5 shrink-0"></i>
          <div>
            <div className="font-bold mb-0.5">구역계 설정 안내</div>
            <div className="text-purple-600 leading-relaxed">
              지도에서 구역을 그려 개발 가능 여부를 확인하세요. 30% 이상 동의 시 추진위 구성이 가능합니다.
            </div>
          </div>
        </div>
      </div>

      {/* 구역 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => {
                setExpandedId(expandedId === zone.id ? null : zone.id);
                onMoveToLocation?.(zone.position.lat, zone.position.lng, 14);
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${getStatusColor(zone.status)}`}>
                        {zone.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{zone.district}</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{zone.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{zone.description}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className={`text-xs font-bold ${getConsentColor(zone.consentRate)}`}>
                      {zone.consentRate}%
                    </div>
                    <div className="text-[10px] text-gray-400">동의율</div>
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">진행률</span>
                    <span className="text-[10px] font-bold text-purple-600">{zone.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all"
                      style={{ width: `${zone.progress}%` }}
                    />
                  </div>
                </div>

                {/* 동의율 바 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-500">지주 동의율 (목표 30%)</span>
                    <span className={`text-[10px] font-bold ${getConsentColor(zone.consentRate)}`}>
                      {zone.consentRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        zone.consentRate >= 30
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(zone.consentRate, 100)}%` }}
                    />
                    <div className="absolute left-[30%] top-0 bottom-0 w-0.5 bg-red-400"></div>
                  </div>
                  {zone.consentRate >= 30 && (
                    <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <i className="ri-checkbox-circle-fill"></i>
                      추진위 구성 가능
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="ri-shape-line"></i>{zone.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-group-line"></i>{zone.landowners}명
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>{zone.expectedCompletion}
                  </span>
                </div>
              </div>

              {/* 확장 상세 */}
              {expandedId === zone.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-2.5">
                      <div className="text-[10px] text-gray-400">사업면적</div>
                      <div className="text-xs font-bold text-gray-900">{zone.area}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <div className="text-[10px] text-gray-400">지주 수</div>
                      <div className="text-xs font-bold text-gray-900">{zone.landowners}명</div>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <div className="text-[10px] text-gray-400">예상 사업비</div>
                      <div className="text-xs font-bold text-gray-900">{zone.estimatedCost}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <div className="text-[10px] text-gray-400">예상 수익</div>
                      <div className="text-xs font-bold text-emerald-600">{zone.estimatedRevenue}</div>
                    </div>
                  </div>

                  {/* TODO: 지주 동의율 관리 기능 연동 후 활성화 */}
                  <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap opacity-60">
                    <i className="ri-team-line"></i>
                    지주 동의율 관리 (준비 중)
                  </button>

                  <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold py-2.5 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap opacity-60">
                    <i className="ri-pencil-ruler-2-line"></i>
                    지도에서 구역계 설정 (준비 중)
                  </button>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <i className="ri-file-text-line"></i>
                    출처: 국토교통부 도시재생종합정보체계
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-purple-50">
        <div className="text-[10px] text-purple-700 text-center flex items-center justify-center gap-2">
          <i className="ri-lightbulb-line"></i>
          <span>구역을 클릭하여 상세 정보를 확인하세요</span>
        </div>
      </div>
    </div>
  );
}

export default UrbanDevelopmentPanel;

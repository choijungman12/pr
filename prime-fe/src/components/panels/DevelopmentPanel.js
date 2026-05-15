import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  redevelopItems,
  rebuildItems,
  remodelItems,
  moatownItems,
  transportInfra,
  newTownData,
} from '../../data/mockDevelopmentData';
import { getAreaDevelopmentByDistrict } from '../../data/mockAreaDevelopmentData';

const subCategoryMeta = {
  all: { label: '전체 개발정보', icon: 'ri-apps-line', color: 'text-orange-600', bgColor: 'from-orange-500 to-orange-600' },
  redevelop: { label: '재개발', icon: 'ri-building-4-line', color: 'text-rose-600', bgColor: 'from-rose-500 to-rose-600' },
  rebuild: { label: '재건축', icon: 'ri-building-2-line', color: 'text-amber-600', bgColor: 'from-amber-500 to-amber-600' },
  remodel: { label: '리모델링', icon: 'ri-tools-line', color: 'text-teal-600', bgColor: 'from-teal-500 to-teal-600' },
  moatown: { label: '모아타운', icon: 'ri-community-line', color: 'text-emerald-600', bgColor: 'from-emerald-500 to-emerald-600' },
  'land-dev': { label: '택지', icon: 'ri-landscape-line', color: 'text-sky-600', bgColor: 'from-sky-500 to-sky-600' },
  subway: { label: '지하철', icon: 'ri-subway-line', color: 'text-indigo-600', bgColor: 'from-indigo-500 to-indigo-600' },
  road: { label: '도로', icon: 'ri-road-map-line', color: 'text-slate-600', bgColor: 'from-slate-500 to-slate-600' },
};

// 전체 개발 항목 (재개발+재건축+리모델링+모아타운) — 마커와 동일한 데이터 소스
const allDevItems = [...redevelopItems, ...rebuildItems, ...remodelItems, ...moatownItems];

function DevelopmentPanel({ onClose, activeDevSub, onDevSubChange, onTransportClick, onMoveToLocation }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAreaDetail, setSelectedAreaDetail] = useState(null);
  const meta = subCategoryMeta[activeDevSub] || subCategoryMeta.all;

  // 마커 클릭 시 자동 상세 전환
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const prevSideMapRef = useRef(null);

  // type → 서브탭 키 매핑
  const typeToSubTab = {
    redevelopment: 'redevelop',
    reconstruction: 'rebuild',
    remodel: 'remodel',
    moatown: 'moatown',
    subway: 'subway',
    road: 'road',
    newtown: 'land-dev',
    housing: 'land-dev',
  };

  useEffect(() => {
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    const matchId = sideMapData.properties.id;

    // 재개발/재건축/리모델링/모아타운에서 매칭
    const matchedDev = allDevItems.find((item) => item.id === matchId);
    if (matchedDev) {
      const subTab = typeToSubTab[matchedDev.type] || 'redevelop';
      onDevSubChange?.(subTab);
      setExpandedId(matchedDev.id);
      if (matchedDev.district) {
        const areaDetail = getAreaDevelopmentByDistrict(matchedDev.district);
        if (areaDetail) setSelectedAreaDetail(areaDetail);
      }
      return;
    }

    // transportInfra에서 매칭 (지하철/도로)
    const matchedTransport = transportInfra.find((item) => item.id === matchId);
    if (matchedTransport) {
      onDevSubChange?.(matchedTransport.type === 'road' ? 'road' : 'subway');
      setExpandedId(matchedTransport.id);
      return;
    }

    // newTownData에서 매칭 (신도시/택지)
    const matchedTown = newTownData.find((item) => item.id === matchId);
    if (matchedTown) {
      onDevSubChange?.('land-dev');
      setExpandedId(matchedTown.id);
    }
  }, [sideMapData, onDevSubChange]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    if (status.includes('착공') || status.includes('공사')) return 'bg-emerald-100 text-emerald-700';
    if (status.includes('인가') || status.includes('통과')) return 'bg-amber-100 text-amber-700';
    if (status.includes('지정') || status.includes('선정') || status.includes('수립')) return 'bg-gray-100 text-gray-600';
    if (status.includes('심의') || status.includes('설계')) return 'bg-sky-100 text-sky-700';
    if (status.includes('추진')) return 'bg-orange-100 text-orange-700';
    if (status.includes('조성') || status.includes('개통')) return 'bg-teal-100 text-teal-700';
    return 'bg-gray-100 text-gray-600';
  };

  const handleDevItemClick = (item) => {
    // 지도 이동 (항목 자체 position 사용)
    if (item.position) {
      onMoveToLocation?.(item.position.lat, item.position.lng, 15);
    }

    // 해당 구역의 상세 정보 찾기
    const areaDetail = getAreaDevelopmentByDistrict(item.district);
    if (areaDetail) {
      setSelectedAreaDetail(areaDetail);
    } else {
      setExpandedId(expandedId === item.id ? null : item.id);
    }
  };

  const renderDevList = (items, typeLabel) => (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleDevItemClick(item)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.district}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
              </div>
              <div className="text-right ml-3">
                <div className="text-xs font-bold text-red-500">{item.priceImpact}</div>
                <div className="text-[10px] text-gray-400">시세영향</div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">진행률</span>
                <span className="text-[10px] font-bold text-orange-600">{item.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <i className="ri-shape-line"></i>
                {item.area}
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-home-4-line"></i>
                {item.households}세대
              </span>
              <span className="flex items-center gap-1">
                <i className="ri-calendar-line"></i>
                {item.expectedCompletion}
              </span>
            </div>
          </div>

          {/* 확장 상세 */}
          {expandedId === item.id && !getAreaDevelopmentByDistrict(item.district) && (
            <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">사업면적</div>
                  <div className="text-xs font-bold text-gray-900">{item.area}</div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">세대수</div>
                  <div className="text-xs font-bold text-gray-900">{item.households}세대</div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">완공예정</div>
                  <div className="text-xs font-bold text-gray-900">{item.expectedCompletion}</div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">시세영향</div>
                  <div className="text-xs font-bold text-red-500">{item.priceImpact}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <i className="ri-file-text-line"></i>
                출처: 국토교통부 도시재생종합정보체계
              </div>
            </div>
          )}

          {/* 상세 정보 보기 안내 */}
          {getAreaDevelopmentByDistrict(item.district) && (
            <div className="border-t border-gray-100 bg-orange-50 px-4 py-2.5">
              <div className="flex items-center justify-center gap-2 text-xs text-orange-600 font-medium">
                <i className="ri-information-line"></i>
                <span>클릭하여 상세 개발정보 보기</span>
                <i className="ri-arrow-right-s-line"></i>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSubwayList = () => {
    const subwayItems = transportInfra.filter(t => t.type === 'subway');
    return (
      <div className="space-y-3">
        {subwayItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              onTransportClick?.(item);
              onMoveToLocation?.(item.position.lat, item.position.lng, 13);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-subway-line text-white text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  {item.progress !== undefined && (
                    <span className="text-[10px] text-indigo-600 font-bold">{item.progress}%</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                {/* 진행률 바 */}
                {item.progress !== undefined && (
                  <div className="mb-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>
                    {item.expectedCompletion}
                  </span>
                  {item.totalLength && (
                    <span className="flex items-center gap-1">
                      <i className="ri-ruler-line"></i>
                      {item.totalLength}
                    </span>
                  )}
                  {item.budget && (
                    <span className="flex items-center gap-1">
                      <i className="ri-money-dollar-circle-line"></i>
                      {item.budget}
                    </span>
                  )}
                  {item.stations && (
                    <span className="flex items-center gap-1">
                      <i className="ri-train-line"></i>
                      {item.stations}개역
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                  <i className="ri-arrow-right-circle-line"></i>
                  클릭하여 상세 정보 보기
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRoadList = () => {
    const roadItems = transportInfra.filter(t => t.type === 'road');
    return (
      <div className="space-y-3">
        {roadItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              onTransportClick?.(item);
              onMoveToLocation?.(item.position.lat, item.position.lng, 13);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-road-map-line text-white text-lg"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  {item.progress !== undefined && (
                    <span className="text-[10px] text-slate-600 font-bold">{item.progress}%</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                {/* 진행률 바 */}
                {item.progress !== undefined && (
                  <div className="mb-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-[10px] text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="ri-calendar-line"></i>
                    {item.expectedCompletion}
                  </span>
                  {item.totalLength && (
                    <span className="flex items-center gap-1">
                      <i className="ri-ruler-line"></i>
                      {item.totalLength}
                    </span>
                  )}
                  {item.budget && (
                    <span className="flex items-center gap-1">
                      <i className="ri-money-dollar-circle-line"></i>
                      {item.budget}
                    </span>
                  )}
                  {item.lanes && (
                    <span className="flex items-center gap-1">
                      <i className="ri-road-map-line"></i>
                      {item.lanes}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <i className="ri-arrow-right-circle-line"></i>
                  클릭하여 상세 정보 보기
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLandDevList = () => (
    <div className="space-y-3">
      {newTownData.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer"
          onClick={() => {
            if (item.position) onMoveToLocation?.(item.position.lat, item.position.lng, 14);
            setExpandedId(expandedId === item.id ? null : item.id);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="ri-landscape-line text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-gray-400">{item.type === 'newtown' ? '신도시' : '택지'}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{item.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <i className="ri-shape-line"></i>
                  {item.area}
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-home-4-line"></i>
                  {item.households.toLocaleString()}세대
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  {item.expectedCompletion}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAllList = () => {
    // 전체: 모든 카테고리 요약
    const allItems = [
      ...redevelopItems.slice(0, 2).map(i => ({ ...i, typeLabel: '재개발', typeColor: 'bg-rose-100 text-rose-700' })),
      ...rebuildItems.slice(0, 2).map(i => ({ ...i, typeLabel: '재건축', typeColor: 'bg-amber-100 text-amber-700' })),
      ...remodelItems.slice(0, 1).map(i => ({ ...i, typeLabel: '리모델링', typeColor: 'bg-teal-100 text-teal-700' })),
      ...moatownItems.slice(0, 1).map(i => ({ ...i, typeLabel: '모아타운', typeColor: 'bg-emerald-100 text-emerald-700' })),
    ];

    return (
      <div className="space-y-3">
        {allItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => {
              if (item.position) onMoveToLocation?.(item.position.lat, item.position.lng, 15);
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.typeColor}`}>
                    {item.typeLabel}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-gray-400">{item.district}</span>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
              </div>
              <div className="text-right ml-3">
                <div className="text-xs font-bold text-red-500">{item.priceImpact}</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
              </div>
              <div className="text-[10px] text-gray-400 mt-1 text-right">{item.progress}%</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span>{item.area}</span>
              <span>{item.households}세대</span>
              <span>{item.expectedCompletion}</span>
            </div>
          </div>
        ))}

        {/* 교통 인프라 요약 */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <i className="ri-subway-line text-indigo-500"></i>
            교통 인프라
          </h4>
          {transportInfra.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-3 mb-2 hover:border-indigo-300 transition-all cursor-pointer"
              onClick={() => {
                if (item.position) onMoveToLocation?.(item.position.lat, item.position.lng, 13);
                onTransportClick?.(item);
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === 'subway' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  <i className={`${item.type === 'subway' ? 'ri-subway-line text-indigo-600' : 'ri-road-map-line text-slate-600'} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-gray-900">{item.name}</h5>
                  <p className="text-[10px] text-gray-400">{item.expectedCompletion}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 택지 요약 */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
            <i className="ri-landscape-line text-sky-500"></i>
            택지/신도시
          </h4>
          {newTownData.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-3 mb-2 hover:border-sky-300 transition-all cursor-pointer"
              onClick={() => {
                if (item.position) onMoveToLocation?.(item.position.lat, item.position.lng, 14);
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-sky-100">
                  <i className="ri-landscape-line text-sky-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-gray-900">{item.name}</h5>
                  <p className="text-[10px] text-gray-400">{item.households.toLocaleString()}세대 · {item.expectedCompletion}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getContent = () => {
    switch (activeDevSub) {
      case 'redevelop': return renderDevList(redevelopItems, '재개발');
      case 'rebuild': return renderDevList(rebuildItems, '재건축');
      case 'remodel': return renderDevList(remodelItems, '리모델링');
      case 'moatown': return renderDevList(moatownItems, '모아타운');
      case 'subway': return renderSubwayList();
      case 'road': return renderRoadList();
      case 'land-dev': return renderLandDevList();
      default: return renderAllList();
    }
  };

  const getItemCount = () => {
    switch (activeDevSub) {
      case 'redevelop': return redevelopItems.length;
      case 'rebuild': return rebuildItems.length;
      case 'remodel': return remodelItems.length;
      case 'moatown': return moatownItems.length;
      case 'subway': return transportInfra.filter(t => t.type === 'subway').length;
      case 'road': return transportInfra.filter(t => t.type === 'road').length;
      case 'land-dev': return newTownData.length;
      default: return redevelopItems.length + rebuildItems.length + remodelItems.length + moatownItems.length;
    }
  };

  return (
    <>
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
                <p className="text-xs text-white/70">총 {getItemCount()}건의 개발정보</p>
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

        {/* 서브 카테고리 빠른 전환 */}
        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5">
            {Object.entries(subCategoryMeta).map(([key, val]) => (
              <button
                key={key}
                onClick={() => onDevSubChange(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeDevSub === key
                    ? `bg-gradient-to-r ${val.bgColor} text-white shadow-md`
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <i className={`${val.icon} text-xs`}></i>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* 실거래가 연동 안내 */}
        <div className="px-4 py-2.5 bg-orange-50 border-b border-orange-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <i className="ri-information-line"></i>
            <span>지도에서 마커를 클릭하면 <strong>실거래가</strong>와 <strong>개발계획 상세</strong>를 확인할 수 있습니다</span>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {getContent()}
        </div>

        {/* 하단 */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
            <i className="ri-file-text-line"></i>
            출처: 국토교통부 도시재생종합정보체계
          </div>
        </div>
      </div>

      {/* 개발 상세 팝업 */}
      {selectedAreaDetail && (
        <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">{selectedAreaDetail.name}</h3>
            <button
              onClick={() => setSelectedAreaDetail(null)}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer"
            >
              <i className="ri-close-line text-gray-400"></i>
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <p><span className="font-bold">위치:</span> {selectedAreaDetail.district}</p>
            <p><span className="font-bold">상태:</span> {selectedAreaDetail.status}</p>
            {selectedAreaDetail.description && (
              <p><span className="font-bold">설명:</span> {selectedAreaDetail.description}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default DevelopmentPanel;

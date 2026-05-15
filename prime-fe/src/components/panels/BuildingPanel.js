import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { buildingProperties, buildingDevelopments } from '../../data/mockBuildingData';

function BuildingPanel({ onClose, onMoveToLocation }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 마커 클릭 시 자동 상세 전환
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const prevSideMapRef = useRef(null);

  const filteredData = buildingProperties.filter(item =>
    filter === 'all' || item.type === filter
  );

  const stats = {
    total: filteredData.length,
    avgYield: 5.2,
    avgChange: 4.8,
  };

  // 지도 마커 클릭 → 해당 빌딩 상세로 자동 전환
  useEffect(() => {
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    const props = sideMapData.properties;
    const matched = buildingProperties.find((item) => item.id === props.id);
    if (matched) {
      setSelectedProperty(matched);
    }
  }, [sideMapData]);

  // 상세 보기
  if (selectedProperty) {
    return (
      <div className="h-full bg-white shadow-2xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProperty(null)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>
            <h3 className="text-lg font-bold text-gray-900">빌딩 상세</h3>
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
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 border border-emerald-100">
            <h4 className="font-bold text-gray-900 mb-2">{selectedProperty.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedProperty.address}</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-emerald-600">
                {selectedProperty.priceText}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedProperty.type === 'sale' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedProperty.type === 'sale' ? '매매' : '임대'}
              </span>
              <span className="text-sm font-bold text-red-600">
                +{selectedProperty.change}%
              </span>
              {selectedProperty.rentYield && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  수익률 {selectedProperty.rentYield}%
                </span>
              )}
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">연면적</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.areaText}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">대지면적</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.landAreaText}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">층수</div>
              <div className="text-lg font-bold text-gray-900">지상 {selectedProperty.floors}층</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">준공년도</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.builtYear}년</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">용도</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.usage}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">주차</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.parking}대</div>
            </div>
          </div>

          {/* 수익 정보 */}
          {selectedProperty.monthlyIncome && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                수익 정보
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">월 임대수익</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {(selectedProperty.monthlyIncome / 10000).toLocaleString()}만원
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">임대수익률</span>
                  <span className="text-sm font-bold text-orange-600">
                    {selectedProperty.rentYield}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">입주 테넌트</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedProperty.tenants}개사
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 특징 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">특징</h5>
            <div className="flex flex-wrap gap-2">
              {selectedProperty.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* 주변 개발계획 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-building-line text-emerald-500"></i>
              주변 개발계획
            </h5>
            <div className="space-y-2">
              {buildingDevelopments.map((dev) => (
                <div key={dev.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h6 className="text-sm font-bold text-gray-900">{dev.name}</h6>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      dev.impact === '높음' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {dev.impact}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{dev.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{dev.expectedDate}</span>
                    <span>{dev.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 거래 이력 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">가격 변동</h5>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">이전 거래가</span>
              <span className="text-sm font-medium text-gray-900">
                {(selectedProperty.previousPrice / 100000000).toFixed(0)}억원
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">변동률</span>
              <span className="text-sm font-bold text-red-600">
                +{selectedProperty.change}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">평당가</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedProperty.pricePerPyeong}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 목록 보기
  return (
    <div className="h-full bg-white shadow-2xl flex flex-col">
      {/* 헤더 */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-building-4-line text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">빌딩 매물</h2>
            <p className="text-xs text-gray-500">상업용 빌딩 및 수익형 부동산</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* 통계 요약 */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">총 매물</div>
            <div className="text-lg font-bold text-gray-900">{stats.total}건</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">평균 수익률</div>
            <div className="text-lg font-bold text-emerald-600">{stats.avgYield}%</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">평균 변동</div>
            <div className="text-lg font-bold text-orange-600">+{stats.avgChange}%</div>
          </div>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">유형:</span>
          <div className="flex gap-1">
            {[
              { id: 'all', label: '전체' },
              { id: 'sale', label: '매매' },
              { id: 'rent', label: '임대' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filter === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">정렬:</span>
          <div className="flex gap-1">
            {[
              { id: 'recent', label: '최신순' },
              { id: 'price', label: '가격순' },
              { id: 'yield', label: '수익률순' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 매물 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredData.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedProperty(item);
                if (item.position) {
                  onMoveToLocation?.(item.position.lat, item.position.lng, 15);
                }
              }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      item.type === 'sale' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type === 'sale' ? '매매' : '임대'}
                    </span>
                    {item.rentYield && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                        수익률 {item.rentYield}%
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{item.transactionDate}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.address}</p>
                </div>
                <div className="text-sm font-bold text-red-600">
                  +{item.change}%
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">{item.priceText}</div>
                  <div className="text-xs text-gray-500">평당 {item.pricePerPyeong}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.areaText}</div>
                  <div className="text-xs text-gray-500">지상 {item.floors}층</div>
                </div>
              </div>
              {item.monthlyIncome && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">월 임대수익</span>
                    <span className="font-bold text-emerald-600">
                      {(item.monthlyIncome / 10000).toLocaleString()}만원
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {item.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuildingPanel;

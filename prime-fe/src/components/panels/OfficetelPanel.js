import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { officetelProperties, officetelDevelopments } from '../../data/mockOfficetelData';

function OfficetelPanel({ onClose, onMoveToLocation }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedProperty, setSelectedProperty] = useState(null);

  // 마커 클릭 시 자동 상세 전환
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const prevSideMapRef = useRef(null);

  const filteredData = officetelProperties.filter(item =>
    filter === 'all' || item.type === filter
  );

  const stats = {
    total: filteredData.length,
    avgChange: 3.4,
    up: filteredData.filter(d => d.change > 0).length,
    down: filteredData.filter(d => d.change < 0).length,
  };

  // 지도 마커 클릭 → 해당 오피스텔 상세로 자동 전환
  useEffect(() => {
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    const props = sideMapData.properties;
    const matched = officetelProperties.find((item) => item.id === props.id);
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
            <h3 className="text-lg font-bold text-gray-900">오피스텔 상세</h3>
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
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
            <h4 className="font-bold text-gray-900 mb-2">{selectedProperty.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedProperty.address}</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-purple-600">
                {selectedProperty.priceText}
              </span>
              {selectedProperty.type === 'monthly' && (
                <span className="text-lg text-gray-600 mb-1">
                  (보증금 {(selectedProperty.deposit / 10000).toFixed(0)}만원)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                selectedProperty.type === 'sale' ? 'bg-purple-100 text-purple-700' :
                selectedProperty.type === 'rent' ? 'bg-blue-100 text-blue-700' :
                'bg-green-100 text-green-700'
              }`}>
                {selectedProperty.type === 'sale' ? '매매' : selectedProperty.type === 'rent' ? '전세' : '월세'}
              </span>
              <span className={`text-sm font-bold ${selectedProperty.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedProperty.change > 0 ? '+' : ''}{selectedProperty.change}%
              </span>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">전용면적</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.areaText}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">평당가</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.pricePerPyeong}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">층수</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.floor}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">준공년도</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.builtYear}년</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">관리비</div>
              <div className="text-lg font-bold text-gray-900">{(selectedProperty.managementFee / 10000).toFixed(0)}만원</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">주차</div>
              <div className="text-lg font-bold text-gray-900">{selectedProperty.parking ? '가능' : '불가'}</div>
            </div>
          </div>

          {/* 특징 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">특징</h5>
            <div className="flex flex-wrap gap-2">
              {selectedProperty.features.map((feature, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* 옵션 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">포함 옵션</h5>
            <div className="grid grid-cols-2 gap-2">
              {selectedProperty.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <i className="ri-checkbox-circle-fill text-purple-500"></i>
                  {option}
                </div>
              ))}
            </div>
          </div>

          {/* 주변 개발계획 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-building-line text-purple-500"></i>
              주변 개발계획
            </h5>
            <div className="space-y-2">
              {officetelDevelopments.map((dev) => (
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
                {(selectedProperty.previousPrice / 100000000).toFixed(1)}억원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">변동률</span>
              <span className={`text-sm font-bold ${selectedProperty.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedProperty.change > 0 ? '+' : ''}{selectedProperty.change}%
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
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-building-2-line text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">오피스텔 매물</h2>
            <p className="text-xs text-gray-500">실거래가 및 전월세 정보</p>
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
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">총 매물</div>
            <div className="text-lg font-bold text-gray-900">{stats.total}건</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">평균 변동</div>
            <div className="text-lg font-bold text-purple-600">+{stats.avgChange}%</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">상승</div>
            <div className="text-lg font-bold text-red-600">{stats.up}건</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">하락</div>
            <div className="text-lg font-bold text-blue-600">{stats.down}건</div>
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
              { id: 'rent', label: '전세' },
              { id: 'monthly', label: '월세' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filter === item.id
                    ? 'bg-purple-500 text-white'
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
              { id: 'change', label: '변동률순' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  sortBy === item.id
                    ? 'bg-purple-500 text-white'
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
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      item.type === 'sale' ? 'bg-purple-100 text-purple-700' :
                      item.type === 'rent' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.type === 'sale' ? '매매' : item.type === 'rent' ? '전세' : '월세'}
                    </span>
                    <span className="text-xs text-gray-500">{item.transactionDate}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.address}</p>
                </div>
                <div className={`text-sm font-bold ${item.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">{item.priceText}</div>
                  <div className="text-xs text-gray-500">평당 {item.pricePerPyeong}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.areaText}</div>
                  <div className="text-xs text-gray-500">{item.floor}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] font-medium">
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

export default OfficetelPanel;

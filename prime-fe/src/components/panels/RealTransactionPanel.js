import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { realTransactionItems } from '../../data/mockRealTransactionData';

function RealTransactionPanel({ onClose, propertyType, onMoveToLocation }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // 마커 클릭 시 자동 상세 전환
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const prevSideMapRef = useRef(null);

  const getTypeLabel = () => {
    return '아파트';
  };

  // 아파트 매물 필터링
  const aptProperties = realTransactionItems.filter(p =>
    p.typeLabel.includes('아파트') && (filter === 'all' || p.type === filter)
  );

  const mockData = aptProperties.map((prop, idx) => ({
    id: prop.id,
    type: '아파트',
    name: prop.buildingName,
    address: prop.address,
    price: Math.floor(prop.price / 10000),
    area: prop.area,
    pricePerPyeong: prop.pricePerPyeong.replace(/[^0-9]/g, ''),
    floor: prop.floor ? `${prop.floor}층` : '정보없음',
    date: prop.transactionDate,
    change: prop.priceChange || 5.2,
    previousPrice: Math.floor((prop.price * 0.95) / 10000),
    features: [],
    rooms: '3',
    builtYear: prop.builtYear,
    position: prop.position,
  }));

  const stats = {
    total: mockData.length,
    avgChange: 3.5,
    up: mockData.filter(d => d.change > 0).length,
    down: mockData.filter(d => d.change < 0).length,
  };

  // 지도 마커 클릭 → sideMapData 변경 감지 → 해당 아이템 상세로 자동 전환
  useEffect(() => {
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    const props = sideMapData.properties;
    // mockData에서 id로 매칭
    const matched = mockData.find((item) => item.id === props.id);
    if (matched) {
      setSelectedTransaction(matched);
    }
  }, [sideMapData, mockData]);

  // 상세 보기
  if (selectedTransaction) {
    return (
      <div className="h-full bg-white shadow-2xl flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedTransaction(null)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-gray-600"></i>
            </button>
            <h3 className="text-lg font-bold text-gray-900">아파트 상세</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
            <h4 className="font-bold text-gray-900 mb-2">{selectedTransaction.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{selectedTransaction.address}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-orange-600">
                {selectedTransaction.price.toLocaleString()}
              </span>
              <span className="text-lg text-gray-600 mb-1">만원</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">전용면적</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.area}m²</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">평당가</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.pricePerPyeong.toLocaleString()}만</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">층수</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.floor}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">방/욕실</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.rooms}개</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">준공년도</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.builtYear}년</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">거래일</div>
              <div className="text-lg font-bold text-gray-900">{selectedTransaction.date}</div>
            </div>
          </div>

          {/* 특징 */}
          {selectedTransaction.features && selectedTransaction.features.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h5 className="text-sm font-bold text-gray-900 mb-3">특징</h5>
              <div className="flex flex-wrap gap-2">
                {selectedTransaction.features.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 주변 개발계획 */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i className="ri-building-line text-orange-500"></i>
              주변 개발계획
            </h5>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <h6 className="text-sm font-bold text-gray-900">GTX-A 노선 개통</h6>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">높음</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">GTX-A 노선 강남역 개통 예정</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>2024년 12월</span>
                  <span>도보 5분</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1">
                  <h6 className="text-sm font-bold text-gray-900">역삼 재개발구역</h6>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">중간</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">역삼1구역 재개발 사업시행인가</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>2028년</span>
                  <span>300m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">가격 변동</h5>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">이전 거래가</span>
              <span className="text-sm font-medium text-gray-900">
                {selectedTransaction.previousPrice.toLocaleString()}만원
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">변동률</span>
              <span className={`text-sm font-bold ${selectedTransaction.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {selectedTransaction.change > 0 ? '+' : ''}{selectedTransaction.change}%
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-3">주변 동일 단지 거래 비교</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">평균 거래가</span>
                <span className="font-medium text-gray-900">{(selectedTransaction.price * 1.05).toLocaleString()}만원</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">최고가</span>
                <span className="font-medium text-gray-900">{(selectedTransaction.price * 1.2).toLocaleString()}만원</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">최저가</span>
                <span className="font-medium text-gray-900">{(selectedTransaction.price * 0.9).toLocaleString()}만원</span>
              </div>
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
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-building-line text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{getTypeLabel()} 매물</h2>
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
            <div className="text-lg font-bold text-orange-600">+{stats.avgChange}%</div>
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
              { id: 'rent', label: '전월세' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filter === item.id
                    ? 'bg-orange-500 text-white'
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
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 거래 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {mockData.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedTransaction(item);
                if (item.position) {
                  const lat = item.position.lat;
                  const lng = item.position.lng;
                  onMoveToLocation?.(lat, lng, 15);
                }
              }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">{item.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.address}</p>
                </div>
                <div className={`text-sm font-bold ${item.change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">{item.price.toLocaleString()}만원</div>
                  <div className="text-xs text-gray-500">평당 {item.pricePerPyeong.toLocaleString()}만원</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.area}m²</div>
                  <div className="text-xs text-gray-500">{item.floor}</div>
                </div>
              </div>
              {item.features && item.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RealTransactionPanel;

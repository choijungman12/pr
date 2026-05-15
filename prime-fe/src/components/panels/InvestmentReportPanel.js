import { useState } from 'react';

function InvestmentReportPanel({ onClose }) {
  const [selectedProperty, setSelectedProperty] = useState('강남구 대치동 은마아파트');
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  const reportHistory = [
    { id: '1', propertyName: '강남구 대치동 은마아파트', address: '서울 강남구 대치동 942', createdAt: '2024-01-15', score: 87 },
    { id: '2', propertyName: '서초구 반포동 래미안퍼스티지', address: '서울 서초구 반포동 18-3', createdAt: '2024-01-10', score: 92 },
    { id: '3', propertyName: '송파구 잠실동 잠실엘스', address: '서울 송파구 잠실동 29', createdAt: '2024-01-05', score: 85 },
  ];

  const handleDownloadReport = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="h-full bg-white shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-line-chart-line text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI 투자분석 보고서</h2>
            <p className="text-xs text-gray-500">데이터 기반 투자 의사결정 지원</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-3 border-b border-gray-200 flex gap-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <i className="ri-file-chart-line mr-1.5"></i>
          보고서 생성
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <i className="ri-history-line mr-1.5"></i>
          보고서 이력
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'preview' ? (
          <div className="p-6 space-y-6">
            {/* Property Selection */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">분석 대상 선택</label>
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option>강남구 대치동 은마아파트</option>
                <option>서초구 반포동 래미안퍼스티지</option>
                <option>송파구 잠실동 잠실엘스</option>
                <option>강남구 역삼동 삼성래미안</option>
              </select>
            </div>

            {/* Investment Score */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">종합 투자 점수</p>
                  <h3 className="text-4xl font-bold">87점</h3>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i className="ri-trophy-line text-4xl"></i>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <i className="ri-arrow-up-line"></i>
                <span>상위 15% 투자 매력도</span>
              </div>
            </div>

            {/* Price Trend Chart */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-line-chart-line text-orange-500"></i>
                시세 분석 및 AI 가격 예측
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">현재 시세</span>
                  <span className="font-bold text-gray-900">23.5억원</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">1년 후 예측가</span>
                  <span className="font-bold text-green-600">25.8억원 (+9.8%)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">3년 후 예측가</span>
                  <span className="font-bold text-green-600">29.2억원 (+24.3%)</span>
                </div>
                <div className="h-32 bg-gradient-to-t from-orange-50 to-transparent rounded-lg flex items-end justify-around px-4 py-3 mt-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 bg-orange-300 rounded-t" style={{ height: '60%' }}></div>
                    <span className="text-xs text-gray-600">2022</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 bg-orange-400 rounded-t" style={{ height: '75%' }}></div>
                    <span className="text-xs text-gray-600">2023</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 bg-orange-500 rounded-t" style={{ height: '85%' }}></div>
                    <span className="text-xs text-gray-600">2024</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 bg-orange-600 rounded-t" style={{ height: '95%' }}></div>
                    <span className="text-xs text-gray-600">2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROI Analysis */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-money-dollar-circle-line text-orange-500"></i>
                투자 수익률 시뮬레이션
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">매매 수익률 (3년)</span>
                  <span className="text-lg font-bold text-green-600">+24.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">전세 수익률 (연)</span>
                  <span className="text-lg font-bold text-blue-600">+3.2%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">월세 수익률 (연)</span>
                  <span className="text-lg font-bold text-purple-600">+4.8%</span>
                </div>
              </div>
            </div>

            {/* Development Plans */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-building-line text-orange-500"></i>
                주변 개발호재 요약
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <i className="ri-subway-line text-orange-500 text-lg mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">GTX-A 노선 개통 예정</p>
                    <p className="text-xs text-gray-600 mt-1">2025년 상반기 예정 (도보 5분)</p>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">+15%</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <i className="ri-building-2-line text-blue-500 text-lg mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">대치동 재개발 구역 지정</p>
                    <p className="text-xs text-gray-600 mt-1">2026년 착공 예정</p>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">+8%</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <i className="ri-shopping-bag-line text-green-500 text-lg mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">현대백화점 신규 입점</p>
                    <p className="text-xs text-gray-600 mt-1">2024년 하반기 오픈</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600">+3%</span>
                </div>
              </div>
            </div>

            {/* Environment Score */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-map-pin-line text-orange-500"></i>
                주변 환경 분석
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">학군</span>
                    <span className="text-sm font-bold text-gray-900">95점</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">교통</span>
                    <span className="text-sm font-bold text-gray-900">88점</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">상권</span>
                    <span className="text-sm font-bold text-gray-900">82점</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">의료시설</span>
                    <span className="text-sm font-bold text-gray-900">78점</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-shield-check-line text-orange-500"></i>
                리스크 분석
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">시장 유동성</p>
                    <p className="text-xs text-gray-600 mt-1">강남권 핵심 지역으로 거래 활발 (낮은 리스크)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">금리 변동</p>
                    <p className="text-xs text-gray-600 mt-1">금리 인상 시 단기 조정 가능성 (중간 리스크)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">규제 리스크</p>
                    <p className="text-xs text-gray-600 mt-1">조정대상지역 해제 가능성 높음 (낮은 리스크)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadReport}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
            >
              <i className="ri-download-line text-xl"></i>
              PDF 보고서 다운로드
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">생성된 보고서 ({reportHistory.length})</h3>
              <button className="text-xs text-orange-600 hover:text-orange-700 font-medium cursor-pointer whitespace-nowrap">
                전체 삭제
              </button>
            </div>
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{report.propertyName}</h4>
                    <p className="text-xs text-gray-600">{report.address}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg">
                    <i className="ri-star-fill text-orange-500 text-xs"></i>
                    <span className="text-xs font-bold text-orange-600">{report.score}점</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{report.createdAt}</span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-eye-line mr-1"></i>
                      보기
                    </button>
                    <button className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                      <i className="ri-download-line mr-1"></i>
                      다운로드
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">보고서 생성 중...</span>
        </div>
      )}
    </div>
  );
}

export default InvestmentReportPanel;

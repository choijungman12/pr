import React, { useState, useMemo } from 'react';
import { newsData } from '../../data/mockNewsData';

const CATEGORIES = ['전체', '개발', '정책', '시장', '인프라'];
const IMPACTS    = ['전체', '호재', '악재', '중립'];

const IMPACT_MAP = { 호재: 'positive', 악재: 'negative', 중립: 'neutral' };

const getImpactColor  = (impact) => ({ positive: 'text-green-600', negative: 'text-red-600', neutral: 'text-gray-600' }[impact] ?? 'text-gray-600');
const getImpactBadge  = (impact) => ({ positive: 'bg-green-100 text-green-700', negative: 'bg-red-100 text-red-700', neutral: 'bg-gray-100 text-gray-700' }[impact] ?? 'bg-gray-100 text-gray-700');
const getImpactText   = (impact) => ({ positive: '호재', negative: '악재', neutral: '중립' }[impact] ?? '중립');

function NewsPanel({ onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedImpact,   setSelectedImpact]   = useState('전체');
  const [selectedNews,     setSelectedNews]     = useState(null);

  const filteredNews = useMemo(() => {
    let filtered = [...newsData];
    if (selectedCategory !== '전체') filtered = filtered.filter((n) => n.category === selectedCategory);
    if (selectedImpact   !== '전체') filtered = filtered.filter((n) => n.impact === IMPACT_MAP[selectedImpact]);
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCategory, selectedImpact]);

  // ── 뉴스 상세 ────────────────────────────────────────────────
  if (selectedNews) {
    return (
      <div className="h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white flex-shrink-0">
          <button
            onClick={() => setSelectedNews(null)}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="font-medium text-sm">목록으로</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-600"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 이미지 */}
          <div className="relative h-48 bg-gray-100">
            <img
              src={selectedNews.imageUrl}
              alt={selectedNews.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getImpactBadge(selectedNews.impact)}`}>
                {getImpactText(selectedNews.impact)}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                {selectedNews.category}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* 메타 */}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1"><i className="ri-map-pin-line"></i>{selectedNews.district}</span>
              <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>{selectedNews.date}</span>
              <span className="flex items-center gap-1"><i className="ri-newspaper-line"></i>{selectedNews.source}</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedNews.title}</h2>

            {/* 영향도 바 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 shrink-0">영향도</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${selectedNews.impact === 'positive' ? 'bg-green-500' : selectedNews.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`}
                  style={{ width: `${Math.abs(selectedNews.impactScore) * 10}%` }}
                />
              </div>
              <span className={`text-sm font-bold shrink-0 ${getImpactColor(selectedNews.impact)}`}>
                {selectedNews.impactScore > 0 ? '+' : ''}{selectedNews.impactScore}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">{selectedNews.summary}</p>

            {/* 태그 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">관련 태그</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNews.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 관련 매물 */}
            {selectedNews.relatedProperties.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">관련 매물</h3>
                <div className="space-y-2">
                  {selectedNews.relatedProperties.map((propId) => (
                    <button
                      key={propId}
                      className="w-full p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">매물 #{propId}</span>
                        <i className="ri-arrow-right-line text-orange-600"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 뉴스 목록 ────────────────────────────────────────────────
  return (
    <div className="h-full bg-white shadow-2xl flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-newspaper-line text-white text-lg"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">부동산 뉴스</h2>
            <p className="text-xs text-gray-500">개발·정책·시장·인프라 동향</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* 필터 */}
      <div className="p-4 border-b border-gray-200 space-y-3 flex-shrink-0">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">영향도</label>
          <div className="flex gap-2 flex-wrap">
            {IMPACTS.map((impact) => (
              <button
                key={impact}
                onClick={() => setSelectedImpact(impact)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedImpact === impact
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {impact}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 뉴스 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <i className="ri-newspaper-line text-5xl mb-3"></i>
            <p className="text-sm">해당 조건의 뉴스가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNews.map((news) => (
              <button
                key={news.id}
                onClick={() => setSelectedNews(news)}
                className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group text-left"
              >
                {/* 썸네일 */}
                <div className="relative h-28 bg-gray-100">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImpactBadge(news.impact)}`}>
                      {getImpactText(news.impact)}
                    </span>
                  </div>
                </div>
                {/* 내용 */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-xs font-medium">{news.category}</span>
                    <span className="text-xs text-gray-500">{news.district}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{news.date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{news.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">영향도</span>
                      <span className={`text-xs font-bold ${getImpactColor(news.impact)}`}>
                        {news.impactScore > 0 ? '+' : ''}{news.impactScore}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{news.source}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 하단 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>총 {filteredNews.length}개의 뉴스</span>
          <button className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium cursor-pointer">
            <span>더보기</span>
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewsPanel;

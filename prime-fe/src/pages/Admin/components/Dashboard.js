import { useState, useEffect } from 'react';
import { monthlyPropertyStats, categoryStats, weeklyInquiries, } from '../../../data/mockAdminData';
function MonthlyChart() {
    const [tab, setTab] = useState('registered');
    const labelMap = { registered: '매물 등록', views: '조회수', inquiries: '문의 수' };
    const colorMap = { registered: '#f97316', views: '#0ea5e9', inquiries: '#10b981' };
    const values = monthlyPropertyStats.map((d) => d[tab]);
    const maxVal = Math.max(...values);
    return (<div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">월별 추이</h3>
        <div className="flex gap-2">
          {['registered', 'views', 'inquiries'].map((key) => (<button key={key} onClick={() => setTab(key)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${tab === key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {labelMap[key]}
            </button>))}
        </div>
      </div>
      <div className="flex items-end gap-3 h-40">
        {monthlyPropertyStats.map((d, i) => {
            const height = maxVal > 0 ? (d[tab] / maxVal) * 100 : 0;
            return (<div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="w-full rounded-t-md transition-all duration-300" style={{ height: `${height}%`, backgroundColor: colorMap[tab] }}/>
              <span className="text-xs text-gray-500">{d.month}</span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {d[tab].toLocaleString()}
              </div>
            </div>);
        })}
      </div>
    </div>);
}
function CategoryChart() {
    const total = categoryStats.reduce((s, c) => s + c.count, 0);
    let cumulative = 0;
    const segments = categoryStats.map((c) => {
        const start = cumulative;
        cumulative += (c.count / total) * 360;
        return { ...c, start, end: cumulative };
    });
    const describeArc = (start, end) => {
        const r = 60;
        const cx = 80;
        const cy = 80;
        const toRad = (deg) => ((deg - 90) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(toRad(start));
        const y1 = cy + r * Math.sin(toRad(start));
        const x2 = cx + r * Math.cos(toRad(end));
        const y2 = cy + r * Math.sin(toRad(end));
        const large = end - start > 180 ? 1 : 0;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    };
    return (<div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">카테고리별 매물</h3>
      <div className="flex items-center gap-6">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((seg, i) => (<path key={i} d={describeArc(seg.start, seg.end)} fill={seg.color}/>))}
          <circle cx="80" cy="80" r="35" fill="white"/>
          <text x="80" y="76" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">{total}</text>
          <text x="80" y="92" textAnchor="middle" fontSize="10" fill="#9ca3af">전체</text>
        </svg>
        <div className="flex-1 space-y-2">
          {categoryStats.map((c, i) => (<div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}/>
                <span className="text-sm text-gray-700">{c.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(c.count / total) * 100}%`, backgroundColor: c.color }}/>
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">{c.count}</span>
              </div>
            </div>))}
        </div>
      </div>
    </div>);
}
function WeeklyInquiryChart() {
    const maxCount = Math.max(...weeklyInquiries.map((d) => d.count));
    return (<div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">요일별 문의</h3>
      <div className="flex items-end gap-3 h-32">
        {weeklyInquiries.map((d, i) => {
            const height = (d.count / maxCount) * 100;
            const isMax = d.count === maxCount;
            return (<div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-gray-700">{d.count}</span>
              <div className="w-full rounded-t-md" style={{ height: `${height}%`, backgroundColor: isMax ? '#f97316' : '#fed7aa' }}/>
              <span className="text-xs text-gray-500">{d.day}</span>
            </div>);
        })}
      </div>
    </div>);
}
export default function Dashboard({ onTabChange }) {
    const [pendingInquiryCount, setPendingInquiryCount] = useState(0);
    useEffect(() => {
        const loadPendingCount = () => {
            const stored = localStorage.getItem('propertyInquiries');
            if (stored) {
                const inquiries = JSON.parse(stored);
                const pending = inquiries.filter((inq) => inq.status === 'pending').length;
                setPendingInquiryCount(pending);
            }
        };
        loadPendingCount();
        const interval = setInterval(loadPendingCount, 5000);
        return () => clearInterval(interval);
    }, []);
    return (<div>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-500 mt-2">매물 관리 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div onClick={() => onTabChange('properties')} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-100">
                <i className="ri-building-line text-2xl text-orange-600"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                +12%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">248</h3>
            <p className="text-sm text-gray-600">전체 매물</p>
          </div>

          <div onClick={() => onTabChange('posts')} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                <i className="ri-article-line text-2xl text-blue-600"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                +8%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
            <p className="text-sm text-gray-600">게시글</p>
          </div>

          <div onClick={() => onTabChange('members')} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                <i className="ri-user-line text-2xl text-green-600"></i>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                +24%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">1,234</h3>
            <p className="text-sm text-gray-600">회원</p>
          </div>

          <div onClick={() => onTabChange('inquiries')} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-message-3-line text-orange-600 text-2xl"></i>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full whitespace-nowrap">
                미답변 {pendingInquiryCount}건
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">267</h3>
            <p className="text-sm text-gray-600">문의 수</p>
          </div>
        </div>

        {/* 월별 추이 차트 */}
        <MonthlyChart />

        {/* 카테고리 + 요일별 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CategoryChart />
          <WeeklyInquiryChart />
        </div>

        {/* 최근 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">최근 등록 매물</h3>
              <button onClick={() => onTabChange('properties')} className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap">
                전체보기 →
              </button>
            </div>
            <div className="space-y-3">
              {[
            { title: '강남구 역삼동 토지지분', time: '2시간 전', status: '승인완료', statusColor: 'bg-green-100 text-green-700' },
            { title: '서초구 서초동 오피스텔', time: '4시간 전', status: '검토중', statusColor: 'bg-amber-100 text-amber-700' },
            { title: '송파구 잠실동 아파트', time: '6시간 전', status: '승인완료', statusColor: 'bg-green-100 text-green-700' },
            { title: '마포구 상암동 빌딩', time: '1일 전', status: '거래완료', statusColor: 'bg-gray-100 text-gray-600' },
            { title: '용산구 이촌동 토지', time: '1일 전', status: '검토중', statusColor: 'bg-amber-100 text-amber-700' },
        ].map((item, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="ri-building-line text-orange-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.statusColor}`}>{item.status}</span>
                </div>))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">최근 게시글</h3>
              <button onClick={() => onTabChange('posts')} className="text-sm text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap">
                전체보기 →
              </button>
            </div>
            <div className="space-y-3">
              {[
            { title: '강남권 개발 계획 분석', time: '5시간 전', category: '시장분석' },
            { title: '토지지분 투자 주의사항', time: '8시간 전', category: '투자정보' },
            { title: '서울시 도시기본계획 2040', time: '1일 전', category: '개발계획' },
            { title: '1월 부동산 시장 동향', time: '2일 전', category: '시장분석' },
            { title: '신규 매물 등록 안내', time: '2일 전', category: '공지사항' },
        ].map((item, i) => (<div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                      <i className="ri-article-line text-sky-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">{item.category}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>
    </div>);
}

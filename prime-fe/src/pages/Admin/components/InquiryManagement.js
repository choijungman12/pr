import { useState, useEffect } from 'react';
import { useResponsive } from '../../../hooks/useResponsive';
export default function InquiryManagement() {
    const { isMobile } = useResponsive();
    const [inquiries, setInquiries] = useState([]);
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [isSending, setIsSending] = useState(false);
    useEffect(() => {
        loadInquiries();
    }, []);
    useEffect(() => {
        let filtered = [...inquiries];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(inq => inq.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inq => inq.propertyTitle.toLowerCase().includes(query) ||
                inq.name.toLowerCase().includes(query) ||
                inq.phone.includes(query) ||
                inq.id.toLowerCase().includes(query));
        }
        setFilteredInquiries(filtered);
    }, [inquiries, statusFilter, searchQuery]);
    const loadInquiries = () => {
        const stored = localStorage.getItem('propertyInquiries');
        if (stored) {
            const data = JSON.parse(stored);
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInquiries(sortedData);
        }
    };
    const handleInquiryClick = (inquiry) => {
        setSelectedInquiry(inquiry);
        setAnswerText(inquiry.answer || '');
    };
    const handleSendAnswer = () => {
        if (!selectedInquiry || !answerText.trim())
            return;
        setIsSending(true);
        setTimeout(() => {
            const updatedInquiries = inquiries.map(inq => {
                if (inq.id === selectedInquiry.id) {
                    return {
                        ...inq,
                        status: 'answered',
                        answer: answerText,
                        answeredAt: new Date().toISOString()
                    };
                }
                return inq;
            });
            localStorage.setItem('propertyInquiries', JSON.stringify(updatedInquiries));
            setInquiries(updatedInquiries);
            setIsSending(false);
            setSelectedInquiry(null);
            setAnswerText('');
        }, 800);
    };
    const handleDeleteInquiry = (id) => {
        if (!window.confirm('이 문의를 삭제하시겠습니까?'))
            return;
        const updatedInquiries = inquiries.filter(inq => inq.id !== id);
        localStorage.setItem('propertyInquiries', JSON.stringify(updatedInquiries));
        setInquiries(updatedInquiries);
        if (selectedInquiry?.id === id) {
            setSelectedInquiry(null);
        }
    };
    const pendingCount = inquiries.filter(inq => inq.status === 'pending').length;
    return (<div className="flex h-full">
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedInquiry && !isMobile ? 'mr-[480px]' : ''}`}>
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
              <p className="text-sm text-gray-500 mt-1">총 {inquiries.length}건의 문의 · 미답변 {pendingCount}건</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex gap-2 overflow-x-auto">
              <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'all'
            ? 'bg-teal-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                전체 ({inquiries.length})
              </button>
              <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'pending'
            ? 'bg-teal-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                미답변 ({pendingCount})
              </button>
              <button onClick={() => setStatusFilter('answered')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === 'answered'
            ? 'bg-teal-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                답변완료 ({inquiries.filter(inq => inq.status === 'answered').length})
              </button>
            </div>

            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" placeholder="문의번호, 매물명, 문의자명, 연락처로 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          {filteredInquiries.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-gray-400">
              <i className="ri-inbox-line text-6xl mb-4"></i>
              <p className="text-lg font-medium">문의 내역이 없습니다</p>
            </div>) : (<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">문의번호</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">매물명</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">문의자</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">연락처</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">문의일시</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (<tr key={inquiry.id} onClick={() => handleInquiryClick(inquiry)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedInquiry?.id === inquiry.id ? 'bg-teal-50' : ''}`}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">
                        {inquiry.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {inquiry.propertyTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{inquiry.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inquiry.phone}</td>
                      <td className="px-6 py-4">
                        {inquiry.status === 'pending' ? (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <i className="ri-time-line mr-1"></i>
                            미답변
                          </span>) : (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <i className="ri-check-line mr-1"></i>
                            답변완료
                          </span>)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inquiry.createdAt).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInquiry(inquiry.id);
                }} className="text-red-600 hover:text-red-800 transition-colors">
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
              </div>
            </div>)}
        </div>
      </div>

      {selectedInquiry && (<div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-slide-in-right">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-message-3-line text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">문의 상세</h2>
                <p className="text-xs text-teal-100">#{selectedInquiry.id.slice(0, 8)}</p>
              </div>
            </div>
            <button onClick={() => setSelectedInquiry(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <i className="ri-close-line text-white text-xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">매물 정보</span>
                {selectedInquiry.status === 'pending' ? (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <i className="ri-time-line mr-1"></i>
                    미답변
                  </span>) : (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="ri-check-line mr-1"></i>
                    답변완료
                  </span>)}
              </div>
              <p className="text-base font-bold text-gray-900">{selectedInquiry.propertyTitle}</p>
              <p className="text-xs text-gray-500">
                문의일시: {new Date(selectedInquiry.createdAt).toLocaleString('ko-KR')}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">문의자 정보</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <i className="ri-user-line text-gray-400"></i>
                  <span className="text-sm text-gray-600">이름:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedInquiry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-phone-line text-gray-400"></i>
                  <span className="text-sm text-gray-600">연락처:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedInquiry.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">문의 내용</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>

            {selectedInquiry.status === 'answered' && selectedInquiry.answer && (<div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">답변 내용</h3>
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.answer}
                  </p>
                  <p className="text-xs text-teal-600 mt-3">
                    답변일시: {selectedInquiry.answeredAt && new Date(selectedInquiry.answeredAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>)}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {selectedInquiry.status === 'answered' ? '답변 수정' : '답변 작성'}
              </h3>
              <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="답변 내용을 입력하세요..." className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"/>
              <p className="text-xs text-gray-500">{answerText.length} / 1000자</p>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 md:p-6">
            <button onClick={handleSendAnswer} disabled={!answerText.trim() || isSending} className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap">
              {isSending ? (<>
                  <i className="ri-loader-4-line animate-spin"></i>
                  전송 중...
                </>) : (<>
                  <i className="ri-send-plane-fill"></i>
                  답변 전송
                </>)}
            </button>
          </div>
        </div>)}
    </div>);
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({
  activeMenu,
  onMenuChange,
  isMobile,
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const [pendingInquiryCount, setPendingInquiryCount] = useState(0);
  const [pendingVerifyCount, setPendingVerifyCount] = useState(0);

  useEffect(() => {
    const loadCounts = () => {
      const inquiries = localStorage.getItem('propertyInquiries');
      if (inquiries) {
        const parsed = JSON.parse(inquiries);
        setPendingInquiryCount(parsed.filter((inq) => inq.status === 'pending').length);
      } else {
        setPendingInquiryCount(0);
      }

      const pending = localStorage.getItem('pendingProperties');
      if (pending) {
        const parsed = JSON.parse(pending);
        setPendingVerifyCount(parsed.filter((item) => item.status === 'pending').length);
      } else {
        setPendingVerifyCount(4);
      }
    };

    loadCounts();
    const interval = setInterval(loadCounts, 3000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: 'ri-dashboard-line', label: '대시보드' },
    { id: 'properties', icon: 'ri-building-line', label: '매물 관리' },
    { id: 'verification', icon: 'ri-shield-check-line', label: '매물 검증', badge: pendingVerifyCount },
    { id: 'inquiries', icon: 'ri-message-3-line', label: '문의 관리', badge: pendingInquiryCount },
    { id: 'posts', icon: 'ri-article-line', label: '게시글 관리' },
    { id: 'members', icon: 'ri-user-line', label: '회원 관리' },
  ];

  const containerClass = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : 'w-64 bg-white border-r border-gray-200 flex flex-col';

  return (
    <div className={containerClass} style={{ minWidth: isMobile ? undefined : '256px' }}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <i className="ri-admin-line text-xl text-white"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">관리자</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
              aria-label="관리자 메뉴 닫기"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onMenuChange(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? item.id === 'verification'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-teal-50 text-teal-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <i className={`${item.icon} text-xl`}></i>
                    <span className="font-medium text-sm">{item.label}</span>
                  </span>
                  {item.badge > 0 && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                        item.id === 'verification'
                          ? 'bg-orange-500 text-white animate-pulse'
                          : 'bg-orange-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            navigate('/');
            if (isMobile) {
              onClose();
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
        >
          <i className="ri-home-line text-xl"></i>
          <span className="font-medium text-sm">메인으로</span>
        </button>
      </div>
    </div>
  );
}

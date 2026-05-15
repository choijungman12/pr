import { useEffect, useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import Dashboard from "./components/Dashboard";
import PropertyManagement from "./components/PropertyManagement";
import PostEditor from "./components/PostEditor";
import PropertyVerification from "./components/PropertyVerification";
import InquiryManagement from "./components/InquiryManagement";
import MemberManagement from "./components/MemberManagement";
import { useResponsive } from "../../hooks/useResponsive";

export default function AdminPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const handleMenuChange = (menuId) => {
    setActiveMenu(menuId);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex bg-gray-50 h-screen overflow-hidden">
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {isMobile && (
          <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700"
              aria-label="관리자 메뉴 열기"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
          </div>
        )}

        {activeMenu === "verification" ? (
          <div className="flex-1 min-h-0">
            <PropertyVerification />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeMenu === "dashboard" && (
              <Dashboard onTabChange={handleMenuChange} />
            )}
            {activeMenu === "properties" && <PropertyManagement />}
            {activeMenu === "inquiries" && <InquiryManagement />}
            {activeMenu === "posts" && <PostEditor />}
            {activeMenu === "members" && <MemberManagement />}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCategory, setActiveDevSub } from "../../redux/mapState";
import { logout } from "../../redux/authState";
import CurrencySelector from "../CurrencySelector/CurrencySelector";
import { useResponsive } from "../../hooks/useResponsive";
import { logoutUser } from "../../utils/auth/authApi";
import {
  clearStoredAuthUser,
  getUserDisplayName,
  getUserInitial,
  isAdminUser,
} from "../../utils/auth/authStorage";

const categories = [
  { id: "land", label: "토지", icon: "ri-landscape-line" },
  { id: "apt", label: "아파트", icon: "ri-building-line" },
  { id: "officetel", label: "오피스텔", icon: "ri-building-2-line" },
  { id: "building", label: "빌딩", icon: "ri-building-4-line" },
  { id: "auction", label: "경공매", icon: "ri-auction-line" },
  { id: "development", label: "개발", icon: "ri-road-map-line" },
  { id: "ai", label: "AI매물", icon: "ri-robot-2-line" },
  { id: "analysis", label: "투자분석", icon: "ri-line-chart-line" },
];

const devSubCategories = [
  {
    id: "all",
    label: "전체",
    icon: "ri-apps-line",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: "redevelop",
    label: "재개발",
    icon: "ri-building-4-line",
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "rebuild",
    label: "재건축",
    icon: "ri-building-2-line",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "remodel",
    label: "리모델링",
    icon: "ri-tools-line",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "moatown",
    label: "모아타운",
    icon: "ri-community-line",
    color: "from-green-500 to-green-600",
  },
  {
    id: "land-dev",
    label: "택지",
    icon: "ri-landscape-line",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    id: "subway",
    label: "지하철",
    icon: "ri-subway-line",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: "road",
    label: "도로",
    icon: "ri-road-map-line",
    color: "from-indigo-500 to-indigo-600",
  },
];

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile, isTablet } = useResponsive();

  const activeCategory = useSelector((state) => state.map.activeCategory);
  const activeDevSub = useSelector((state) => state.map.activeDevSub);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const authUser = useSelector((state) => state.auth.user);

  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef(null);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setProfileOpen(false);

    try {
      await logoutUser();
      clearStoredAuthUser();
      dispatch(logout());
      navigate("/");
    } catch (error) {
      window.alert(error.message || "로그아웃에 실패했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdminNavigate = () => {
    setProfileOpen(false);
    navigate("/admin");
  };

  const handleCategoryChange = (categoryId) => {
    dispatch(setActiveCategory(categoryId));
    setCategoryDropdownOpen(false);
  };

  const handleDevSubChange = (subId) => {
    dispatch(setActiveDevSub(subId));
  };

  const activeCat = categories.find((c) => c.id === activeCategory) || categories[0];
  const displayName = getUserDisplayName(authUser);
  const profileInitial = getUserInitial(authUser);
  const canAccessAdmin = isAdminUser(authUser);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 md:px-6 py-2 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-4 h-10 md:h-12">
          {/* 로고 */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <i className="ri-building-4-fill text-lg md:text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold text-gray-900">
                {isMobile ? "PRIME" : "프라임지분거래소"}
              </h1>
              {!isMobile && (
                <p className="text-xs text-gray-500">Prime Share Exchange</p>
              )}
            </div>
          </div>

          {/* 우측: 통화 선택 + 로그인 / 프로필 */}
          <div className="flex items-center gap-2 md:gap-3">
            <CurrencySelector variant={isMobile ? "compact" : "default"} />

            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors cursor-pointer whitespace-nowrap max-w-[180px]"
                >
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {profileInitial}
                  </div>
                  <span className="truncate">{displayName}</span>
                  <i
                    className={`ri-arrow-down-s-line text-gray-400 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </button>

                {/* 드롭다운 메뉴 */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {profileInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{authUser?.email}</p>
                      </div>
                    </div>

                    <div className="py-1">
                      {canAccessAdmin && (
                        <>
                          <button
                            onClick={handleAdminNavigate}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <i className="ri-admin-line text-gray-400 text-base"></i>
                            관리자페이지
                          </button>
                          <div className="h-px bg-gray-100 mx-3"></div>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <i className="ri-logout-box-r-line text-base"></i>
                        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="px-3 md:px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer whitespace-nowrap"
                onClick={handleLogin}
              >
                로그인
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 네비게이션 */}
        {isMobile ? (
          /* 모바일: 현재 카테고리 표시 + 드롭다운 */
          <div className="relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <i className={`${activeCat.icon} text-orange-600`}></i>
                <span className="text-orange-600 font-semibold">{activeCat.label}</span>
              </div>
              <i className={`ri-arrow-down-s-line text-gray-400 transition-transform duration-200 ${
                categoryDropdownOpen ? 'rotate-180' : ''
              }`}></i>
            </button>

            {categoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <i className={`${cat.icon} text-lg`}></i>
                    <span>{cat.label}</span>
                    {activeCategory === cat.id && (
                      <i className="ri-check-line ml-auto text-orange-600"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 태블릿 & 데스크톱: 수평 탭 */
          <nav className={`flex items-center gap-1 bg-gray-100 rounded-xl p-1 ${
            isTablet ? 'overflow-x-auto scrollbar-hide' : ''
          }`}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-white text-orange-600 shadow-md"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <i className={cat.icon}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* 개발 서브카테고리 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          activeCategory === "development"
            ? "max-h-20 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 md:px-6 pb-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto scrollbar-hide">
            {devSubCategories.map((sub) => (
              <button
                key={sub.id}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                  activeDevSub === sub.id
                    ? `bg-gradient-to-r ${sub.color} text-white border-transparent shadow-lg`
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
                }`}
                onClick={() => handleDevSubChange(sub.id)}
              >
                <i className={sub.icon}></i>
                <span>{sub.label}</span>
                {activeDevSub === sub.id && sub.id !== "all" && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

// src/components/LeftSideBar/LeftSideBar.js
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetSearchStatus, searchAddress } from "../../redux/mapState";
import { getAnalytics, logEvent } from "firebase/analytics";


const MOBILE_BREAKPOINT = 480;
const THIRTY_DAYS = 2592000000;

const menuItems = {
  home: [
    {
      title: "전문 서비스",
      items: [
        { iconClass: "ri-building-line", text: "분양" },
        { iconClass: "ri-exchange-funds-line", text: "자산관리" },
        { iconClass: "ri-ruler-line", text: "건축설계" },
        { iconClass: "ri-money-dollar-circle-line", text: "감정평가" },
        { iconClass: "ri-file-list-3-line", text: "등기/법무" },
        { iconClass: "ri-newspaper-line", text: "부동산세무" },
      ],
    },
  ],
  listings: [
    {
      title: "매물 관리",
      items: [
        { iconClass: "ri-home-4-line", text: "매물 등록" },
        { iconClass: "ri-landscape-line", text: "단필지 거래" },
        { iconClass: "ri-exchange-funds-line", text: "지분 거래" },
        { iconClass: "ri-building-2-line", text: "중개사 거래" },
        { iconClass: "ri-road-map-line", text: "직거래" },
      ],
    },
  ],
  posts: [
    {
      title: "포스트 관리",
      items: [
        { iconClass: "ri-newspaper-line", text: "새 포스트 작성" },
        { iconClass: "ri-line-chart-line", text: "AI 리포트" },
        { iconClass: "ri-shape-line", text: "블로그 연동" },
      ],
    },
  ],
};

const LeftSideBar = () => {
  const dispatch = useDispatch();
  const analytics = getAnalytics();
  const searchStatus = useSelector((state) => state.map.searchStatus);
  const searchFeedbackMessage = useSelector(
    (state) => state.map.searchFeedbackMessage
  );

  const [activeMenu, setActiveMenu] = useState("home");
  const [isMobile, setIsMobile] = useState(false);
  const [submenuToggle, setSubmenuToggle] = useState(false); // true: 보임, false: 숨김

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchItem, setSearchItem] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // 화면 리사이즈 체크
  useEffect(() => {
    const checkMobile = () => {
      const mediaQuery = window.matchMedia(
        `(max-width: ${MOBILE_BREAKPOINT}px)`
      );
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      // 데스크톱으로 변경되면 submenu 항상 보이게
      if (!mobile) {
        setSubmenuToggle(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 최근 검색 불러오기
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const filtered = parsed.filter((i) => now - i.timestamp < THIRTY_DAYS);
      setRecentSearches(filtered);
      localStorage.setItem("recentSearches", JSON.stringify(filtered));
    }
  }, []);

  const addRecentSearch = useCallback(
    (keyword) => {
      const dedup = recentSearches.filter((i) => i.keyword !== keyword);
      const updated = [{ keyword, timestamp: Date.now() }, ...dedup].slice(
        0,
        10
      );
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    },
    [recentSearches]
  );

  const clearSearchFeedback = useCallback(() => {
    if (searchStatus === "failed" || searchFeedbackMessage) {
      dispatch(resetSearchStatus());
    }
  }, [dispatch, searchFeedbackMessage, searchStatus]);

  const handleComplete = useCallback(
    async (keyword) => {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword || searchStatus === "loading") return;

      logEvent(analytics, "left_side_bar_address_search_result_btn", {
        content_type: "Button",
        content_id: "left_side_bar_address_search_result",
        content: trimmedKeyword,
      });

      const resultAction = await dispatch(searchAddress(trimmedKeyword));

      if (searchAddress.fulfilled.match(resultAction)) {
        addRecentSearch(trimmedKeyword);
        setIsSearchOpen(false);
        setSearchItem("");
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        return;
      }

      setIsSearchOpen(true);
      setSearchItem(trimmedKeyword);
      searchInputRef.current?.focus();
    },
    [addRecentSearch, analytics, dispatch, searchStatus]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && searchItem.trim()) {
      handleComplete(searchItem.trim());
    }
  };

  const handleClearAll = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  const handleRemoveItem = (item) => {
    const updated = recentSearches.filter((i) => i.keyword !== item.keyword);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuKey) => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const isCurrentlyMobile = mediaQuery.matches;

    if (activeMenu === menuKey && isCurrentlyMobile) {
      setSubmenuToggle((prev) => !prev);
    } else {
      // 다른 메뉴 클릭 또는 데스크톱 → 메뉴 변경하고 submenu 보이게
      setActiveMenu(menuKey);
      setSubmenuToggle(true);
    }
  };

  return (
    <div
      className={`w-[350px] h-[calc(100vh-60px)] bg-white flex flex-shrink-0 border-r border-gray-200 ${
        isMobile && !submenuToggle ? "hidden" : ""
      }`}
    >
      {/* 메인 메뉴 */}
      <div
        className={`w-[90px] h-full p-2 flex flex-col gap-3 ${
          isMobile && !submenuToggle ? "hidden" : ""
        }`}
      >
        {[
          { key: "home", iconClass: "ri-home-4-line", label: "홈" },
          { key: "listings", iconClass: "ri-auction-line", label: "매물" },
          { key: "posts", iconClass: "ri-building-line", label: "포스트" },
        ].map(({ key, iconClass, label }) => (
          <div key={key} onClick={() => handleMenuClick(key)}>
            <div
              className={`w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-transparent bg-white shadow-md cursor-pointer transition-all hover:scale-105 hover:shadow-xl hover:border-orange-200 ${
                activeMenu === key ? "border-orange-500 bg-orange-50" : ""
              }`}
            >
              <i className={`${iconClass} text-2xl ${activeMenu === key ? "text-orange-600" : "text-gray-400"}`}></i>
              <span className={`text-xs font-medium text-center leading-tight ${activeMenu === key ? "text-orange-600 font-semibold" : "text-gray-400"}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 컨텐츠(검색 + 서브메뉴) */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          isMobile && !submenuToggle ? "hidden" : ""
        }`}
      >
        {/* 검색창 */}
        <div className="relative py-4 border-b border-gray-200">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="지번을 입력해주세요."
              value={searchItem}
              className="w-full h-12 px-5 border border-gray-100 rounded-2xl text-sm bg-white shadow-lg transition-all placeholder-gray-300 focus:outline-none focus:border-orange-500 focus:shadow-2xl focus:ring-2 focus:ring-orange-500/10"
              onFocus={() => {
                clearSearchFeedback();
                setIsSearchOpen(true);
              }}
              onBlur={() => !isHovered && setIsSearchOpen(false)}
              onChange={(e) => {
                clearSearchFeedback();
                setSearchItem(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
            <i
              className={`ri-search-line absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                searchStatus === "loading"
                  ? "opacity-20 cursor-not-allowed"
                  : "opacity-40 cursor-pointer"
              }`}
              onClick={() => handleComplete(searchItem)}
            ></i>
          </div>
          {searchStatus === "failed" && searchFeedbackMessage && (
            <p className="px-5 pt-2 text-xs font-medium text-red-500">
              {searchFeedbackMessage}
            </p>
          )}
          {isSearchOpen && (
            <div
              className="absolute top-[60%] left-0 w-full py-4 z-[100]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl">
                <div className="w-full flex flex-col gap-2.5">
                  <div className="flex flex-col gap-2.5 py-4">
                    <div className="flex justify-between px-3">
                      <span>최근검색</span>
                      <button
                        className="text-red-500 text-sm font-bold cursor-pointer"
                        onClick={handleClearAll}
                      >
                        전체 삭제
                      </button>
                    </div>
                    <ul className="search_list">
                      {recentSearches.length ? (
                        recentSearches.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between items-center px-3 py-1 text-sm cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => handleComplete(item.keyword)}
                          >
                            <span>{item.keyword}</span>
                            <button
                              className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(item);
                              }}
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="flex justify-between items-center px-3 py-1 text-sm cursor-pointer transition-colors hover:bg-gray-50">최근 검색어가 없습니다.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 서브메뉴 */}
        <div className="flex-1 py-1 overflow-y-auto">
          {menuItems[activeMenu].map((section, si) => (
            <div key={si} className="py-2">
              <div className="px-4 py-2.5 pb-5 text-lg font-semibold text-gray-900">{section.title}</div>
              {section.items.map((it, ii) => (
                <div
                  key={ii}
                  className="flex items-center px-8 py-3.5 cursor-pointer transition-all rounded-md hover:bg-gray-50"
                  onClick={() =>
                    logEvent(analytics, "left_side_bar_submenu_item_btn", {
                      content_type: "Button",
                      content_id: "left_side_bar_submenu_item",
                      content: [section.title, it.text],
                    })
                  }
                >
                  <i className={`${it.iconClass} mr-3 text-lg text-gray-500`}></i>
                  <span className="text-sm text-gray-900 font-medium">{it.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;

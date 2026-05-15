import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedLocation,
  resetSearchStatus,
  searchAddress,
} from "../../redux/mapState";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useResponsive } from "../../hooks/useResponsive";

const THIRTY_DAYS = 2592000000;

function SearchBar({ mobileSearchOpen, setMobileSearchOpen }) {
  const dispatch = useDispatch();
  const { isMobile } = useResponsive();
  const searchStatus = useSelector((state) => state.map.searchStatus);
  const searchFeedbackMessage = useSelector(
    (state) => state.map.searchFeedbackMessage
  );
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        // Filter out searches older than 30 days
        const filtered = parsed.filter(
          (item) => item.timestamp && now - item.timestamp < THIRTY_DAYS
        );
        setRecentSearches(filtered);
        localStorage.setItem("recentSearches", JSON.stringify(filtered));
      } catch (error) {
        console.error("Failed to parse recent searches:", error);
      }
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logAnalyticsEvent = useCallback((action, label) => {
    try {
      const analytics = getAnalytics();
      logEvent(analytics, action, { search_term: label });
    } catch (error) {
      console.error("Analytics logging failed:", error);
    }
  }, []);

  const addRecentSearch = useCallback((searchTerm, fixedAddress = "") => {
    const nextQuery = (fixedAddress || searchTerm || "").trim();
    if (!nextQuery) return;

    const newSearch = {
      query: nextQuery,
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.query !== nextQuery);
      const updated = [newSearch, ...filtered].slice(0, 10);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearchFeedback = useCallback(() => {
    if (searchStatus === "failed" || searchFeedbackMessage) {
      dispatch(resetSearchStatus());
    }
  }, [dispatch, searchFeedbackMessage, searchStatus]);

  const executeSearch = useCallback(
    async (rawQuery, analyticsAction = "search") => {
      const query = rawQuery.trim();
      if (!query || searchStatus === "loading") return;

      const resultAction = await dispatch(searchAddress(query));
      logAnalyticsEvent(analyticsAction, query);

      if (searchAddress.fulfilled.match(resultAction)) {
        const fixedAddress = resultAction.payload?.address?.trim() || query;
        addRecentSearch(query, fixedAddress);
        setInputValue(fixedAddress);
        setSelectedAddress(fixedAddress);
        setShowDropdown(false);
        setMobileSearchOpen(false);
        return;
      }

      setShowDropdown(false);
      if (!isMobile) {
        searchInputRef.current?.focus();
      }
    },
    [
      addRecentSearch,
      dispatch,
      isMobile,
      logAnalyticsEvent,
      searchStatus,
      setMobileSearchOpen,
    ]
  );

  const handleSearch = useCallback(() => {
    void executeSearch(inputValue);
  }, [executeSearch, inputValue]);

  const handleRecentSearchClick = useCallback(
    (searchTerm) => {
      setInputValue(searchTerm);
      void executeSearch(searchTerm, "recent_search_click");
    },
    [executeSearch]
  );

  const handleDeleteRecent = useCallback((searchTerm, e) => {
    e.stopPropagation();
    const filtered = recentSearches.filter((item) => item.query !== searchTerm);
    setRecentSearches(filtered);
    localStorage.setItem("recentSearches", JSON.stringify(filtered));
  }, [recentSearches]);

  const handleClearAll = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    setShowDropdown(false);
  }, []);

  const handleInputKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleInputFocus = () => {
    clearSearchFeedback();
    if (recentSearches.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputChange = useCallback(
    (e) => {
      clearSearchFeedback();
      const nextValue = e.target.value;
      setInputValue(nextValue);
      if (selectedAddress && nextValue.trim() !== selectedAddress) {
        setSelectedAddress("");
        dispatch(clearSelectedLocation());
      }
    },
    [clearSearchFeedback, dispatch, selectedAddress]
  );

  const handleInputClear = useCallback(() => {
    clearSearchFeedback();
    setInputValue("");
    setSelectedAddress("");
    setShowDropdown(false);
    dispatch(clearSelectedLocation());
  }, [clearSearchFeedback, dispatch]);

  const handleSelectedAddressClear = useCallback(() => {
    clearSearchFeedback();
    setInputValue("");
    setSelectedAddress("");
    setShowDropdown(false);
    dispatch(clearSelectedLocation());
    if (!isMobile) {
      searchInputRef.current?.focus();
    }
  }, [clearSearchFeedback, dispatch, isMobile]);

  const selectedAddressCard = selectedAddress ? (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
      <div className="min-w-0 flex items-start gap-2">
        <i className="ri-map-pin-fill text-orange-500 text-base mt-0.5"></i>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-orange-500">선택 주소</p>
          <p className="text-sm font-medium text-orange-700 truncate">
            {selectedAddress}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSelectedAddressClear}
        className="w-8 h-8 flex items-center justify-center rounded-full text-orange-400 hover:bg-white/70 hover:text-orange-600 transition-colors shrink-0"
        aria-label="선택 주소 지우기"
      >
        <i className="ri-close-line text-lg"></i>
      </button>
    </div>
  ) : null;

  // 모바일: FAB에서 트리거되는 풀스크린 검색 모달
  if (isMobile) {
    if (!mobileSearchOpen) return null;

    return (
          <div className="fixed inset-0 z-50 bg-white flex flex-col slide-in-up">
            {/* 헤더 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => {
                  clearSearchFeedback();
                  setMobileSearchOpen(false);
                  setShowDropdown(false);
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
              >
                <i className="ri-arrow-left-line text-xl text-gray-600"></i>
              </button>
              <div className="flex-1">
                <div
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 transition-colors ${
                    searchStatus === "failed"
                      ? "bg-red-50 ring-1 ring-red-100"
                      : "bg-gray-50"
                  }`}
                >
                  <i className="ri-search-line text-lg text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="지번을 입력해주세요"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={handleInputFocus}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    autoFocus
                  />
                  {inputValue && (
                    <button onClick={handleInputClear} className="p-1">
                      <i className="ri-close-circle-fill text-gray-300 text-lg"></i>
                    </button>
                  )}
                </div>
                {searchStatus === "failed" && searchFeedbackMessage && (
                  <p className="mt-2 px-1 text-xs font-medium text-red-500">
                    {searchFeedbackMessage}
                  </p>
                )}
                {selectedAddressCard}
              </div>
              <button
                onClick={handleSearch}
                disabled={searchStatus === "loading"}
                className="px-4 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {searchStatus === "loading" ? "검색 중..." : "검색"}
              </button>
            </div>

            {/* 최근 검색 목록 */}
            <div className="flex-1 overflow-y-auto">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-gray-500">최근 검색</span>
                    <button
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      onClick={handleClearAll}
                    >
                      전체 삭제
                    </button>
                  </div>
                  <ul>
                    {recentSearches.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRecentSearchClick(item.query)}
                      >
                        <div className="flex items-center gap-3">
                          <i className="ri-time-line text-gray-300"></i>
                          <span className="text-sm text-gray-700">{item.query}</span>
                        </div>
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          onClick={(e) => handleDeleteRecent(item.query, e)}
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentSearches.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <i className="ri-search-line text-4xl mb-3"></i>
                  <p className="text-sm">지번을 검색해보세요</p>
                </div>
              )}
            </div>
          </div>
    );
  }

  // 태블릿 & 데스크톱: 기존 플로팅 검색바
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-[600px] px-4 md:px-0 md:w-[400px] lg:w-[600px]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex items-center gap-3 px-5 py-4">
        <div className="flex items-center gap-2 flex-1">
          <i className="ri-search-line text-xl text-gray-400"></i>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="지번을 입력해주세요"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        <button
          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-orange-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSearch}
          disabled={searchStatus === "loading"}
        >
          {searchStatus === "loading" ? "검색 중..." : "검색"}
        </button>
      </div>

      {searchStatus === "failed" && searchFeedbackMessage && (
        <p className="mt-2 px-4 text-sm font-medium text-red-500">
          {searchFeedbackMessage}
        </p>
      )}

      {selectedAddressCard}

      {/* Recent searches dropdown */}
      {showDropdown && recentSearches.length > 0 && (
        <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden" ref={dropdownRef}>
          <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">최근 검색</div>
          <ul className="max-h-60 overflow-y-auto">
            {recentSearches.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 cursor-pointer transition-colors"
                onClick={() => handleRecentSearchClick(item.query)}
              >
                <span className="text-sm text-gray-700">
                  {item.query}
                </span>
                <button
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  onClick={(e) => handleDeleteRecent(item.query, e)}
                  title="삭제"
                >
                  <i className="ri-close-line"></i>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <button
              className="text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
              onClick={handleClearAll}
            >
              전체 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;

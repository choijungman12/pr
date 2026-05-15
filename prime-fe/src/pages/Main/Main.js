import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  closePanel,
  setActiveDevSub,
  setPendingMapMove,
  openPanel,
  toggleAreaCalculationMode,
  clearAreaCalculationPoints,
} from "../../redux/mapState";
import { login, logout } from "../../redux/authState";
import { useResponsive } from "../../hooks/useResponsive";
import Header from "../../components/Header/Header";
import SearchBar from "../../components/SearchBar/SearchBar";
import MapTypeControl from "../../components/MapTypeControl/MapTypeControl";
import RightSideToolbar from "../../components/RightSideToolbar/RightSideToolbar";
import NaverMapDefault from "../../components/NaverMap/NaverMapDefault";
import { getParcelsByPolygon } from "../../data/parcelData";
// ── 카테고리 패널 (헤더 탭) ──────────────────────────────────────
import RealTransactionPanel     from "../../components/panels/RealTransactionPanel";
import OfficetelPanel           from "../../components/panels/OfficetelPanel";
import BuildingPanel            from "../../components/panels/BuildingPanel";
import AuctionPanel             from "../../components/panels/AuctionPanel";
import DevelopmentPanel         from "../../components/panels/DevelopmentPanel";
import AIChatPanel              from "../../components/panels/AIChatPanel";
import InvestmentReportPanel    from "../../components/panels/InvestmentReportPanel";
import LandTransactionPanel     from "../../components/panels/LandTransactionPanel";
// ── 툴바 전용 패널 (우측 버튼) ──────────────────────────────────
import UrbanDevelopmentPanel    from "../../components/panels/UrbanDevelopmentPanel";
import ExternalTransactionPanel from "../../components/panels/ExternalTransactionPanel";
import NewsPanel                from "../../components/panels/NewsPanel";
import ZoneDrawingPanel         from "../../components/panels/ZoneDrawingPanel";
import RequirementCheckPanel    from "../../components/panels/RequirementCheckPanel";
import ConsentManagementPanel   from "../../components/panels/ConsentManagementPanel";
import {
  clearStoredAuthUser,
  saveStoredAuthUser,
} from "../../utils/auth/authStorage";
import { fetchCurrentUser } from "../../utils/auth/authApi";

const MARKER_CATEGORIES = ['land', 'apt', 'officetel', 'building', 'auction', 'development'];

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile, isTablet } = useResponsive();

  const activeCategory = useSelector((state) => state.map.activeCategory);
  const activeDevSub = useSelector((state) => state.map.activeDevSub);
  const panelOpen = useSelector((state) => state.map.panelOpen);
  const panelType = useSelector((state) => state.map.panelType);
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const isAreaCalculationMode = useSelector(
    (state) => state.map.isAreaCalculationMode
  );

  const [, setSidebar] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [zoneDrawingMode, setZoneDrawingMode] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState([]);
  const [zoneParcels, setZoneParcels] = useState([]);
  const [showZonePanel, setShowZonePanel] = useState(false);
  const [showRequirementPanel, setShowRequirementPanel] = useState(false);
  const [showConsentPanel, setShowConsentPanel] = useState(false);
  const [consentDevelopmentType] = useState("urbanDevelopment");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.get("status") !== "success") {
      return;
    }

    let isActive = true;

    const syncSocialLoginUser = async () => {
      try {
        const user = await fetchCurrentUser();

        if (!isActive) {
          return;
        }

        saveStoredAuthUser(user);
        dispatch(login(user));

        searchParams.delete("status");
        navigate(
          {
            pathname: "/",
            search: searchParams.toString() ? `?${searchParams.toString()}` : "",
          },
          { replace: true }
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        clearStoredAuthUser();
        dispatch(logout());
        navigate("/login?status=fail", { replace: true });
      }
    };

    syncSocialLoginUser();

    return () => {
      isActive = false;
    };
  }, [dispatch, location.search, navigate]);

  // 마커 클릭 시 패널이 닫혀 있으면 자동으로 열기 (모든 카테고리)
  const prevSideMapRef = useRef(null);
  useEffect(() => {
    if (!MARKER_CATEGORIES.includes(activeCategory)) return;
    if (!sideMapData?.properties) return;
    if (prevSideMapRef.current === sideMapData) return;
    prevSideMapRef.current = sideMapData;

    if (!panelOpen) {
      dispatch(openPanel(activeCategory));
    }
  }, [sideMapData, activeCategory, panelOpen, dispatch]);

  const handleClosePanel = () => {
    dispatch(closePanel());
    // 닫기 후 동일 마커 재클릭 시 패널이 다시 열리도록 ref 초기화
    prevSideMapRef.current = null;
  };

  const handleMoveToLocation = (lat, lng, zoom) => {
    dispatch(setPendingMapMove({ lat, lng, zoom }));
  };

  const clearZonePanels = useCallback(() => {
    setShowZonePanel(false);
    setShowRequirementPanel(false);
    setShowConsentPanel(false);
  }, []);

  const resetZoneState = useCallback(() => {
    setDrawnPolygon([]);
    setZoneParcels([]);
    clearZonePanels();
  }, [clearZonePanels]);

  const handleZoneDrawingToggle = useCallback(
    (enabled) => {
      if (isMobile) return;

      if (enabled) {
        dispatch(closePanel());
        setZoneDrawingMode(true);
        resetZoneState();
        dispatch(clearAreaCalculationPoints());
        if (!isAreaCalculationMode) {
          dispatch(toggleAreaCalculationMode());
        }
      } else {
        setZoneDrawingMode(false);
        if (isAreaCalculationMode) {
          dispatch(toggleAreaCalculationMode());
        }
        resetZoneState();
      }
    },
    [dispatch, isAreaCalculationMode, isMobile, resetZoneState]
  );

  const handleZonePolygonComplete = useCallback(
    (polygonPoints) => {
      if (isMobile) return;
      if (!zoneDrawingMode) return;
      if (!Array.isArray(polygonPoints) || polygonPoints.length < 3) return;

      const polygon = polygonPoints.map((point) => ({
        lat: point.lat,
        lng: point.lng,
      }));

      setDrawnPolygon(polygon);
      setZoneParcels(getParcelsByPolygon(polygon));
      setShowZonePanel(true);
      setShowRequirementPanel(true);
      setShowConsentPanel(true);
      setZoneDrawingMode(false);

      if (isAreaCalculationMode) {
        dispatch(toggleAreaCalculationMode());
      }
    },
    [dispatch, isAreaCalculationMode, isMobile, zoneDrawingMode]
  );

  const handleResetZone = useCallback(() => {
    resetZoneState();
    setZoneDrawingMode(true);
    dispatch(clearAreaCalculationPoints());
    if (!isAreaCalculationMode) {
      dispatch(toggleAreaCalculationMode());
    }
  }, [dispatch, isAreaCalculationMode, resetZoneState]);

  const handleAreaMeasureToggle = useCallback(() => {
    if (zoneDrawingMode) {
      setZoneDrawingMode(false);
      resetZoneState();
      dispatch(clearAreaCalculationPoints());
      if (!isAreaCalculationMode) {
        dispatch(toggleAreaCalculationMode());
      }
      return;
    }

    if (isAreaCalculationMode) {
      dispatch(toggleAreaCalculationMode());
      return;
    }

    dispatch(clearAreaCalculationPoints());
    dispatch(toggleAreaCalculationMode());
  }, [dispatch, isAreaCalculationMode, zoneDrawingMode, resetZoneState]);

  // 패널 컨텐츠 렌더링
  const renderPanelContent = () => (
    <>
      {/* ── 헤더 카테고리 패널 ── */}
      {panelType === 'land' && (
        <LandTransactionPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'apt' && (
        <RealTransactionPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'officetel' && (
        <OfficetelPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'building' && (
        <BuildingPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'auction' && (
        <AuctionPanel
          onClose={handleClosePanel}
          onMoveToLocation={handleMoveToLocation}
          selectedAuction={selectedAuction}
          onSelectAuction={setSelectedAuction}
        />
      )}
      {panelType === 'development' && (
        <DevelopmentPanel
          onClose={handleClosePanel}
          onMoveToLocation={handleMoveToLocation}
          activeDevSub={activeDevSub}
          onDevSubChange={(sub) => dispatch(setActiveDevSub(sub))}
        />
      )}
      {panelType === 'ai' && (
        <AIChatPanel onClose={handleClosePanel} />
      )}
      {panelType === 'analysis' && (
        <InvestmentReportPanel onClose={handleClosePanel} />
      )}

      {/* ── 툴바 전용 패널 ── */}
      {panelType === 'urban-dev' && (
        <UrbanDevelopmentPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'ext-transaction' && (
        <ExternalTransactionPanel onClose={handleClosePanel} onMoveToLocation={handleMoveToLocation} />
      )}
      {panelType === 'news' && (
        <NewsPanel onClose={handleClosePanel} />
      )}
    </>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Header />
      <div className="relative flex-1 w-full overflow-hidden">
        <div className="relative w-full h-full bg-white flex flex-col">
          <div className="flex-1 w-full h-full relative overflow-hidden">
            {/* 플로팅 검색바 (지도 위 상단 중앙) */}
            <SearchBar mobileSearchOpen={mobileSearchOpen} setMobileSearchOpen={setMobileSearchOpen} />

            {/* 좌측 지도 타입 컨트롤 (일반/위성/지적도) */}
            <MapTypeControl />

            {/* 네이버맵 */}
            <NaverMapDefault
              setSidebar={setSidebar}
              onZonePolygonComplete={handleZonePolygonComplete}
              zoneDrawingMode={zoneDrawingMode}
              zoneResultPolygon={drawnPolygon}
            />

            {/* 우측 세로 도구 버튼 (prime LeftToolbar) */}
            <RightSideToolbar
              onSearchClick={() => setMobileSearchOpen(true)}
              onZoneDrawingToggle={handleZoneDrawingToggle}
              zoneDrawingMode={zoneDrawingMode}
              onAreaMeasureToggle={handleAreaMeasureToggle}
              areaMeasureMode={isAreaCalculationMode && !zoneDrawingMode}
            />

            {/* 구역계 설정 기능은 웹 전용 */}
            {!isMobile && (
              <>
                {showZonePanel && (
                  <ZoneDrawingPanel
                    parcels={zoneParcels}
                    onClose={() => setShowZonePanel(false)}
                    onReset={handleResetZone}
                  />
                )}

                {showRequirementPanel && (
                  <RequirementCheckPanel
                    onClose={() => setShowRequirementPanel(false)}
                  />
                )}

                {showConsentPanel && (
                  <ConsentManagementPanel
                    onClose={() => setShowConsentPanel(false)}
                    developmentType={consentDevelopmentType}
                  />
                )}
              </>
            )}

            {/* 패널 (카테고리 탭 + 우측 툴바 버튼 공용) */}
            {panelOpen && (
              isMobile ? (
                /* 모바일: 뷰포트 전체 오버레이 패널 */
                <div className="fixed inset-0 z-40 bg-white slide-in-up">
                  {renderPanelContent()}
                </div>
              ) : (
                /* 태블릿 & 데스크톱: 사이드 패널 */
                <>
                  <div className="absolute inset-0 bg-black/20 z-30" onClick={handleClosePanel} />
                  <div className={`absolute top-0 bottom-0 z-40 slide-in-right ${
                    isTablet
                      ? 'right-[56px] w-1/2 max-w-[420px]'
                      : 'right-[68px] w-[420px]'
                  }`}>
                    {renderPanelContent()}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;

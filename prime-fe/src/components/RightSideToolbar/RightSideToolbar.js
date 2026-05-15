import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveCategory, // 헤더 탭과 연결된 버튼 → 헤더도 함께 활성화
  openPanel,         // 헤더 탭이 없는 툴바 전용 버튼
  closePanel,
  toggleAreaCalculationMode,
  toggleUnit,
} from "../../redux/mapState";
import { useResponsive } from "../../hooks/useResponsive";

// ── 헤더 탭과 1:1 대응되는 버튼 ────────────────────────────────
const TOOL_TO_CATEGORY = {
  transaction: "apt",
  auction:     "auction",
  land:        "land",
  "dev-plan":  "development",
};

// ── 헤더 탭이 없는 툴바 전용 패널 ──────────────────────────────
const TOOL_TO_PANEL_ONLY = {
  "urban-dev":       "urban-dev",
  "ext-transaction": "ext-transaction",
  news:              "news",
};

// ── 데스크톱/태블릿 전체 도구 (기존 그대로) ──────────────────────
const desktopTools = [
  { id: "transaction",       icon: "ri-home-4-line",         label: "아파트매물",   color: "hover:text-orange-600"  },
  { id: "auction",           icon: "ri-auction-line",        label: "경공매",       color: "hover:text-red-600"     },
  { id: "land",              icon: "ri-landscape-line",      label: "토지",         color: "hover:text-green-600"   },
  { id: "urban-dev",         icon: "ri-building-line",       label: "도시개발추진", color: "hover:text-purple-600"  },
  { id: "ext-transaction",   icon: "ri-exchange-funds-line", label: "외부실거래",   color: "hover:text-rose-600"    },
  { id: "dev-plan",          icon: "ri-road-map-line",       label: "개발계획",     color: "hover:text-amber-600"   },
  { id: "news",              icon: "ri-newspaper-line",      label: "뉴스",         color: "hover:text-sky-600"     },
  { id: "zone-drawing",      icon: "ri-shape-line",          label: "구역계설정",   color: "hover:text-violet-600"  },
  { id: "area",              icon: "ri-shape-line",          label: "면적측정",     color: "hover:text-teal-600"    },
  { id: "unit-toggle",       icon: "ri-exchange-line",       label: "평↔m²",        color: "hover:text-teal-600"    },
];

// ── 모바일 FAB 전용 도구 ────────────────────────────────────────
const mobileFabTools = [
  { id: "search",            icon: "ri-search-line",         label: "검색"       },
  { id: "ext-transaction",   icon: "ri-exchange-funds-line", label: "외부실거래" },
  { id: "news",              icon: "ri-newspaper-line",      label: "뉴스"       },
  { id: "unit-toggle",       icon: "ri-exchange-line",       label: "평↔m²"      },
  { id: "area",              icon: "ri-shape-line",          label: "면적측정"   },
];

function RightSideToolbar({
  onSearchClick,
  onZoneDrawingToggle,
  zoneDrawingMode = false,
  onAreaMeasureToggle,
  areaMeasureMode = false,
}) {
  const dispatch = useDispatch();
  const { isMobile, isTablet } = useResponsive();
  const { panelOpen, panelType, isAreaCalculationMode } = useSelector(
    (state) => state.map
  );
  const [fabExpanded, setFabExpanded] = useState(false);
  const resolvedAreaMeasureMode =
    areaMeasureMode || (isAreaCalculationMode && !zoneDrawingMode);

  // ── 데스크톱/태블릿용 클릭 핸들러 (기존 그대로) ────────────────
  const handleToolClick = (id) => {
    if (id === "area") {
      if (onAreaMeasureToggle) {
        onAreaMeasureToggle();
      } else {
        dispatch(toggleAreaCalculationMode());
      }
      return;
    }
    if (id === "unit-toggle") {
      dispatch(toggleUnit());
      return;
    }
    if (id === "zone-drawing") {
      onZoneDrawingToggle?.(!zoneDrawingMode);
      return;
    }
    if (zoneDrawingMode) {
      onZoneDrawingToggle?.(false);
    }
    if (TOOL_TO_CATEGORY[id]) {
      const cat = TOOL_TO_CATEGORY[id];
      if (panelOpen && panelType === cat) {
        dispatch(closePanel());
      } else {
        dispatch(setActiveCategory(cat));
      }
      return;
    }

    if (TOOL_TO_PANEL_ONLY[id]) {
      const type = TOOL_TO_PANEL_ONLY[id];
      if (panelOpen && panelType === type) {
        dispatch(closePanel());
      } else {
        dispatch(openPanel(type));
      }
    }
  };

  // ── 모바일 FAB용 클릭 핸들러 ──────────────────────────────────
  const handleFabToolClick = (id) => {
    if (id === "search") {
      onSearchClick?.();
      setFabExpanded(false);
      return;
    }
    if (id === "unit-toggle") {
      dispatch(toggleUnit());
      setFabExpanded(false);
      return;
    }
    if (id === "area") {
      if (onAreaMeasureToggle) {
        onAreaMeasureToggle();
      } else {
        dispatch(toggleAreaCalculationMode());
      }
      setFabExpanded(false);
      return;
    }

    if (TOOL_TO_PANEL_ONLY[id]) {
      const type = TOOL_TO_PANEL_ONLY[id];
      if (panelOpen && panelType === type) {
        dispatch(closePanel());
      } else {
        dispatch(openPanel(type));
      }
      setFabExpanded(false);
    }
  };

  const isToolActive = (id) => {
    if (id === "unit-toggle") return false;
    if (id === "search")      return false;
    if (id === "area") return resolvedAreaMeasureMode;
    if (id === "zone-drawing") return zoneDrawingMode;
    const cat  = TOOL_TO_CATEGORY[id];
    const type = TOOL_TO_PANEL_ONLY[id];
    const target = cat ?? type;
    return !!target && panelOpen && panelType === target;
  };

  // ── 모바일: FAB ───────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {fabExpanded && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setFabExpanded(false)}
          />
        )}

        {fabExpanded && (
          <div className="fixed right-4 bottom-[5.5rem] z-30 flex flex-col gap-2 items-end">
            {mobileFabTools.map((tool, index) => {
              const active = isToolActive(tool.id);
              return (
                <button
                  key={tool.id}
                  className={`flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl shadow-lg border transition-all ${
                    active ? 'border-orange-500 bg-orange-50' : 'border-gray-100'
                  }`}
                  style={{
                    animation: `slideInRight 0.2s ${index * 0.05}s both`,
                  }}
                  onClick={() => handleFabToolClick(tool.id)}
                >
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    active ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    {tool.label}
                  </span>
                  <i className={`${tool.icon} text-lg ${
                    active ? 'text-orange-600' : 'text-gray-500'
                  }`}></i>
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setFabExpanded((prev) => !prev)}
          className={`fixed right-4 bottom-6 z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
            fabExpanded
              ? 'bg-gray-700 rotate-45'
              : 'bg-gradient-to-r from-orange-500 to-orange-600'
          }`}
        >
          <i className={`${fabExpanded ? 'ri-add-line' : 'ri-tools-line'} text-2xl text-white`}></i>
        </button>
      </>
    );
  }

  // ── 태블릿 & 데스크톱: 기존 세로 레이아웃 (변경 없음) ─────────
  const buttonSize = isTablet ? 'w-12 h-12' : 'w-16 h-16';
  const iconSize = isTablet ? 'text-xl' : 'text-2xl';
  const labelSize = isTablet ? 'text-[9px]' : 'text-[10px]';

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
      {desktopTools.map((tool) => {
        const active = isToolActive(tool.id);
        return (
          <button
            key={tool.id}
            className={`${buttonSize} bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 transition-all hover:scale-110 hover:shadow-xl border-2 cursor-pointer group ${
              tool.color
            } ${
              active
                ? "border-orange-500 bg-orange-50"
                : "border-transparent hover:border-orange-200"
            }`}
            onClick={() => handleToolClick(tool.id)}
            title={tool.label}
          >
            <i
              className={`${tool.icon} ${iconSize} transition-transform group-hover:scale-110 ${
                active ? "text-orange-600" : "text-gray-600"
              }`}
            ></i>
            <span
              className={`${labelSize} font-medium leading-tight text-center ${
                active ? "text-orange-600" : "text-gray-600"
              }`}
            >
              {tool.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default RightSideToolbar;

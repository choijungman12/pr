/**
 * 카테고리별 마커 생성 유틸리티
 * 각 탭(아파트, 오피스텔, 빌딩, 경매, 개발)별 목데이터 마커를 생성
 * 토지(land)는 기존 API 파이프라인을 그대로 사용
 */
import { realTransactionItems } from "../../data/mockRealTransactionData";
import { officetelProperties } from "../../data/mockOfficetelData";
import { buildingProperties } from "../../data/mockBuildingData";
import { auctionItems, publicSaleItems } from "../../data/mockAuctionData";
import {
  redevelopItems,
  rebuildItems,
  remodelItems,
  moatownItems,
  transportInfra,
  newTownData,
} from "../../data/mockDevelopmentData";

// ─── 카테고리별 마커 데이터 소스 ────────────────────────

/** 아파트 탭: realTransactionItems에서 type === 'apt' 만 추출 */
export function getAptMarkerData() {
  return realTransactionItems
    .filter((item) => item.type === "apt")
    .map((item) => ({
      id: item.id,
      position: item.position,
      label: item.buildingName || item.address.split(" ").slice(2).join(" "),
      subLabel: item.priceText,
      detail: item.areaPyeong,
      raw: item,
    }));
}

/** 오피스텔 탭 */
export function getOfficetelMarkerData() {
  return officetelProperties.map((item) => ({
    id: item.id,
    position: item.position,
    label: item.name,
    subLabel: item.priceText,
    detail: item.areaText,
    raw: item,
  }));
}

/** 빌딩 탭 */
export function getBuildingMarkerData() {
  return buildingProperties.map((item) => ({
    id: item.id,
    position: item.position,
    label: item.name,
    subLabel: item.priceText,
    detail: item.usage || item.areaText,
    raw: item,
  }));
}

/** 경매 탭 */
export function getAuctionMarkerData() {
  const items = [
    ...(auctionItems || []).map((item) => ({
      id: item.id,
      position: item.position,
      label: item.typeLabel + " " + (item.caseNumber || ""),
      subLabel: item.minimumBidPriceText || item.appraisalPriceText,
      detail: item.status === "proceeding" ? "진행중" : item.status === "scheduled" ? "예정" : item.status,
      markerType: "auction",
      raw: item,
    })),
    ...(publicSaleItems || []).map((item) => ({
      id: item.id,
      position: item.position,
      label: item.name || item.typeLabel,
      subLabel: item.priceText || "",
      detail: item.status || "",
      markerType: "publicSale",
      raw: item,
    })),
  ];
  return items.filter((i) => i.position);
}

/**
 * 목데이터 type → 서브탭 키 매핑
 * developmentZones: 'redevelopment' → redevelop, 'reconstruction' → rebuild
 * transportInfra:  'subway' → subway, 'road' → road
 * newTownData:     'newtown'/'housing' → land-dev
 */
/**
 * 목데이터 type → 서브탭 키 매핑
 */
const DEV_TYPE_TO_SUB = {
  redevelopment: "redevelop",
  reconstruction: "rebuild",
  remodel: "remodel",
  moatown: "moatown",
  subway: "subway",
  road: "road",
  newtown: "land-dev",
  housing: "land-dev",
};

/**
 * 개발 탭 — 모든 서브탭 데이터 통합
 * redevelopItems + rebuildItems + remodelItems + moatownItems + transportInfra + newTownData
 */
export function getDevelopmentMarkerData() {
  const mapItem = (item) => ({
    id: item.id,
    position: item.position,
    label: item.name,
    subLabel: item.status,
    detail: item.expectedCompletion || "",
    markerType: DEV_TYPE_TO_SUB[item.type] || "redevelop",
    raw: item,
  });

  return [
    ...(redevelopItems || []).map(mapItem),
    ...(rebuildItems || []).map(mapItem),
    ...(remodelItems || []).map(mapItem),
    ...(moatownItems || []).map(mapItem),
    ...(transportInfra || []).map(mapItem),
    ...(newTownData || []).map((item) => ({
      ...mapItem(item),
      markerType: "land-dev",
    })),
  ].filter((i) => i.position);
}

// ─── 카테고리별 마커 HTML 생성 ────────────────────────

const CATEGORY_STYLES = {
  apt: {
    bgColor: "#3B82F6",     // blue-500
    borderColor: "#2563EB", // blue-600
    icon: "🏢",
  },
  officetel: {
    bgColor: "#8B5CF6",     // violet-500
    borderColor: "#7C3AED", // violet-600
    icon: "🏬",
  },
  building: {
    bgColor: "#F59E0B",     // amber-500
    borderColor: "#D97706", // amber-600
    icon: "🏗️",
  },
  auction: {
    bgColor: "#EF4444",     // red-500
    borderColor: "#DC2626", // red-600
    icon: "⚖️",
  },
  development: {
    bgColor: "#10B981",     // emerald-500
    borderColor: "#059669", // emerald-600
    icon: "📋",
  },
};

// 개발 서브탭별 스타일 (subCategoryMeta 색상과 동일하게 매핑)
const DEV_SUB_STYLES = {
  redevelop: {
    bgColor: "#F43F5E",     // rose-500   (재개발)
    borderColor: "#E11D48",
    icon: "🏗️",
  },
  rebuild: {
    bgColor: "#F59E0B",     // amber-500  (재건축)
    borderColor: "#D97706",
    icon: "🏗️",
  },
  remodel: {
    bgColor: "#14B8A6",     // teal-500   (리모델링)
    borderColor: "#0D9488",
    icon: "🔧",
  },
  moatown: {
    bgColor: "#10B981",     // emerald-500 (모아타운)
    borderColor: "#059669",
    icon: "🏘️",
  },
  "land-dev": {
    bgColor: "#0EA5E9",     // sky-500    (택지/신도시)
    borderColor: "#0284C7",
    icon: "🏘️",
  },
  subway: {
    bgColor: "#6366F1",     // indigo-500 (지하철)
    borderColor: "#4F46E5",
    icon: "🚇",
  },
  road: {
    bgColor: "#64748B",     // slate-500  (도로)
    borderColor: "#475569",
    icon: "🛣️",
  },
};

function createMarkerContent(category, data) {
  // 개발 탭은 서브타입(zone/subway/road/newtown)별 색상 적용
  const style = (category === "development" && data.markerType && DEV_SUB_STYLES[data.markerType])
    ? DEV_SUB_STYLES[data.markerType]
    : (CATEGORY_STYLES[category] || CATEGORY_STYLES.apt);
  return `
    <div style="
      position: relative;
      display: inline-block;
      transform: translate(-50%, calc(-100% - 6px));
    ">
      <div style="
        position: relative;
        min-width: 60px;
        max-width: 120px;
        background: ${style.bgColor};
        border: 2px solid ${style.borderColor};
        border-radius: 10px;
        padding: 4px 8px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.15s;
      ">
        <div style="font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.label}</div>
        <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 1px;">${data.subLabel}</div>
        ${data.detail ? `<div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 1px;">${data.detail}</div>` : ""}
        <div style="
          position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 6px solid ${style.bgColor};
        "></div>
      </div>
    </div>
  `;
}

// ─── 메인 생성 함수 ────────────────────────

/**
 * 카테고리에 해당하는 마커들을 일괄 생성하여 반환
 * @param {Object} map - naver.maps.Map 인스턴스
 * @param {string} category - 'apt' | 'officetel' | 'building' | 'auction' | 'development'
 * @param {Function} onClick - (markerData) => void
 * @returns {Array<{id: string, marker: naver.maps.Marker, data: Object}>}
 */
export function createCategoryMarkers(map, category, onClick) {
  let items = [];
  switch (category) {
    case "apt":
      items = getAptMarkerData();
      break;
    case "officetel":
      items = getOfficetelMarkerData();
      break;
    case "building":
      items = getBuildingMarkerData();
      break;
    case "auction":
      items = getAuctionMarkerData();
      break;
    case "development":
      items = getDevelopmentMarkerData();
      break;
    default:
      return [];
  }

  return items.map((data) => {
    const content = createMarkerContent(category, data);
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(data.position.lat, data.position.lng),
      map: map,
      icon: {
        content: content,
        // content 내부 transform 기준을 쓰므로 anchor는 원점으로 둔다.
        anchor: new window.naver.maps.Point(0, 0),
      },
      zIndex: 5,
    });

    if (onClick) {
      window.naver.maps.Event.addListener(marker, "click", () => {
        onClick(data);
      });
    }

    return { id: data.id, marker, data };
  });
}

/**
 * 카테고리 마커 배열을 모두 제거
 * @param {Array} markers - createCategoryMarkers가 반환한 배열
 */
export function clearCategoryMarkers(markers) {
  if (!markers || !Array.isArray(markers)) return;
  markers.forEach((item) => {
    if (item.marker) {
      item.marker.setMap(null);
    }
  });
}

/**
 * 개발 탭 서브탭 필터링: activeDevSub에 따라 마커 visible/hidden 토글
 * @param {Array} markers - createCategoryMarkers가 반환한 개발 마커 배열
 * @param {string} activeDevSub - 'all' | 'redevelop' | 'rebuild' | 'remodel' | 'moatown' | 'land-dev' | 'subway' | 'road'
 */
export function filterDevelopmentMarkers(markers, activeDevSub) {
  if (!markers || !Array.isArray(markers)) return;
  markers.forEach((item) => {
    if (!item.marker) return;
    if (activeDevSub === "all") {
      item.marker.setVisible(true);
    } else {
      const match = item.data?.markerType === activeDevSub;
      item.marker.setVisible(match);
    }
  });
}

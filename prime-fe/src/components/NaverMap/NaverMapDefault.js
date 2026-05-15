import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useGeolocation from "../../hooks/useGeolocation";
import {
  DEFAULT_LOCATION,
  resetMoveToCenter,
  setMapCenter,
  setZoomLevel,
  fetchPolygons,
  updateCurrentBounds,
  sidebarMapData,
  fetchPublicHouse,
  addAreaCalculationPoint,
  resetSearchStatus,
  clearPendingMapMove,
} from "../../redux/mapState";
import { logEvent, getAnalytics } from "firebase/analytics";
import usePolygon from "../../hooks/usePolygon";
import {
  createClusterMarker,
  createNaverPriceMarker,
  parseDealAmount,
  createPublicHouseMarker,
} from "../common/CurrentLocMarker";
import {
  createCategoryMarkers,
  clearCategoryMarkers,
  filterDevelopmentMarkers,
} from "../common/CategoryMarkers";
/** 실거래가 문자를 숫자로 변환, 필요시 x 10,000 해 주는 헬퍼 함수 */

const getLandDeals = (properties = {}) => {
  const directDeals = Array.isArray(properties.deals) ? properties.deals : [];
  const realEstateDeals = Array.isArray(properties.realEstatePrices?.deals)
    ? properties.realEstatePrices.deals
    : [];

  return directDeals.length > 0 ? directDeals : realEstateDeals;
};

const hasDealAmount = (deal) =>
  deal?.dealAmount !== undefined &&
  deal?.dealAmount !== null &&
  String(deal.dealAmount).trim() !== "";

const hasOfficialPriceFallback = (properties = {}) => {
  const landArea = Number(properties.landArea ?? properties.land_area ?? 0);
  const officialPrice = Number(
    properties.landPrice ?? properties.government?.gvm_price ?? 0,
  );

  return landArea > 0 && officialPrice > 0;
};

function NaverMapDefault({
  setSidebar,
  onZonePolygonComplete,
  zoneDrawingMode = false,
  zoneResultPolygon = [],
}) {
  const mapRef = useRef(null);
  // 개별 폴리곤 마커(실거래가 표시) 보관
  const polygonMarkersRef = useRef([]);
  const publicHouseMarkersRef = useRef([]);
  // 클러스터 마커 보관
  // const clusterMarkersRef = useRef([]);
  const selectedPolygonRef = useRef(null);
  const selectedPolygonHitRef = useRef(null);
  const cadastralLayerRef = useRef(null);
  const publicHousePolygonRef = useRef([]);
  
  // 면적계산 관련 참조
  const areaPolygonRef = useRef(null);
  const areaMarkersRef = useRef([]);
  const areaInfoWindowRef = useRef(null);
  const zoneResultPolygonRef = useRef(null);
  const zoneResultMarkersRef = useRef([]);

  // 카테고리별 마커 (목데이터 기반, 토지 제외)
  const categoryMarkersRef = useRef([]);
  const prevCategoryRef = useRef(null);

  // 마커 풀링을 위한 참조
  const markerPoolRef = useRef([]);
  // 현재 화면에 표시된 마커 ID 추적
  const visibleMarkerIdsRef = useRef(new Set());
  // 마커 데이터 캐시 (ID -> 데이터 매핑)
  const markerDataCacheRef = useRef(new Map());
  // 상위 집계 마커 클릭 후 상세 데이터 도착 전까지 집계 마커 재표시를 보류
  const drilldownPendingRef = useRef(false);
  const suppressNextMapClickRef = useRef(false);

  const {
    isLayerVisible,
    isPublicHouseVisible,
    currentMapFlag,
    currentLocation,
    moveToCenter,
    zoomLevel,
    mapCenter,
    polygons,
    polygonsZoomLevel,
    publicHouse,
    searchStatus,
    selectedLocation,
    unit,
    isAreaCalculationMode,
    areaCalculationPoints,
    pendingMapMove,
    activeCategory,
    activeDevSub,
  } = useSelector((state) => state.map);
  // 단위 변경 시에만 전체 마커를 강제 재생성
  const lastMarkerUnitRef = useRef(unit);
  const dispatch = useDispatch();
  const analytics = getAnalytics();
  const { sendPoint } = usePolygon();

  useGeolocation();

  // 마커를 풀로 반환
  const returnMarkerToPool = useCallback((marker) => {
    if (!marker) return;
    if (window?.naver?.maps?.Event?.clearListeners) {
      window.naver.maps.Event.clearListeners(marker, "click");
    }
    marker.setMap(null);
    marker.setVisible(false);
    markerPoolRef.current.push(marker);
  }, []);

  const suppressMapClickOnce = useCallback(() => {
    suppressNextMapClickRef.current = true;
    window.setTimeout(() => {
      suppressNextMapClickRef.current = false;
    }, 0);
  }, []);

  const clearSelectedPolygonOverlays = useCallback(() => {
    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setMap(null);
      selectedPolygonRef.current = null;
    }

    if (selectedPolygonHitRef.current) {
      selectedPolygonHitRef.current.setMap(null);
      selectedPolygonHitRef.current = null;
    }
  }, []);

  const buildBoundsFromPolygonPath = useCallback((polygonPath) => {
    const boundsObj = new window.naver.maps.LatLngBounds();
    polygonPath.forEach((point) => boundsObj.extend(point));
    return boundsObj;
  }, []);

  const openSelectedParcel = useCallback(
    ({
      polygonPath,
      sidebarPaths,
      sidebarProperties,
      clickPosition,
      interactionType,
      panDuration = 200,
    }) => {
      if (!mapRef.current) return null;

      clearSelectedPolygonOverlays();

      const boundsObj = buildBoundsFromPolygonPath(polygonPath);
      const emitSidebarData = (nextClickPosition) => {
        dispatch(
          sidebarMapData({
            bounds: {
              neLat: boundsObj.getNE().lat(),
              neLng: boundsObj.getNE().lng(),
              swLat: boundsObj.getSW().lat(),
              swLng: boundsObj.getSW().lng(),
            },
            interactionType,
            paths: sidebarPaths,
            properties: sidebarProperties,
            clickPosition: nextClickPosition,
            _clickedAt: Date.now(),
          })
        );
      };

      selectedPolygonRef.current = new window.naver.maps.Polygon({
        map: mapRef.current,
        paths: polygonPath,
        strokeWeight: 2,
        strokeColor: "#0000FF",
        strokeOpacity: 1,
        fillColor: "#0000FF",
        fillOpacity: 0.5,
        clickable: false,
        zIndex: 3,
      });

      selectedPolygonHitRef.current = new window.naver.maps.Polygon({
        map: mapRef.current,
        paths: polygonPath,
        strokeWeight: 0,
        strokeColor: "#0000FF",
        strokeOpacity: 0,
        fillColor: "#0000FF",
        fillOpacity: 0.01,
        clickable: true,
        zIndex: 4,
      });

      window.naver.maps.Event.addListener(
        selectedPolygonHitRef.current,
        "click",
        (e) => {
          suppressMapClickOnce();
          emitSidebarData({ lat: e.coord.lat(), lng: e.coord.lng() });
          setSidebar(true);
        }
      );

      mapRef.current.panTo(boundsObj.getCenter(), {
        duration: panDuration,
        animation: window.naver.maps.Animation.Easing,
      });

      emitSidebarData(clickPosition);
      setSidebar(true);

      return boundsObj;
    },
    [
      buildBoundsFromPolygonPath,
      clearSelectedPolygonOverlays,
      dispatch,
      setSidebar,
      suppressMapClickOnce,
    ]
  );

  /** 맵 상태 변경 시(드래그, 줌 변경 등) 처리 */
  const handleMapStateChange = useCallback(() => {
    if (!mapRef.current) return;

  // 맵 중심과 줌 레벨 상태 업데이트는 즉시 실행
  const center = mapRef.current.getCenter();
  dispatch(setMapCenter({ lat: center.lat(), lng: center.lng() }));

  const newZoom = mapRef.current.getZoom();
  dispatch(setZoomLevel(newZoom));

  const bounds = mapRef.current.getBounds();
  dispatch(
    updateCurrentBounds({
      neLat: bounds.getNE().lat(),
      neLng: bounds.getNE().lng(),
      swLat: bounds.getSW().lat(),
      swLng: bounds.getSW().lng(),
    })
  );

  // 폴리곤과 공공주택 데이터 요청
  dispatch(fetchPolygons());
  dispatch(fetchPublicHouse());
  }, [dispatch]);

  /* 폴리곤데이터 좌표값 뽑아오기 */
  const pathsToGeoJSONPolygon = useCallback((paths) => {
    if (!paths || !Array.isArray(paths) || paths.length < 3) {
      console.error("유효하지 않은 paths: 최소 3개의 점이 필요합니다.", paths);
      return null;
    }

    // [경도, 위도]로 변환 - 두 가지 좌표 형식 모두 처리
    const coordinates = paths.map((point) => {
      // 좌표 형식 확인 및 추출
      let lng, lat;

      // LatLng 객체인 경우 (네이버 맵 객체)
      if (typeof point.lat === 'function' && typeof point.lng === 'function') {
        lng = point.lng();
        lat = point.lat();
      }
      // _lng, _lat 속성이 있는 경우
      else if (point._lng !== undefined && point._lat !== undefined) {
        lng = point._lng;
        lat = point._lat;
      }
      // lng, lat 속성이 있는 경우
      else if (point.lng !== undefined && point.lat !== undefined) {
        lng = point.lng;
        lat = point.lat;
      }
      // x, y 속성이 있는 경우 (네이버 맵 좌표)
      else if (point.x !== undefined && point.y !== undefined) {
        lng = point.x;
        lat = point.y;
      }
      // 기본값 (오류 방지)
      else {
        console.warn('알 수 없는 좌표 형식:', point);
        return [0, 0]; // 기본값 설정
      }

      return [lng, lat];
    });

    // 폐곡선 보장: 첫 점과 마지막 점이 다르면 첫 점 추가
    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
      coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: "Polygon",
      coordinates: [coordinates],
    };
  }, []);

  /* 폴리곤 중심 POINT 계산 (Shoelace 공식) */
  const calculateCentroid = useCallback((paths) => {
    const geoJSONPolygon = pathsToGeoJSONPolygon(paths);
    if (!geoJSONPolygon) {
      console.error("GeoJSON Polygon 변환 실패");
      return null;
    }

    try {
      // 외곽 좌표 추출
      const coordinates = geoJSONPolygon.coordinates[0]; // [[lng, lat], ...]
      if (!Array.isArray(coordinates) || coordinates.length < 3) {
        console.error("유효하지 않은 폴리곤 좌표:", coordinates);
        return null;
      }

      // Shoelace 공식으로 중심 계산
      let twiceArea = 0;
      let cx = 0;
      let cy = 0;
      const n = coordinates.length;

      for (let i = 0, j = n - 1; i < n; j = i++) {
        const x_i = coordinates[i][0]; // 경도 (lng)
        const y_i = coordinates[i][1]; // 위도 (lat)
        const x_j = coordinates[j][0];
        const y_j = coordinates[j][1];

        const term = x_i * y_j - x_j * y_i;
        twiceArea += term;
        cx += (x_i + x_j) * term;
        cy += (y_i + y_j) * term;
      }

      // 면적이 0인 경우 (퇴화된 폴리 Ascertainable.
      if (twiceArea === 0) {
        console.warn("폴리곤 면적이 0, 좌표 평균 사용");
        let sumLng = 0;
        let sumLat = 0;
        for (let i = 0; i < n; i++) {
          sumLng += coordinates[i][0];
          sumLat += coordinates[i][1];
        }
        return {
          lng: sumLng / n,
          lat: sumLat / n,
        };
      }

      const area = twiceArea / 2;
      const centroid = {
        lng: cx / (6 * area),
        lat: cy / (6 * area),
      };

      // 유효성 검사
      if (!isFinite(centroid.lng) || !isFinite(centroid.lat)) {
        throw new Error("유효하지 않은 중심 좌표");
      }

      // 광선 투영 알고리즘으로 내부 점 확인
      function isPointInPolygon(point, polygon) {
        const x = point.lng, y = point.lat;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
          const xi = polygon[i][0], yi = polygon[i][1];
          const xj = polygon[j][0], yj = polygon[j][1];
          const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }

      if (isPointInPolygon(centroid, coordinates)) {
        return centroid;
      }

      // 바운딩 박스 계산
      const lngs = coordinates.map(c => c[0]);
      const lats = coordinates.map(c => c[1]);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      // 그리드 크기 설정 (예: 바운딩 박스 크기의 1/50)
      const gridSize = Math.min(maxLng - minLng, maxLat - minLat) / 50;

      let bestPoint = null;
      let maxMinDistance = -1;

      // 점에서 선분까지의 거리 계산
      function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSquared = dx * dx + dy * dy;
        if (lengthSquared === 0) {
          return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
        }
        let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
      }

      // 그리드 점 순회
      for (let lng = minLng; lng <= maxLng; lng += gridSize) {
        for (let lat = minLat; lat <= maxLat; lat += gridSize) {
          const point = { lng, lat };
          if (isPointInPolygon(point, coordinates)) {
            // 폴리곤 경계까지의 최소 거리 계산
            let minDistance = Infinity;
            for (let i = 0; i < n; i++) {
              const j = (i + 1) % n;
              const dist = pointToSegmentDistance(
                lng, lat,
                coordinates[i][0], coordinates[i][1],
                coordinates[j][0], coordinates[j][1]
              );
              minDistance = Math.min(minDistance, dist);
            }
            if (minDistance > maxMinDistance) {
              maxMinDistance = minDistance;
              bestPoint = point;
            }
          }
        }
      }

      if (bestPoint) {
        return bestPoint;
      }

      // 내부 점을 찾지 못한 경우 좌표 평균 사용
      let sumLng = 0;
      let sumLat = 0;
      for (let i = 0; i < n; i++) {
        sumLng += coordinates[i][0];
        sumLat += coordinates[i][1];
      }
      return {
        lng: sumLng / n,
        lat: sumLat / n,
      };
    } catch (error) {
      console.error("중심 계산 실패:", error);
      return null;
    }
  }, [pathsToGeoJSONPolygon]);

  /* 공공주택 폴리곤 표시 */
  const handlePublicHouse = useCallback(() => {
    if (!mapRef.current) return;

    if(publicHousePolygonRef.current.length > 0) {
      publicHousePolygonRef.current.forEach((marker) => marker.setMap(null));
      publicHousePolygonRef.current = [];
    }
    if(publicHouseMarkersRef.current.length > 0) {
      publicHouseMarkersRef.current.forEach((marker) => marker.setMap(null));
      publicHouseMarkersRef.current = [];
    }

    // publicHouse가 객체이고 실제 데이터는 data 배열에 있는지 확인
    if (publicHouse && publicHouse.data && Array.isArray(publicHouse.data)) {
      // data 배열을 순회
      publicHouse.data.forEach((item, index) => {
        try {
          // geo 배열이 있는지 확인
          if (item.geo && Array.isArray(item.geo)) {
            // 좌표 배열을 Naver Maps LatLng 객체로 변환
            const polygonPath = item.geo.map(coord => {
              if (Array.isArray(coord) && coord.length >= 2) {
                return new window.naver.maps.LatLng(coord[1], coord[0]);
              }
              return null;
            }).filter(coord => coord !== null);
            // 폴리곤 생성
            const polygon = new window.naver.maps.Polygon({
              map: mapRef.current,
              paths: polygonPath,
              strokeWeight: 1.5,
              strokeColor: "#ff0a00",
              strokeOpacity: 1,
              fillColor: "#ff0a00",
              fillOpacity: 0.2,
              strokeStyle: "shortdash",
            });

            // 폴리곤 저장
            publicHousePolygonRef.current.push(polygon);
            // // 폴리곤 클릭 이벤트 추가
            // if (item.data && item.data.name) {
            //   window.naver.maps.Event.addListener(polygon, 'dblclick', () => {
            //     alert(item.data.name);
            //   });
            // }
            const point = calculateCentroid(polygonPath);
            // 마커 생성
            const marker = createPublicHouseMarker(mapRef.current, item, {
              lng: point.lng,
              lat: point.lat
            }, currentMapFlag);
            if (marker) {
              publicHouseMarkersRef.current.push(marker);
              window.naver.maps.Event.addListener(marker, 'click', () => {
                polygon.setOptions({
                  fillOpacity: 0.5,
                });
              });
            }
          }
        } catch (error) {
          console.error(`항목 ${index} 폴리곤 생성 오류:`, error);
        }
      });
    }
  }, [publicHouse, mapRef, calculateCentroid, currentMapFlag]);

  /** 특정 좌표 클릭 시 개별 상세 폴리곤 로드 + 사이드바 열기 */
  const enableDetailHandler = useCallback(
    async (lat, lng) => {
      if (!mapRef.current) return;

      // 중복 요청 방지를 위한 플래그
      if (enableDetailHandler.isProcessing) return;
      enableDetailHandler.isProcessing = true;

      try {
        const response = await sendPoint(lat, lng);
        if (!response || response.length === 0) return;
        const polygonData = response[0];

        // 좌표 path 생성
        const polygonPath = polygonData.coordinates.map(
          (coord) => new window.naver.maps.LatLng(coord[1], coord[0])
        );
        openSelectedParcel({
          polygonPath,
          sidebarPaths: polygonPath.map((point) => ({
            lat: point.y,
            lng: point.x - 0.00003,
          })),
          sidebarProperties: polygonData,
          clickPosition: { lat, lng },
          interactionType: "polygon",
          panDuration: 200,
        });
      } catch (error) {
        console.error("폴리곤 생성 오류:", error);
      } finally {
        enableDetailHandler.isProcessing = false;
      }
    },
    [openSelectedParcel, sendPoint]
  );

  enableDetailHandler.isProcessing = false;

  /** 개별 폴리곤 마커 클릭 시 처리 */
  const clickPolygonMarkerHandler = useCallback(
    (e, polygonPath, polygonData) => {
      if (e.stopPropagation) e.stopPropagation();

      if (!mapRef.current) return;

      // 기존 선택 폴리곤 제거
      clearSelectedPolygonOverlays();
      const currentZoom = mapRef.current.getZoom();
      const props = polygonData?.properties || {};
      const deals = getLandDeals(props);
      const hasDeals = hasDealAmount(deals[0]);
      const hasFallbackPrice = hasOfficialPriceFallback(props);
      // 저줌(집계 단계)에서는 drill-down이 우선, 고줌(개별 단계)에서만 상세 패널 오픈
      const shouldOpenDetailPanel =
        currentZoom >= 17 && (hasDeals || hasFallbackPrice);
      // 중앙 가져오기
      const boundsObj = new window.naver.maps.LatLngBounds();
      polygonPath.forEach((pt) => boundsObj.extend(pt));

      const isGuMarker = Boolean(props.sggNm || props.admSectCode);
      const isDongMarker = Boolean(props.emdnm || props.empcd || props.coladmse);

      // 실거래가 마커는 사이드바 열기 && 읍면동, 시군구는 사이드바 닫기
      if (shouldOpenDetailPanel) { // 개별 단계 상세
        openSelectedParcel({
          polygonPath,
          sidebarPaths: polygonData.paths,
          sidebarProperties: polygonData.properties,
          clickPosition: { lat: e.coord.lat(), lng: e.coord.lng() },
          interactionType: "marker",
          panDuration: 500,
        });
      } else { // 읍면동, 시군구는 사이드바 닫기
        setSidebar(false);
        // drill-down 목표 줌:
        // 구 마커 -> 동(15), 동 마커 -> 개별(17)
        // 타입 추론이 불가하면 현재 줌 기준으로 fallback.
        const targetZoom = isGuMarker
          ? 15
          : isDongMarker
            ? 17
            : (currentZoom <= 13 ? 15 : 17);

        // drill-down 시작 시 현재 집계 마커는 즉시 제거
        polygonMarkersRef.current.forEach((item) => {
          returnMarkerToPool(item.marker);
        });
        polygonMarkersRef.current = [];
        visibleMarkerIdsRef.current.clear();
        markerDataCacheRef.current.clear();
        // 개별 단계로 들어갈 때만 상세 데이터 도착 대기
        drilldownPendingRef.current = targetZoom >= 17;

        const point = polygonData?.properties?.point;
        const pointLng = Array.isArray(point)
          ? Number(point[0])
          : Number(point?.lng ?? point?.x);
        const pointLat = Array.isArray(point)
          ? Number(point[1])
          : Number(point?.lat ?? point?.y);

        const hasValidPoint = Number.isFinite(pointLat) && Number.isFinite(pointLng);
        const fallbackCenter = boundsObj.getCenter();
        const targetCenter = hasValidPoint
          ? new window.naver.maps.LatLng(pointLat, pointLng)
          : fallbackCenter;

        mapRef.current.morph(targetCenter, targetZoom, {
          duration: 200,
          animation: window.naver.maps.Animation.Easing,
        });
      }
    },
    [clearSelectedPolygonOverlays, openSelectedParcel, setSidebar, returnMarkerToPool]
  );

  // 마커 풀에서 마커 가져오기 또는 새로 생성
  const getMarkerFromPool = useCallback(() => {
    if (markerPoolRef.current.length > 0) {
      return markerPoolRef.current.pop();
    }
    // 풀에 없으면 새 마커 생성 (기본 옵션으로 생성하고 나중에 설정 변경)
    return new window.naver.maps.Marker({
      map: null,
      visible: false
    });
  }, []);

  const getMarkerPoint = useCallback((polygonData) => {
    const rawPoint = polygonData?.properties?.point;

    if (Array.isArray(rawPoint) && rawPoint.length >= 2) {
      const lng = Number(rawPoint[0]);
      const lat = Number(rawPoint[1]);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        return { lng, lat };
      }
    }

    if (rawPoint && typeof rawPoint === "object") {
      const lng = Number(rawPoint.lng ?? rawPoint.x);
      const lat = Number(rawPoint.lat ?? rawPoint.y);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        return { lng, lat };
      }
    }

    return calculateCentroid(polygonData?.paths);
  }, [calculateCentroid]);

  // 폴리곤 마커 생성 함수 분리
  const createPolygonMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // 줌이 낮으면 토지 마커를 표시하지 않는다.
    if (zoomLevel < 11) {
      polygonMarkersRef.current.forEach(item => {
        returnMarkerToPool(item.marker);
      });
      polygonMarkersRef.current = [];
      visibleMarkerIdsRef.current.clear();
      markerDataCacheRef.current.clear();
      return;
    }

    // 현재 줌에 대응하는 폴리곤 응답이 아직 없으면 기존 마커를 유지한다.
    // (줌 직후 이전 줌 데이터로 재필터링하면서 생기는 깜빡임 방지)
    if (polygonsZoomLevel !== zoomLevel) {
      return;
    }

    // 단위 변경 시에만 전체 재생성
    const isUnitChanged = lastMarkerUnitRef.current !== unit;
    if (isUnitChanged) {
      if (polygonMarkersRef.current.length > 0) {
        polygonMarkersRef.current.forEach((item) => {
          returnMarkerToPool(item.marker);
        });
        polygonMarkersRef.current = [];
        visibleMarkerIdsRef.current.clear();
        markerDataCacheRef.current.clear();
      }
      lastMarkerUnitRef.current = unit;
    }

    // 현재 표시된 마커 ID 집합 초기화
    const newVisibleMarkerIds = new Set();
    const bounds = mapRef.current.getBounds();
    const ne = bounds.getNE();
    const sw = bounds.getSW();
    const latPad = Math.abs(ne.lat() - sw.lat()) * 0.08;
    const lngPad = Math.abs(ne.lng() - sw.lng()) * 0.08;
    const bufferedBounds = new window.naver.maps.LatLngBounds(
      new window.naver.maps.LatLng(sw.lat() - latPad, sw.lng() - lngPad),
      new window.naver.maps.LatLng(ne.lat() + latPad, ne.lng() + lngPad)
    );
    const bufferedRect = {
      neLat: ne.lat() + latPad,
      neLng: ne.lng() + lngPad,
      swLat: sw.lat() - latPad,
      swLng: sw.lng() - lngPad,
    };

    // 상위 집계 클릭으로 확대된 직후에는, 개별 데이터가 오기 전까지
    // 집계 마커를 다시 그리지 않고 대기한다.
    if (drilldownPendingRef.current && zoomLevel >= 17) {
      const hasDetailPolygons = polygons.some((polygonData) => {
        const props = polygonData?.properties || {};
        const deals = getLandDeals(props);
        return (
          hasDealAmount(deals[0]) || hasOfficialPriceFallback(props)
        );
      });

      if (!hasDetailPolygons) {
        return;
      }

      drilldownPendingRef.current = false;
    }

    polygons.forEach((polygonData) => {
      const point = getMarkerPoint(polygonData);
      if (!point) return;

      const props = polygonData?.properties || {};
      const emdCode = props.empcd ?? props.coladmse;
      const sggCode = props.admSectCode;
      const dealId = polygonData?.id;
      const markerId =
        emdCode !== undefined && emdCode !== null && String(emdCode).trim() !== ""
          ? `emd_${String(emdCode)}`
          : sggCode !== undefined && sggCode !== null && String(sggCode).trim() !== ""
            ? `sgg_${String(sggCode)}`
            : dealId !== undefined && dealId !== null
              ? `deal_${String(dealId)}`
              : `${point.lat.toFixed(6)}_${point.lng.toFixed(6)}`;

      const pointInView = bufferedBounds.hasPoint(
        new window.naver.maps.LatLng(point.lat, point.lng)
      );
      const rawBounds = polygonData?.bounds;
      const polygonBoundsValid =
        rawBounds &&
        Number.isFinite(Number(rawBounds.neLat)) &&
        Number.isFinite(Number(rawBounds.neLng)) &&
        Number.isFinite(Number(rawBounds.swLat)) &&
        Number.isFinite(Number(rawBounds.swLng));
      const polygonInView = polygonBoundsValid
        ? !(
            Number(rawBounds.swLat) > bufferedRect.neLat ||
            Number(rawBounds.neLat) < bufferedRect.swLat ||
            Number(rawBounds.swLng) > bufferedRect.neLng ||
            Number(rawBounds.neLng) < bufferedRect.swLng
          )
        : false;

      // 중심점이 뷰 밖이어도, 폴리곤 경계가 뷰와 겹치면 유지
      if (!pointInView && !polygonInView) {
        return;
      }

      const polygonPath = (polygonData.paths || []).map(
        (coord) => new window.naver.maps.LatLng(coord.lat, coord.lng)
      );

      markerDataCacheRef.current.set(markerId, {
        polygonData,
        point,
        polygonPath,
      });

      // 기존 마커가 있으면 재사용
      const existing = !isUnitChanged
        ? polygonMarkersRef.current.find((item) => item.id === markerId)
        : null;

      if (existing?.marker) {
        existing.marker.setVisible(true);
        if (existing.marker.getMap() !== mapRef.current) {
          existing.marker.setMap(mapRef.current);
        }
        newVisibleMarkerIds.add(markerId);
        return;
      }

      const marker = getMarkerFromPool();
      const styledMarker = createNaverPriceMarker(
        mapRef.current,
        polygonData,
        point,
        unit,
        marker
      );
      if (!styledMarker) return;

      if (window?.naver?.maps?.Event?.clearListeners) {
        window.naver.maps.Event.clearListeners(styledMarker, "click");
      }
      window.naver.maps.Event.addListener(styledMarker, "click", (e) => {
        suppressMapClickOnce();
        clickPolygonMarkerHandler(e, polygonPath, polygonData);
        if (polygonData.id !== undefined) console.log("실거래가 마커 id: ", polygonData.id);
      });

      polygonMarkersRef.current.push({
        id: markerId,
        marker: styledMarker,
        unit,
      });

      newVisibleMarkerIds.add(markerId);
    });

    // 데이터가 있는데 가시 마커가 0이면, 일시적인 좌표/응답 불일치로 판단해 기존 마커 유지
    if (
      polygons.length > 0 &&
      newVisibleMarkerIds.size === 0 &&
      polygonMarkersRef.current.length > 0
    ) {
      return;
    }

    // 더 이상 표시되지 않는 마커 제거 및 풀로 반환
    polygonMarkersRef.current = polygonMarkersRef.current.filter(item => {
      if (!newVisibleMarkerIds.has(item.id)) {
        // 풀로 반환
        returnMarkerToPool(item.marker);
        return false;
      }
      return true;
    });

    // 현재 표시된 마커 ID 집합 업데이트
    visibleMarkerIdsRef.current = newVisibleMarkerIds;
  }, [
    polygons,
    polygonsZoomLevel,
    zoomLevel,
    clickPolygonMarkerHandler,
    getMarkerPoint,
    unit,
    getMarkerFromPool,
    returnMarkerToPool,
    suppressMapClickOnce,
  ]);

  /**
   * "개별 폴리곤 마커" 생성 로직 - 최적화 버전
   * (줌 레벨이 17 이상일 때만 표시)
   * 디바운싱 적용
   */
  useEffect(() => {
    // 면적 계산 모드일 때는 폴리곤 마커를 표시하지 않음
    if (isAreaCalculationMode) return;
    // 토지 카테고리일 때만 폴리곤 마커 생성 (다른 탭은 목데이터 마커 사용)
    if (activeCategory !== "land") return;
    createPolygonMarkers();
  }, [polygons, zoomLevel, unit, createPolygonMarkers, isAreaCalculationMode, activeCategory]);

  /**
   * 카테고리별 마커 관리
   * - land: 기존 API 폴리곤 마커 사용 (createPolygonMarkers)
   * - 그 외: 목데이터 기반 카테고리 마커 사용
   */
  useEffect(() => {
    if (!mapRef.current) return;

    // 토지 카테고리: 폴리곤 마커 표시, 카테고리 마커 제거
    if (activeCategory === "land") {
      // 카테고리 마커 제거
      clearCategoryMarkers(categoryMarkersRef.current);
      categoryMarkersRef.current = [];

      // 폴리곤 마커 다시 표시
      polygonMarkersRef.current.forEach((item) => {
        if (item.marker) item.marker.setVisible(true);
      });
      prevCategoryRef.current = "land";
      return;
    }

    // 비-토지 카테고리: 폴리곤 마커 숨기기
    polygonMarkersRef.current.forEach((item) => {
      if (item.marker) item.marker.setVisible(false);
    });

    // ai, analysis 등 마커가 필요없는 카테고리
    if (activeCategory === "ai" || activeCategory === "analysis") {
      clearCategoryMarkers(categoryMarkersRef.current);
      categoryMarkersRef.current = [];
      prevCategoryRef.current = activeCategory;
      return;
    }

    // 카테고리가 변경된 경우에만 마커 재생성
    if (prevCategoryRef.current !== activeCategory) {
      clearCategoryMarkers(categoryMarkersRef.current);
      categoryMarkersRef.current = [];

      const handleCategoryMarkerClick = (markerData) => {
        // 카테고리 마커 클릭 시 해당 위치로 이동 + 패널 열기 + sideMapData 디스패치
        if (markerData.position) {
          mapRef.current.panTo(
            new window.naver.maps.LatLng(markerData.position.lat, markerData.position.lng),
            { duration: 300, animation: window.naver.maps.Animation.Easing }
          );
        }
        // sideMapData에 클릭한 마커 정보 전달 (패널에서 활용)
        // _clickedAt: 동일 마커 재클릭 시에도 Redux 중복방지 우회
        dispatch(
          sidebarMapData({
            properties: markerData.raw,
            clickPosition: markerData.position,
            category: activeCategory,
            _clickedAt: Date.now(),
          })
        );
        setSidebar(true);
      };

      categoryMarkersRef.current = createCategoryMarkers(
        mapRef.current,
        activeCategory,
        handleCategoryMarkerClick
      );
      prevCategoryRef.current = activeCategory;
    }
  }, [activeCategory, dispatch, setSidebar]);

  /**
   * 개발 탭: 서브탭(activeDevSub) 변경 시 해당 마커만 표시
   */
  useEffect(() => {
    if (activeCategory !== "development") return;
    filterDevelopmentMarkers(categoryMarkersRef.current, activeDevSub);
  }, [activeDevSub, activeCategory]);

  /**
   * "클러스터 마커" 생성 로직
   *  - 줌 레벨이 16이면 동 단위로 클러스터링
   *  - 줌 레벨이 15이면 구 단위로 클러스터링
   */
  // useEffect(() => {
  //   if (!mapRef.current) return;

  //   clusterMarkersRef.current.forEach((marker) => marker.setMap(null));
  //   clusterMarkersRef.current = [];
  //   console.log(zoomLevel);

  //   if (
  //     (zoomLevel >= 11 && zoomLevel <= 13) ||
  //     (zoomLevel >= 14 && zoomLevel <= 16)
  //   ) {
  //     const isDongLevel = zoomLevel >= 14 && zoomLevel <= 16;
  //     const groupMap = {};

  //     polygons.forEach((poly) => {
  //       const { areaName } = poly.properties;
  //       if (!areaName) return;

  //       const areaParts = areaName.split(" ");
  //       // 구 단위로 묶으려면 최소 2개 필요

  //       if (areaParts.length < 2) return;

  //       let groupKey;
  //       if (!isDongLevel) {
  //         // === 구 단위 ===
  //         groupKey = areaParts[1];
  //       } else {
  //         // === 동 단위 ===
  //         // 동 정보는 보통 3번째 토큰
  //         if (areaParts.length < 3) return;
  //         groupKey = areaParts[2];
  //       }

  //       if (!groupKey) return;

  //       const deals = poly.properties.realEstatePrices?.deals;
  //       const firstDeal = deals?.[0] || null;
  //       const priceValue = parseDealAmount(firstDeal?.dealAmount);

  //       const [lng, lat] = poly.properties.point || [0, 0];

  //       if (!groupMap[groupKey]) {
  //         groupMap[groupKey] = {
  //           count: 0,
  //           sumPrice: 0,
  //           sumLat: 0,
  //           sumLng: 0,
  //         };
  //       }
  //       groupMap[groupKey].count += 1;
  //       groupMap[groupKey].sumPrice += priceValue;
  //       groupMap[groupKey].sumLat += lat;
  //       groupMap[groupKey].sumLng += lng;
  //     });

  //     // 그룹별로 마커 표시
  //     Object.entries(groupMap).forEach(([key, val]) => {
  //       if (val.count === 0) return;
  //       const avgPrice = Math.round(val.sumPrice / val.count);
  //       const avgLat = val.sumLat / val.count;
  //       const avgLng = val.sumLng / val.count;

  //       const label = `${key}<br/>${avgPrice.toLocaleString()}원`;
  //       const marker = createClusterMarker({
  //         map: mapRef.current,
  //         position: new window.naver.maps.LatLng(avgLat, avgLng),
  //         label,
  //       });
  //       clusterMarkersRef.current.push(marker);
  //     });
  //   }
  // }, [polygons, zoomLevel]);

  /** 맵 초기 생성 */
  useEffect(() => {
    if (!window.naver || !window.naver.maps || mapRef.current) return;
    const mapContainer = document.getElementById("nmap");
    const mapOptions = {
      center: new window.naver.maps.LatLng(mapCenter.lat, mapCenter.lng),
      zoom: zoomLevel,
      minZoom: 8,
      maxZoom: 21,
      mapTypeId: currentMapFlag === 1 ? "hybrid" : "normal",
      pinchZoom: true,
      disableDoubleClickZoom: true,
      disableDefaultUI: true,
      tileTransition: false,
      disableKineticPan: false,
    };
    const map = new window.naver.maps.Map(mapContainer, mapOptions);
    mapRef.current = map;

    cadastralLayerRef.current = new window.naver.maps.CadastralLayer();
    if (isLayerVisible) {
      cadastralLayerRef.current.setMap(map);
    }

    // 맵 이벤트 등록 - idle 이벤트에 디바운싱 적용
    window.naver.maps.Event.addListener(map, "idle", () => {
      handleMapStateChange();
    });

    window.naver.maps.Event.addListener(map, "dragend", () => {
      logEvent(analytics, "naver_map_drag", {
        content_type: "MapDrag",
        content_id: "map_dragend",
      });
      setSidebar(false);
    });
  }, [
    mapCenter,
    zoomLevel,
    currentMapFlag,
    isLayerVisible,
    handleMapStateChange,
    analytics,
    setSidebar,
  ]);


  /** 최초 폴리곤 fetch */
  useEffect(()=>{
    handleMapStateChange();
  },[])

  /** 공공주택 정보 fetch 및 토글 */
  useEffect(() => {
    if (!mapRef.current || !publicHouse) return;

    if (isPublicHouseVisible) {
      handlePublicHouse();
    } else {
      // 공공주택 폴리곤 숨기기
      if (publicHousePolygonRef.current.length > 0) {
        publicHousePolygonRef.current.forEach((polygon) => polygon.setMap(null));
      }
      if (publicHouseMarkersRef.current.length > 0) {
        publicHouseMarkersRef.current.forEach((marker) => marker.setMap(null));
      }
    }
  }, [handlePublicHouse, publicHouse, isPublicHouseVisible]);

  /** 특정 위치(검색 등)로 이동 시 폴리곤 강조 */
  useEffect(() => {
    if (searchStatus !== 'succeeded' || !selectedLocation) return;
    const { lat, lng } = selectedLocation;
    enableDetailHandler(lat, lng);
    mapRef.current.setZoom(20, { animate: true });
    dispatch(resetSearchStatus());
    setSidebar(false);  
  }, [selectedLocation, enableDetailHandler, searchStatus, dispatch, setSidebar]);

  /** 패널에서 지도 이동 요청 처리 (토지 실거래가 클릭 등) */
  useEffect(() => {
    if (!mapRef.current || !pendingMapMove) return;
    const { lat, lng, zoom } = pendingMapMove;
    mapRef.current.panTo(
      new window.naver.maps.LatLng(lat, lng),
      { duration: 300, animation: window.naver.maps.Animation.Easing }
    );
    if (zoom) {
      mapRef.current.setZoom(zoom, { animate: true });
    }
    dispatch(clearPendingMapMove());
  }, [pendingMapMove, dispatch]);

  /** 현재 위치 이동 */
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;
    if (currentLocation !== DEFAULT_LOCATION) {
      mapRef.current.setCenter(
        new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng)
      );
    }
  }, [currentLocation]);

  /** 맵 타입(하이브리드↔노멀) 토글 */
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setMapTypeId(currentMapFlag === 1 ? "hybrid" : "normal");
  }, [currentMapFlag]);

  /** 지적편집도 레이어 On/Off */
  useEffect(() => {
    if (!cadastralLayerRef.current) return;
    cadastralLayerRef.current.setMap(isLayerVisible ? mapRef.current : null);
  }, [isLayerVisible]);

  /** "센터로 이동" 트리거 처리 */
  useEffect(() => {
    if (!mapRef.current || !moveToCenter) return;
    const center = new window.naver.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    mapRef.current.morph(center, 17,{
      duration: 500,
      animation: window.naver.maps.Animation.Easing,
    });
    dispatch(resetMoveToCenter());
    setSidebar(false);
  }, [currentLocation, moveToCenter, dispatch, setSidebar]);

  // 면적 계산 함수 (Shoelace 공식 사용)
  const calculatePolygonArea = useCallback((points) => {
    if (points.length < 3) return 0;

    try {
      // Shoelace 공식을 사용한 면적 계산
      let area = 0;
      const R = 6378137; // 지구 반지름 (미터)

      // 위도/경도를 라디안으로 변환
      const radianPoints = points.map(point => ({
        lat: point.lat * Math.PI / 180,
        lng: point.lng * Math.PI / 180
      }));

      // 폐곡선 보장
      const n = radianPoints.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += radianPoints[i].lng * radianPoints[j].lat;
        area -= radianPoints[j].lng * radianPoints[i].lat;
      }

      area = Math.abs(area) * R * R / 2;

      // 네이버 지도 LatLng 객체 배열로 변환 (네이버 계산 방식 시도)
      const naverLatLngs = points.map(point => (
        new window.naver.maps.LatLng(point.lat, point.lng)
      ));

      // 임시 폴리곤 생성
      const tempPolygon = new window.naver.maps.Polygon({
        paths: [naverLatLngs],
        map: mapRef.current
      });

      // 네이버 계산 방식을 시도하지만, 작동하지 않을 경우 Shoelace 결과 사용
      let naverArea = 0;
      try {
        if (typeof tempPolygon.getAreaSize === 'function') {
          naverArea = tempPolygon.getAreaSize();

          // 네이버 계산 결과가 유효하면 사용
          if (naverArea > 0) {
            area = naverArea;
          }
        }
      } catch (e) {
        console.error("Error calculating area with Naver API:", e);
      } finally {
        // 임시 폴리곤 제거
        tempPolygon.setMap(null);
      }
      return area; // 제곱미터 단위
    } catch (error) {
      console.error("Error in area calculation:", error);
      return 1000; // 오류 발생 시 기본값 제공
    }
  }, [mapRef]);

  // 면적을 표시 형식으로 변환 (평 또는 제곱미터)
  const formatArea = useCallback((areaSqMeters) => {
    const pyeong = areaSqMeters / 3.305785;
    const sqMeters = areaSqMeters;

    return `계산결과: ${pyeong.toFixed(0)}평\n${sqMeters.toFixed(1)}m²`;
  }, []);

  // 면적 정보창을 뷰포트 하단 중앙에 배치하기 위한 좌표 계산
  const getAreaInfoBottomCenterPosition = useCallback(() => {
    if (!mapRef.current) return null;

    const mapBounds = mapRef.current.getBounds();
    const mapCenter = mapRef.current.getCenter();
    const bottomPaddingRatio = 0.08; // 하단에서 8% 위로 띄워 가시성 확보

    return new window.naver.maps.LatLng(
      mapBounds.getSW().lat() +
      (mapBounds.getNE().lat() - mapBounds.getSW().lat()) * bottomPaddingRatio,
      mapCenter.lng()
    );
  }, []);

  // 면적계산 모드에서 폴리곤 및 마커 표시/숨김 처리
  const toggleAreaCalculationElements = useCallback((show) => {
    // 기존 폴리곤 및 마커 표시/숨김
    polygonMarkersRef.current.forEach(item => {
      if (item.marker) item.marker.setVisible(show);
    });

    if (selectedPolygonRef.current) {
      selectedPolygonRef.current.setVisible(show);
    }

    if (selectedPolygonHitRef.current) {
      selectedPolygonHitRef.current.setVisible(show);
    }

    publicHouseMarkersRef.current.forEach(marker => {
      marker.setVisible(show);
    });

    publicHousePolygonRef.current.forEach(polygon => {
      polygon.setVisible(show);
    });
    setSidebar(false);
  }, [setSidebar]);

  // 면적계산 폴리곤 업데이트
  const updateAreaPolygon = useCallback(() => {
    if (!mapRef.current || areaCalculationPoints.length < 2) return;

    // 기존 폴리곤 제거
    if (areaPolygonRef.current) {
      areaPolygonRef.current.setMap(null);
    }

    // 경로 생성
    const path = areaCalculationPoints.map(point =>
      new window.naver.maps.LatLng(point.lat, point.lng)
    );

    const strokeColor = zoneDrawingMode ? "#9333ea" : "#f97316";
    const fillColor = zoneDrawingMode ? "#9333ea" : "#f97316";
    const fillOpacity = zoneDrawingMode ? 0.15 : 0.3;

    // 폴리곤 생성
    areaPolygonRef.current = new window.naver.maps.Polygon({
      map: mapRef.current,
      paths: [path],
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight: 4,
      strokeOpacity: 0.8,
      clickable: false
    });

    // 구역계 설정 모드에서는 기존 면적 측정 정보창을 표시하지 않음
    if (zoneDrawingMode) {
      if (areaInfoWindowRef.current) {
        areaInfoWindowRef.current.setMap(null);
        areaInfoWindowRef.current = null;
      }
      return;
    }

    // 면적 측정 모드에서만 면적 계산 및 표시
    if (areaCalculationPoints.length > 2) {
      const area = calculatePolygonArea(areaCalculationPoints);
      const formattedArea = formatArea(area);

      // 면적 정보창 표시
      if (areaInfoWindowRef.current) {
        areaInfoWindowRef.current.setMap(null);
      }

      // 정보창 생성 및 표시 (맵 하단 중앙에 고정)
      const bottomCenterPosition = getAreaInfoBottomCenterPosition();
      if (!bottomCenterPosition) return;

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="font-weight: bold; text-align: center; white-space: pre-line; padding: 15px 25px; line-height: 1.5;">${formattedArea}</div>`,
        position: bottomCenterPosition,
        disableAnchor: true,
        backgroundColor: '#fff',
        borderColor: '#f97316',
        borderWidth: 3,
        anchorSize: new window.naver.maps.Size(0, 0),
        pixelOffset: new window.naver.maps.Point(0, 0)
      });

      infoWindow.open(mapRef.current);
      areaInfoWindowRef.current = infoWindow;
    }
  }, [
    areaCalculationPoints,
    calculatePolygonArea,
    formatArea,
    getAreaInfoBottomCenterPosition,
    zoneDrawingMode,
  ]);

  // 면적계산 마커 업데이트
  const updateAreaMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    areaMarkersRef.current.forEach(marker => marker.setMap(null));
    areaMarkersRef.current = [];

    const markerColor = zoneDrawingMode ? "#9333ea" : "#f97316";

    // 새 마커 생성
    areaCalculationPoints.forEach((point, index) => {
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(point.lat, point.lng),
        map: mapRef.current,
        icon: {
          content: `<div style="width: 16px; height: 16px; background-color: ${markerColor}; border-radius: 50%; border: 3px solid white;"></div>`,
          anchor: new window.naver.maps.Point(9, 9)
        },
        zIndex: 10,
        clickable: false,
      });

      areaMarkersRef.current.push(marker);
    });
  }, [areaCalculationPoints, zoneDrawingMode]);

  // 구역계 확정 폴리곤(웹 전용) 렌더링
  useEffect(() => {
    if (!mapRef.current || !window?.naver?.maps) return;

    if (zoneResultPolygonRef.current) {
      zoneResultPolygonRef.current.setMap(null);
      zoneResultPolygonRef.current = null;
    }

    zoneResultMarkersRef.current.forEach((marker) => marker.setMap(null));
    zoneResultMarkersRef.current = [];

    if (isAreaCalculationMode) return;
    if (!Array.isArray(zoneResultPolygon) || zoneResultPolygon.length < 3) return;

    const path = zoneResultPolygon.map(
      (point) => new window.naver.maps.LatLng(point.lat, point.lng)
    );

    zoneResultPolygonRef.current = new window.naver.maps.Polygon({
      map: mapRef.current,
      paths: [path],
      fillColor: "#9333ea",
      fillOpacity: 0.15,
      strokeColor: "#9333ea",
      strokeWeight: 3,
      strokeOpacity: 0.85,
      clickable: false,
      zIndex: 11,
    });

    zoneResultMarkersRef.current = zoneResultPolygon.map(
      (point) =>
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(point.lat, point.lng),
          map: mapRef.current,
          icon: {
            content:
              '<div style="width: 10px; height: 10px; background-color: #9333ea; border-radius: 9999px; border: 2px solid #fff;"></div>',
            anchor: new window.naver.maps.Point(5, 5),
          },
          clickable: false,
          zIndex: 12,
        })
    );
  }, [zoneResultPolygon, isAreaCalculationMode]);

  /** 맵 클릭 처리 - 면적계산 모드와 일반 모드 분리 */
  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;

    const handleMapClick = (e) => {
      if (suppressNextMapClickRef.current) {
        suppressNextMapClickRef.current = false;
        return;
      }

      const clickedLat = e.coord.lat();
      const clickedLng = e.coord.lng();

      if (isAreaCalculationMode) {
        // 면적계산 모드에서는 클릭 지점을 저장하고 폴리곤 업데이트
        dispatch(addAreaCalculationPoint({ lat: clickedLat, lng: clickedLng }));
      } else if (activeCategory === "land") {
        // 토지 모드에서만 필지 상세 정보 표시
        enableDetailHandler(clickedLat, clickedLng);
        setSidebar(true);
      }
      // 비-토지 카테고리에서는 맵 빈 공간 클릭 시 아무 동작 없음
    };

    const listener = window.naver.maps.Event.addListener(
      mapRef.current,
      "click",
      handleMapClick
    );
    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [mapCenter, enableDetailHandler, isAreaCalculationMode, dispatch, setSidebar, activeCategory]);

  // 구역계 설정: 더블클릭으로 그리기 완료
  useEffect(() => {
    if (!mapRef.current || !onZonePolygonComplete || !zoneDrawingMode) return;

    const handleMapDoubleClick = () => {
      if (!zoneDrawingMode) return;
      if (!isAreaCalculationMode) return;
      if (areaCalculationPoints.length < 3) return;
      onZonePolygonComplete([...areaCalculationPoints]);
    };

    const dblclickListener = window.naver.maps.Event.addListener(
      mapRef.current,
      "dblclick",
      handleMapDoubleClick
    );

    return () => {
      window.naver.maps.Event.removeListener(dblclickListener);
    };
  }, [isAreaCalculationMode, areaCalculationPoints, onZonePolygonComplete, zoneDrawingMode]);

  /** 줌 레벨 바뀔 때, 선택 폴리곤이 너무 넓어서 보이지 않을 경우 처리 */
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedPolygonRef.current) {
      // 예: 18 미만이면 선택 폴리곤을 그냥 숨긴다거나, 원하는 로직 작성
      if (zoomLevel < 17) {
        selectedPolygonRef.current.setMap(null);
        if (selectedPolygonHitRef.current) {
          selectedPolygonHitRef.current.setMap(null);
        }
      } else {
        selectedPolygonRef.current.setMap(mapRef.current);
        if (selectedPolygonHitRef.current) {
          selectedPolygonHitRef.current.setMap(mapRef.current);
        }
      }
    }
  }, [zoomLevel]);

  // 면적계산 모드 변경 시 처리
  useEffect(() => {
    if (!mapRef.current) return;

    // 면적계산 모드 활성화/비활성화 처리
    toggleAreaCalculationElements(!isAreaCalculationMode);

    // 면적계산 모드일 때 지도 인터랙션 비활성화
    if (isAreaCalculationMode) {
      // 지도 인터랙션 비활성화 (드래그, 줌 등)
      mapRef.current.setOptions({
        draggable: false,
        pinchZoom: false,
        scrollWheel: false,
        keyboardShortcuts: false,
        disableDoubleTapZoom: true,
        disableDoubleClickZoom: true,
        disableTwoFingerTapZoom: true
      });
      mapRef.current.setCursor(`url('${process.env.PUBLIC_URL}/markers/ruler.png'), default`);
    } else {
      // 지도 인터랙션 다시 활성화
      mapRef.current.setOptions({
        draggable: true,
        pinchZoom: true,
        scrollWheel: true,
        keyboardShortcuts: true,
        disableDoubleTapZoom: false,
        disableDoubleClickZoom: false,
        disableTwoFingerTapZoom: false
      });
      mapRef.current.setCursor("auto");
      // 폴리곤 제거
      if (areaPolygonRef.current) {
        areaPolygonRef.current.setMap(null);
        areaPolygonRef.current = null;
      }

      // 마커 제거
      areaMarkersRef.current.forEach(marker => marker.setMap(null));
      areaMarkersRef.current = [];

      // 정보창 제거
      if (areaInfoWindowRef.current) {
        areaInfoWindowRef.current.setMap(null);
        areaInfoWindowRef.current = null;
      }
    }
  }, [isAreaCalculationMode, toggleAreaCalculationElements]);

  // 면적계산 포인트 변경 시 폴리곤 및 마커 업데이트
  useEffect(() => {
    if (!isAreaCalculationMode || !mapRef.current) return;

    updateAreaPolygon();
    updateAreaMarkers();

    // 맵 이동/줌 변경 시 면적 표시 위치 업데이트
    const handleMapChange = () => {
      if (
        !zoneDrawingMode &&
        isAreaCalculationMode &&
        areaCalculationPoints.length > 2 &&
        areaInfoWindowRef.current
      ) {
        const bottomCenterPosition = getAreaInfoBottomCenterPosition();
        if (!bottomCenterPosition) return;

        // 맵 하단 중앙에 면적 정보 표시
        areaInfoWindowRef.current.setPosition(bottomCenterPosition);
      }
    };

    const zoomChangedListener = window.naver.maps.Event.addListener(
      mapRef.current,
      "zoom_changed",
      handleMapChange
    );

    const dragendListener = window.naver.maps.Event.addListener(
      mapRef.current,
      "dragend",
      handleMapChange
    );

    return () => {
      window.naver.maps.Event.removeListener(zoomChangedListener);
      window.naver.maps.Event.removeListener(dragendListener);
    };
  }, [
    isAreaCalculationMode,
    areaCalculationPoints,
    updateAreaPolygon,
    updateAreaMarkers,
    getAreaInfoBottomCenterPosition,
    zoneDrawingMode,
  ]);

  // 컴포넌트 언마운트 시 마커 정리
  useEffect(() => {
    return () => {
      // 모든 마커 제거
      polygonMarkersRef.current.forEach(item => {
        if (item.marker) item.marker.setMap(null);
      });
      publicHouseMarkersRef.current.forEach(marker => marker.setMap(null));
      clearSelectedPolygonOverlays();

      // 마커 풀 비우기
      markerPoolRef.current.forEach(marker => marker.setMap(null));
      markerPoolRef.current = [];

      // 카테고리 마커 정리
      clearCategoryMarkers(categoryMarkersRef.current);
      categoryMarkersRef.current = [];

      // 캐시 및 참조 정리
      visibleMarkerIdsRef.current.clear();

      // 면적계산 관련 요소 정리
      if (areaPolygonRef.current) {
        areaPolygonRef.current.setMap(null);
      }

      areaMarkersRef.current.forEach(marker => marker.setMap(null));

      if (areaInfoWindowRef.current) {
        areaInfoWindowRef.current.setMap(null);
      }

      if (zoneResultPolygonRef.current) {
        zoneResultPolygonRef.current.setMap(null);
      }
      zoneResultMarkersRef.current.forEach((marker) => marker.setMap(null));
    };
  }, [clearSelectedPolygonOverlays]);

  return <div id="nmap" style={{ width: "100%", height: "100%" }} />;
}

export default NaverMapDefault;

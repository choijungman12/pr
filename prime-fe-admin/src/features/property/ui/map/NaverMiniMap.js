import { useEffect, useMemo, useRef, useState } from "react";

function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

// marker label은 HTML 문자열로 주입되므로 반드시 escape 처리한다.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// NaverMiniMap은 property feature 전용 지도 컴포넌트다.
// SDK 로드 여부, 좌표 검증, 마커 갱신을 모두 이 파일 안에서 처리한다.
export default function NaverMiniMap({ location }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(() => Boolean(window?.naver?.maps));

  const validLocation = useMemo(() => {
    if (!location) return null;

    const lat = Number(location.lat);
    const lng = Number(location.lng);
    if (!isFiniteCoordinate(lat) || !isFiniteCoordinate(lng)) {
      return null;
    }

    return {
      ...location,
      lat,
      lng,
    };
  }, [location]);

  useEffect(() => {
    if (window?.naver?.maps) {
      setSdkReady(true);
      return undefined;
    }

    // public/index.html에서 SDK script를 불러오기 때문에
    // 여기서는 짧은 polling으로 maps 객체가 준비됐는지만 확인한다.
    let cancelled = false;
    const intervalId = window.setInterval(() => {
      if (window?.naver?.maps && !cancelled) {
        setSdkReady(true);
        window.clearInterval(intervalId);
      }
    }, 250);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (
      !sdkReady ||
      !validLocation ||
      !mapContainerRef.current ||
      !window?.naver?.maps
    ) {
      return undefined;
    }

    const { lat, lng } = validLocation;
    const position = new window.naver.maps.LatLng(lat, lng);

    if (!mapRef.current) {
      mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
        center: position,
        zoom: 17,
        minZoom: 10,
        maxZoom: 20,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
      });
    } else {
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(17);
    }

    const markerLabel = escapeHtml(
      validLocation.label || validLocation.address || "검색 결과",
    );
    const markerIcon = {
      // 커스텀 HTML marker를 사용해 검색 결과 주소를 말풍선 형태로 표시한다.
      content: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="max-width:220px;padding:7px 12px;border-radius:999px;background:#ffffff;border:1px solid #fdba74;box-shadow:0 10px 30px rgba(15,23,42,0.15);color:#c2410c;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${markerLabel}
          </div>
          <div style="width:18px;height:18px;margin-top:6px;border-radius:999px;background:#f97316;border:3px solid #ffffff;box-shadow:0 6px 14px rgba(249,115,22,0.35);"></div>
        </div>
      `,
      anchor: new window.naver.maps.Point(0, 0),
    };

    if (!markerRef.current) {
      markerRef.current = new window.naver.maps.Marker({
        position,
        map: mapRef.current,
        icon: markerIcon,
      });
    } else {
      markerRef.current.setPosition(position);
      markerRef.current.setIcon(markerIcon);
      markerRef.current.setMap(mapRef.current);
    }

    return () => undefined;
  }, [sdkReady, validLocation]);

  useEffect(() => {
    if (validLocation) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    mapRef.current = null;
  }, [validLocation]);

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  if (!validLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-50 to-orange-50">
        <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-orange-100 flex items-center justify-center">
          <i className="ri-map-pin-search-line text-2xl text-orange-500"></i>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-700">
          주소를 검색하면 위치가 표시됩니다
        </p>
        <p className="mt-1 text-xs text-gray-500">
          지번 또는 도로명 주소를 검색해 정확한 좌표와 마커를 확인하세요.
        </p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-50 to-orange-50">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-orange-100 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-xl text-orange-500"></i>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-700">
          네이버 지도를 불러오는 중입니다
        </p>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="w-full h-full" />;
}

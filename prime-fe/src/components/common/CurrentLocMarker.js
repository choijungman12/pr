export const MARKER_SIZE = 36;
// export const markerSvg = `
// <svg width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
//   <!-- 애니메이션 링 -->
//   <circle class="pulse" cx="18" cy="18" r="10" stroke="#CCCCCC" stroke-width="1" fill="none"/>

//   <!-- 흰색 배경 원 -->
//   <circle cx="18" cy="18" r="10" fill="white" stroke="#CCCCCC" stroke-width="1"/>

//   <!-- 빨간색 중심 원 -->
//   <circle cx="18" cy="18" r="6" fill="#FF0000"/>

//   <style>
//     .pulse {
//       transform-origin: center;
//       animation: pulse 5s ease-in-out infinite;
//     }
//     @keyframes pulse {
//       0% {
//         transform: scale(0.95);
//         opacity: 1;
//       }
//       20% {
//         transform: scale(3);
//         opacity: 0.8;
//       }
//       40% {
//         transform: scale(10);
//         opacity: 0.6;
//       }
//       60% {
//         transform: scale(25);
//         opacity: 0.4;
//       }
//       80% {
//         transform: scale(40);
//         opacity: 0.2;
//       }
//       100% {
//         transform: scale(50);
//         opacity: 0;
//       }
//     }
//   </style>
// </svg>
// `;

// export const markerHtml = `
//   <div style="
//     width: ${MARKER_SIZE}px;
//     height: ${MARKER_SIZE}px;
//     background-image: url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
//       markerSvg
//     )}');
//     background-size: contain;
//     background-repeat: no-repeat;
//   "></div>
// `;

// export const createNaverMarker = (map, position) => {
//   return new window.naver.maps.Marker({
//     position: new window.naver.maps.LatLng(position.lat, position.lng),
//     map: map,
//     icon: {
//       content: markerHtml,
//       size: new window.naver.maps.Size(MARKER_SIZE, MARKER_SIZE),
//       anchor: new window.naver.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2),
//     },
//     clickable: false,
//   });
// };

// export const createKakaoMarker = (map, position) => {
//   const markerPosition = new window.kakao.maps.LatLng(
//     position.lat,
//     position.lng
//   );
//   const markerImage = new window.kakao.maps.MarkerImage(
//     `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
//     new window.kakao.maps.Size(MARKER_SIZE, MARKER_SIZE),
//     { offset: new window.kakao.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2) }
//   );

//   return new window.kakao.maps.Marker({
//     position: markerPosition,
//     map: map,
//     image: markerImage,
//     clickable: false,
//   });
// };

// export const createVWorldMarker = (map, position) => {
//   const markerLayer = new window.ol.layer.Vector({
//     source: new window.ol.source.Vector(),
//     zIndex: 10,
//   });

//   map.addLayer(markerLayer);

//   const markerFeature = new window.ol.Feature({
//     geometry: new window.ol.geom.Point(
//       window.ol.proj.transform(
//         [position.lng, position.lat],
//         "EPSG:4326",
//         "EPSG:3857"
//       )
//     ),
//   });

//   const markerStyle = new window.ol.style.Style({
//     image: new window.ol.style.Icon({
//       src: `data:image/svg+xml;utf8,${encodeURIComponent(markerSvg)}`,
//       scale: 1,
//       anchor: [0.5, 0.5],
//       crossOrigin: "anonymous",
//     }),
//   });

//   markerFeature.setStyle(markerStyle);
//   markerLayer.getSource().addFeature(markerFeature);
//   map.addLayer(markerLayer);

//   return markerLayer;
// };

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

const parseMarkerPoint = (data, point) => {
  if (point?.lng !== undefined && point?.lat !== undefined) {
    return point;
  }

  const rawPoint = data?.properties?.point;

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

  return null;
};

const formatMarkerAmount = (won) => {
  const tillionPart = Math.floor(won / 1000000000000);
  const billionPart = Math.floor(won / 100000000);
  const millionPart = Math.floor((won % 100000000) / 10000);
  return `${tillionPart !== 0 ? tillionPart + "조" : ""} ${
    billionPart !== 0 ? billionPart + "억" : ""
  } ${billionPart === 0 ? millionPart + "만" : ""}`.trim();
};

const formatPriceData = (data, point, unit = "pyeong") => {
  const markerPoint = parseMarkerPoint(data, point);
  if (!markerPoint) return null;

  const properties = data?.properties || {};
  const landArea = Number(properties.land_area ?? properties.landArea ?? 0);
  if (!(landArea > 0)) return null;

  const { lng, lat } = markerPoint;
  const area = unit === "pyeong"
    ? Math.round(landArea / 3.3058) + "평"
    : Math.round(landArea) + "㎡";
  const deals = getLandDeals(properties);
  const deal = deals[0];
  const officialUnitPrice = Number(
    properties.landPrice ?? properties.government?.gvm_price ?? 0,
  );

  let year = "";
  let resultPrice = 0;

  if (hasDealAmount(deal)) {
    year = deal.dealYear ? `${deal.dealYear}년` : "";
    resultPrice = Math.round(Number(deal.dealAmount) * 10000);
  } else if (officialUnitPrice > 0) {
    resultPrice = Math.round(officialUnitPrice * landArea);
  } else {
    return null;
  }

  const dealAmount = formatMarkerAmount(resultPrice);

  return { lng, lat, area, year, dealAmount };
};

const formatClusterPriceData = (data, point) => {
  const { lng, lat } = point;
  const place = data.properties.emdnm || data.properties.sggNm;
  const sum = data.properties.dealCount + "건";
  const cleanNumber = data.properties.avgDealAmount_p;
  const tillionPart = Math.floor(cleanNumber / 1000000000000);
  const billionPart = Math.floor((cleanNumber % 1000000000000) / 100000000);
  const millionPart = Math.floor((cleanNumber % 100000000) / 10000);
  const dealAmount = `${tillionPart !== 0 ? tillionPart + "조" : ""} ${
    billionPart !== 0 ? billionPart + "억" : ""
  } ${millionPart !== 0 ? millionPart + "만" : ""}`.trim();

  return { lng, lat, sum, place, dealAmount };
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const estimateMarkerWidth = (lines, charWidth = 8) => {
  const estimatedWidth = lines.reduce((maxWidth, line) => {
    const text = String(line || "");
    return Math.max(maxWidth, text.length * charWidth + 20);
  }, 60);

  return clamp(Math.round(estimatedWidth), 60, 120);
};

export const createNaverPriceMarker = (map, data, point, unit, reusableMarker = null) => {
  const isRegistered = Boolean(data.properties?.isRegistered);
  const detailFormatted = formatPriceData(data, point, unit);
  const clusterFormatted = detailFormatted ? null : formatClusterPriceData(data, point);
  const formatted = detailFormatted || clusterFormatted;
  if (!formatted) return null;

  const { lng, lat } = formatted;
  let content = "";

  // ── 토지 마커 컬러 ────────────────────────────────────────────
  // 개별 필지: #0284c7 배경 (진한 / 아파트 태그와 동일한 단색 스타일)
  // 클러스터:  #e0f2fe 배경 + #0284c7 테두리 (연한 배지 스타일)
  const COLOR_MAIN = detailFormatted && isRegistered ? "#f97316" : "#0284c7";
  const COLOR_DARK = detailFormatted && isRegistered ? "#ea580c" : "#0369a1";
  const POINTER_HEIGHT = 6;
  let badgeWidth = 60;
  let badgeHeight = 58;

  if (detailFormatted) {
    // ── 개별 필지 마커 (zoom ≥ 17) ─────────────────────────────
    // 아파트 태그와 동일한 형태: 진한 배경 + 흰 텍스트 + border-radius 10px
    const { area, year, dealAmount } = detailFormatted;
    const showYear = !isRegistered && Boolean(year);
    badgeHeight = showYear ? 58 : 44;
    badgeWidth = estimateMarkerWidth(
      showYear ? [year, area, dealAmount] : [dealAmount, area],
      8
    );
    content = `
      <div style="
        position: relative;
        width: ${badgeWidth}px;
        height: ${badgeHeight + POINTER_HEIGHT}px;
        overflow: visible;
        pointer-events: auto;
      ">
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          width: ${badgeWidth}px;
          height: ${badgeHeight}px;
        background: ${COLOR_MAIN};
        border: 2px solid ${COLOR_DARK};
        border-radius: 10px;
          box-sizing: border-box;
        padding: 4px 8px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${showYear ? 1 : 2}px;
      ">
          ${showYear ? `<div style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.85);">${year}</div>` : ""}
          <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 1px;">${dealAmount}</div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 1px;">${area}</div>
        </div>
        <div style="
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 6px solid ${COLOR_MAIN};
        "></div>
      </div>
    `;
  } else {
    // ── 클러스터 마커 (zoom 11-16) ──────────────────────────────
    // 개별 필지와 동일한 스타일: #0284c7 배경 + 흰 텍스트
    const { place, sum, dealAmount } = clusterFormatted;
    const placeName = place.split(' ')[1] || place.split(' ')[0];
    badgeHeight = 58;
    badgeWidth = estimateMarkerWidth([placeName, sum, dealAmount], 7);
    content = `
      <div style="
        position: relative;
        width: ${badgeWidth}px;
        height: ${badgeHeight + POINTER_HEIGHT}px;
        overflow: visible;
        pointer-events: auto;
      ">
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          width: ${badgeWidth}px;
          height: ${badgeHeight}px;
        background: ${COLOR_MAIN};
        border: 2px solid ${COLOR_DARK};
        border-radius: 10px;
          box-sizing: border-box;
        padding: 4px 8px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        white-space: nowrap;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
      ">
          <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.85);">${placeName}</div>
          <div style="font-size: 13px; font-weight: 800; color: #fff; margin-top: 1px;">${sum}</div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.85); margin-top: 1px;">${dealAmount}</div>
        </div>
        <div style="
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 6px solid ${COLOR_MAIN};
        "></div>
      </div>
    `;
  }

  const wrappedContent = `
    <div style="
      position: relative;
      display: inline-block;
      width: ${badgeWidth}px;
      height: ${badgeHeight + POINTER_HEIGHT}px;
      overflow: visible;
    ">
      ${content}
    </div>
  `;

  const position = new window.naver.maps.LatLng(lat, lng);
  const icon = {
    content: wrappedContent,
    // 좌표는 꼬리 끝점 기준이므로 배지 중앙 하단을 anchor로 맞춘다.
    anchor: new window.naver.maps.Point(
      Math.round(badgeWidth / 2),
      badgeHeight + POINTER_HEIGHT
    ),
  };

  if (reusableMarker) {
    reusableMarker.setPosition(position);
    reusableMarker.setIcon(icon);
    reusableMarker.setMap(map);
    reusableMarker.setVisible(true);
    reusableMarker.setZIndex(2);
    return reusableMarker;
  }

  return new window.naver.maps.Marker({
    position,
    map,
    icon,
    zIndex: 2,
  });
};

export const textSvg = ({ year, area, dealAmount }) => {
  const hasYear = Boolean(year);
  const height = hasYear ? 65 : 50;
  const background = hasYear ? "#fff" : "#f97316";
  const border = hasYear ? "#222" : "#ea580c";
  const textColor = hasYear ? "#222" : "#fff";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="${height}">
      <!-- 배경 사각형 -->
      <rect x="0" y="0" width="100" height="${height}" fill="${background}" stroke="${border}" stroke-width="2" rx="8" ry="8" />
      ${hasYear ? `<text x="50" y="20" text-anchor="middle" fill="${textColor}" font-size="12" font-family="Arial">
        ${year}
      </text>` : ""}
      <text x="50" y="${hasYear ? 35 : 22}" text-anchor="middle" fill="${textColor}" font-size="12" font-family="Arial">
        ${area}
      </text>
      <text x="50" y="${hasYear ? 50 : 38}" text-anchor="middle" fill="${textColor}" font-size="12" font-family="Arial">
        ${dealAmount}
      </text>
    </svg>
  `;
};

export const createKakaoPriceMarker = (map, data) => {
  const formatted = formatPriceData(data);
  if (!formatted) return null;
  const { lng, lat, area, year, dealAmount } = formatted;
  const isRegistered = Boolean(data?.properties?.isRegistered);
  const imageSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
    textSvg({ year: isRegistered ? "" : year, area, dealAmount })
  )}`;
  const imageSize = new window.kakao.maps.Size(100, isRegistered ? 50 : 65);
  const imageOption = { offset: new window.kakao.maps.Point(50, 50) };

  const markerImage = new window.kakao.maps.MarkerImage(
    imageSrc,
    imageSize,
    imageOption
  );
  const markerPosition = new window.kakao.maps.LatLng(lat, lng);
  return new window.kakao.maps.Marker({
    position: markerPosition,
    image: markerImage,
    clickable: true,
  });
};

export const createVWorldPriceMarker = (map, data) => {
  const formatted = formatPriceData(data);
  if (!formatted) return null;

  const markerLayer = new window.ol.layer.Vector({
    source: new window.ol.source.Vector(),
    zIndex: 20,
  });
  map.addLayer(markerLayer);

  const { lng, lat, area, year, dealAmount } = formatted;
  const isRegistered = Boolean(data?.properties?.isRegistered);

  const markerFeature = new window.ol.Feature({
    geometry: new window.ol.geom.Point(
      window.ol.proj.transform([lng, lat], "EPSG:4326", "EPSG:3857")
    ),
  });

  const markerStyle = new window.ol.style.Style({
    image: new window.ol.style.Icon({
      src: `data:image/svg+xml;utf8,${encodeURIComponent(
        textSvg({ year: isRegistered ? "" : year, area, dealAmount })
      )}`,
      scale: 1,
      anchor: [0.5, 0.5],
      crossOrigin: "anonymous",
    }),
  });

  markerFeature.setStyle(markerStyle);
  markerLayer.getSource().addFeature(markerFeature);
  return markerLayer;
};

export const createPublicHouseMarker = (map, data, point, currentMapFlag) => {
  // 데이터 유효성 검사
  if (!data || !point) return null;

  const { lng, lat } = point;
  const name = data.data.name;
  const status = data.data.status;

  // 마커 컨텐츠 생성
  const content = `
  <div style="
    position: relative;
    display: inline-block;
    transform: translate(-50%, -100%);
    white-space: nowrap;
  ">
    <div style="
      min-height: 30px;
      background-color: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
      font-weight: bold;
      ${currentMapFlag === 1 ? "text-shadow: -1px -1px 0 #000000,1px -1px 0 #000000,-1px  1px 0 #000000,1px  1px 0 #000000;" : "text-shadow: -1px -1px 0 #fff,1px -1px 0 #fff,-1px  1px 0 #fff,1px  1px 0 #fff;"}
      color: ${currentMapFlag === 1 ? "#fff" : "#8d3d5d"};
      background-color: transparent;
      display: flex;
      flex-direction: column;
      gap: 5px;
    ">
        <div style="font-size: 10px; color: ${currentMapFlag === 1 ? "#fff" : "red"}; ">${status}단계</div>
        <div style="font-size: 13px;">${name}</div>
      </div>
    </div>
  </div>
`;
  // 마커 생성 및 반환
  return new window.naver.maps.Marker({
    position: new window.naver.maps.LatLng(lat, lng),
    map: map,
    icon: {
      content: content,
      // content 내부 transform을 기준으로 정렬하기 위해 anchor는 원점 고정
      anchor: new window.naver.maps.Point(0, 0),
    },
  });
};

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { openPanel } from "../../redux/mapState";

function hasDealAmount(deal) {
  return (
    deal?.dealAmount !== undefined &&
    deal?.dealAmount !== null &&
    String(deal.dealAmount).trim() !== ""
  );
}

/**
 * prime-fe의 Redux polygons 데이터를 Prime UI용 LandTransaction 형태로 변환
 * (리스트용 — 실거래 내역이 있는 것만)
 */
function transformPolygonToLandTransaction(polygon) {
  const props = polygon.properties;
  if (!props) return null;

  const deals = props.realEstatePrices?.deals || props.deals || [];
  const deal = deals.find(hasDealAmount) || null;
  if (!deal) return null;

  const item = buildLandTransaction(props, deal, polygon);
  if (!item) return null;

  // polygon에 paths가 있으면 미니맵용 _sideMapData 구성
  if (polygon.paths && polygon.paths.length > 0) {
    item._sideMapData = {
      paths: polygon.paths,
      bounds: polygon.bounds,
      properties: props,
    };
  }

  return item;
}

/**
 * sideMapData(지도 마커 클릭)를 LandTransaction 형태로 변환
 * (실거래 내역 없어도 공시지가로 표시)
 */
function transformSideMapDataToLandTransaction(sideMapData) {
  const props = sideMapData.properties;
  if (!props) return null;

  const deals = props.realEstatePrices?.deals || props.deals || [];
  const deal = deals.find(hasDealAmount) || null;

  const item = buildLandTransaction(props, deal, {
    id: `map-${Date.now()}`,
    bounds: sideMapData.bounds,
  });

  if (!item) return null;

  // 마커 클릭 데이터: position을 clickPosition으로, sideMapData 참조 보관
  item.position = sideMapData.clickPosition || item.position;
  item._sideMapData = sideMapData;
  item.hasDeal = hasDealAmount(deal);
  item.hideTransactionPrice = sideMapData.interactionType === "polygon";

  return item;
}

/**
 * 공통 변환 로직
 */
function buildLandTransaction(props, deal, source) {
  const areaName = props.areaName || props.area_name || "";
  const jibunNum = props.jibunNum || props.jibun_num || "";
  const address = `${areaName} ${jibunNum}`.trim() || "주소 없음";

  const landUse = props.landType || props.land_type || "-";
  const zoning = props.useLandName1 || props.useland_name?.useland_name1 || "-";

  const landArea = Number(props.landArea || props.land_area || 0);
  const areaPyeong = Math.round(landArea / 3.3058);
  const officialPrice = Number(
    props.landPrice || props.government?.gvm_price || 0,
  );
  const isRegistered = Boolean(props.isRegistered);
  const hasValidDeal = hasDealAmount(deal);
  const hasOfficialPriceFallback = !hasValidDeal && officialPrice > 0 && landArea > 0;

  let dealAmountWon = 0;
  let priceText = "-";
  let pricePerPyeong = "-";
  let transactionDate = "-";
  let priceSource = "none";

  if (hasValidDeal) {
    dealAmountWon = Number(deal.dealAmount) * 10000;
    priceText = formatPrice(dealAmountWon);
    const perPyeong =
      areaPyeong > 0 ? Math.round(dealAmountWon / areaPyeong) : 0;
    pricePerPyeong = formatPricePerPyeong(perPyeong);
    priceSource = "deal";
    transactionDate =
      deal.dealYear && deal.dealMonth
        ? `${deal.dealYear}.${String(deal.dealMonth).padStart(2, "0")}`
        : "-";
  } else if (hasOfficialPriceFallback) {
    dealAmountWon = Math.round(officialPrice * landArea);
    priceText = formatPrice(dealAmountWon);
    pricePerPyeong = formatPricePerPyeong(
      Math.round(officialPrice * 3.3058),
    );
    transactionDate = "";
    priceSource = "official";
  }

  let position = { lat: 37.5, lng: 127.04 };
  if (props.point) {
    if (Array.isArray(props.point)) {
      position = { lat: props.point[1], lng: props.point[0] };
    } else {
      position = {
        lat: props.point.lat || props.point.y || 37.5,
        lng: props.point.lng || props.point.x || 127.04,
      };
    }
  } else if (source.bounds) {
    position = {
      lat: (source.bounds.neLat + source.bounds.swLat) / 2,
      lng: (source.bounds.neLng + source.bounds.swLng) / 2,
    };
  }

  return {
    id: source.id || `land-${areaName}-${jibunNum}`,
    address,
    landUse,
    zoning,
    area: landArea,
    areaText: `${Math.round(landArea)}㎡`,
    areaPyeong: `${areaPyeong}평`,
    price: dealAmountWon,
    priceText,
    pricePerPyeong,
    transactionDate,
    position,
    officialPrice,
    isRegistered,
    hasPrice: hasValidDeal || hasOfficialPriceFallback,
    priceSource,
    showTransactionDate:
      !isRegistered &&
      priceSource === "deal" &&
      transactionDate &&
      transactionDate !== "-",
    buildingCoverage: null,
    floorAreaRatio: null,
    hasDeal: hasValidDeal,
    hideTransactionPrice: false,
    _sideMapData: null,
  };
}

function formatPrice(won) {
  if (won >= 100000000) {
    const eok = won / 100000000;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  } else if (won >= 10000) {
    return `${Math.round(won / 10000).toLocaleString()}만`;
  }
  return `${won.toLocaleString()}원`;
}

function formatPricePerPyeong(won) {
  if (won >= 100000000) {
    return `${(won / 100000000).toFixed(1)}억/평`;
  } else if (won >= 10000) {
    return `${Math.round(won / 10000).toLocaleString()}만/평`;
  }
  return `${won.toLocaleString()}원/평`;
}

// ─── 미니맵 컴포넌트 ───
function MiniMap({ sideMapData }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || !sideMapData?.paths) return;
    if (!window.naver?.maps) return;

    // 폴리곤 중심 계산
    let totalLat = 0;
    let totalLng = 0;
    sideMapData.paths.forEach((p) => {
      totalLat += p.lat;
      totalLng += p.lng;
    });
    const center = {
      lat: totalLat / sideMapData.paths.length,
      lng: totalLng / sideMapData.paths.length,
    };

    const map = new window.naver.maps.Map(mapContainerRef.current, {
      center: new window.naver.maps.LatLng(center.lat, center.lng),
      zoom: 18,
      minZoom: 18,
      maxZoom: 18,
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
    });
    mapInstanceRef.current = map;

    const polygonPath = sideMapData.paths.map(
      (coord) => new window.naver.maps.LatLng(coord.lat, coord.lng + 0.00003),
    );

    new window.naver.maps.Polygon({
      map,
      paths: polygonPath,
      strokeWeight: 1,
      strokeColor: "#0000FF",
      strokeOpacity: 0.5,
      fillColor: "#0000FF",
      fillOpacity: 0.3,
      clickable: false,
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [sideMapData]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100%", cursor: "default" }}
    />
  );
}

// ─── 메인 컴포넌트 ───
export default function LandTransactionPanel({ onClose, onMoveToLocation }) {
  const dispatch = useDispatch();
  const [selectedLand, setSelectedLand] = useState(null);
  const polygons = useSelector((state) => state.map.polygons);
  const zoomLevel = useSelector((state) => state.map.zoomLevel);
  const sideMapData = useSelector((state) => state.map.sideMapData);
  const panelOpen = useSelector((state) => state.map.panelOpen);
  const activeCategory = useSelector((state) => state.map.activeCategory);

  // 지도 마커 클릭 → sideMapData 변경 감지 → 상세 화면 자동 전환
  const prevSideMapDataRef = useRef(null);
  useEffect(() => {
    if (activeCategory !== "land") return;
    if (!sideMapData?.properties) return;

    // 같은 데이터면 무시
    if (prevSideMapDataRef.current === sideMapData) return;
    prevSideMapDataRef.current = sideMapData;

    const transformed = transformSideMapDataToLandTransaction(sideMapData);
    if (transformed) {
      setSelectedLand(transformed);
      // 패널이 닫혀 있으면 열기
      if (!panelOpen) {
        dispatch(openPanel("land"));
      }
    }
  }, [sideMapData, activeCategory, panelOpen, dispatch]);

  // Redux polygons → LandTransaction[] 변환 (실거래 있는 것만)
  const landTransactions = useMemo(() => {
    if (zoomLevel < 17) return [];
    return polygons
      .map(transformPolygonToLandTransaction)
      .filter(Boolean)
      .sort((a, b) => b.price - a.price);
  }, [polygons, zoomLevel]);

  const detailScrollRef = useRef(null);

  const handleSelectLand = (item) => {
    setSelectedLand(item);
    if (item && item.position && onMoveToLocation) {
      onMoveToLocation(item.position.lat, item.position.lng, 17);
    }
    // 상세 스크롤 top으로 리셋
    setTimeout(() => {
      if (detailScrollRef.current) {
        detailScrollRef.current.scrollTop = 0;
      }
    }, 0);
  };

  // ─── 상세 보기 ───
  if (selectedLand) {
    return (
      <div className="h-full bg-white flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLand(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <i className="ri-arrow-left-line text-gray-500"></i>
              </button>
              <h2 className="text-base font-bold text-gray-900">
                토지 실거래 상세
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>

        <div ref={detailScrollRef} className="flex-1 overflow-y-auto">
          {/* 미니맵 */}
          {selectedLand._sideMapData?.paths && (
            <div className="h-[200px] w-full bg-gray-100">
              <MiniMap sideMapData={selectedLand._sideMapData} />
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* 소재지 */}
            <div className="bg-gradient-to-r from-sky-50 to-teal-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">소재지</p>
              <p className="text-base font-bold text-gray-900">
                {selectedLand.address}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] font-bold">
                  {selectedLand.landUse}
                </span>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-bold">
                  {selectedLand.zoning}
                </span>
              </div>
            </div>

            {/* 가격 정보 */}
            {selectedLand.hideTransactionPrice ? (
              // <div className="bg-white border border-gray-100 rounded-xl p-4">
              //   <p className="text-sm font-bold text-gray-900 mb-2">
              //     거래 가격
              //   </p>
              //   <p className="text-sm text-gray-400">
              //     폴리곤 클릭 조회에서는 거래가격을 표시하지 않습니다
              //   </p>
              //   <p className="text-xs text-gray-400 mt-1">
              //     거래가격은 가격 마커 클릭 시 확인할 수 있습니다
              //   </p>
              // </div>
              <></>
            ) : selectedLand.hasPrice ? (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-900">거래 가격</p>
                  {selectedLand.showTransactionDate && (
                    <p className="text-xs text-gray-400">
                      {selectedLand.transactionDate}
                    </p>
                  )}
                </div>
                <p className="text-3xl font-bold text-sky-600">
                  {selectedLand.priceText}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  평당 {selectedLand.pricePerPyeong}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-900 mb-2">
                  거래 가격
                </p>
                <p className="text-sm text-gray-400">실거래 내역 없음</p>
              </div>
            )}

            {/* 토지 정보 그리드 */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "면적", value: selectedLand.areaText },
                { label: "평수", value: selectedLand.areaPyeong },
                { label: "지목", value: selectedLand.landUse },
                { label: "용도지역", value: selectedLand.zoning },
                ...(selectedLand.buildingCoverage
                  ? [
                      {
                        label: "건폐율",
                        value: selectedLand.buildingCoverage,
                      },
                    ]
                  : []),
                ...(selectedLand.floorAreaRatio
                  ? [
                      {
                        label: "용적률",
                        value: selectedLand.floorAreaRatio,
                      },
                    ]
                  : []),
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* 공시지가 정보 */}
            {selectedLand.officialPrice > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-bold text-gray-900 mb-2">공시지가</p>
                <p className="text-lg font-bold text-teal-600">
                  {Math.round(
                    selectedLand.officialPrice * 3.3058,
                  ).toLocaleString()}
                  원/평
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ({Math.round(selectedLand.officialPrice).toLocaleString()}
                  원/㎡)
                </p>
              </div>
            )}

            {/* 주변 토지 시세 */}
            {landTransactions.length > 1 && (
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-bar-chart-grouped-line text-sky-500"></i>
                  </div>
                  주변 토지 시세
                </h4>
                <div className="space-y-2">
                  {landTransactions
                    .filter((lt) => lt.id !== selectedLand.id)
                    .slice(0, 3)
                    .map((lt) => (
                      <div
                        key={lt.id}
                        onClick={() => handleSelectLand(lt)}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-sky-50 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            {lt.address.split(" ").slice(-2).join(" ")}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {lt.areaPyeong} · {lt.landUse}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-sky-600">
                            {lt.priceText}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {lt.pricePerPyeong}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── 목록 보기 ───
  return (
    <div className="h-full bg-white flex flex-col shadow-2xl">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-landscape-line text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                토지 실거래가
              </h2>
              <p className="text-xs text-gray-500">
                총 {landTransactions.length}건
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <i className="ri-close-line text-gray-400"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 줌 레벨 안내 */}
        {zoomLevel < 17 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-zoom-in-line text-sky-500 text-2xl"></i>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              지도를 확대해주세요
            </p>
            <p className="text-xs text-gray-400">
              줌 레벨 17 이상에서 개별 필지의
              <br />
              실거래 정보를 확인할 수 있습니다
            </p>
          </div>
        )}

        {/* 데이터 없음 안내 */}
        {zoomLevel >= 17 && landTransactions.length === 0 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-map-pin-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              실거래 내역이 없습니다
            </p>
            <p className="text-xs text-gray-400">
              현재 지도 영역에 토지 실거래
              <br />
              기록이 있는 필지가 없습니다
            </p>
          </div>
        )}

        {/* 거래 목록 */}
        {landTransactions.map((lt) => (
          <div
            key={lt.id}
            onClick={() => handleSelectLand(lt)}
            className="p-4 border-b border-gray-50 hover:bg-sky-50/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded text-[10px] font-bold">
                {lt.landUse}
              </span>
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                {lt.zoning}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
              {lt.address}
            </p>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p className="text-[10px] text-gray-400">
                  {lt.areaPyeong} ({lt.areaText})
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-sky-600">{lt.priceText}</p>
                <p className="text-[10px] text-gray-400">{lt.pricePerPyeong}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

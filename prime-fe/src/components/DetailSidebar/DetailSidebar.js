import React from "react";
import { useSelector } from "react-redux";
import NaverMapSidebar from "../NaverMap/NaverMapSidebar";
import KakaoMapSidebar from "../KakaoMap/KakaoMapSidebar";
import VWorldMapSidebar from "../VWorldMap/VWorldMapSidebar";
import PriceHistoryChart from "./PriceHistoryChart";
import SkeletonUI from "./SkeletonUI";

function DetailSidebar({ sidebar, setSidebar }) {
  // 최적화된 useSelector - 필요한 상태만 정확히 선택하여 불필요한 렌더링 방지
  const sideMapData = useSelector((state) => state.map.sideMapData,
    // 이전 값과 현재 값이 동일하면 리렌더링 방지
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );
  const unit = useSelector((state) => state.map.unit);
  const currentProvider = useSelector((state) => state.map.currentProvider);
  const closeSidebarHandler = () => {
    setSidebar(false);
  };
  // dealInfo 변수에 deals 배열의 첫번째 값이 있으면 저장 (없으면 undefined)
  const dealInfo = sideMapData?.properties?.realEstatePrices?.deals?.[0] || sideMapData?.properties?.deals?.[0];
  const calculatePercentageDiff = () => {
    if (sideMapData?.properties && dealInfo) {
      const officialPricePerPyeong = sideMapData.properties.government?.gvm_price * 3.3058;
      const dealAmount = Number(dealInfo.dealAmount);
      const realPricePerPyeong = Math.round(
        (dealAmount * 10000) / (sideMapData.properties.landArea ? sideMapData.properties.landArea : sideMapData.properties.land_area / 3.3058)
      );
      const ratioPercentage =
        (realPricePerPyeong / officialPricePerPyeong) * 100;
      return ratioPercentage;
    }
    return null;
  };

  return (
    <div
      className={`fixed top-[60px] right-0 h-[calc(100vh-60px)] w-[350px] bg-white shadow-2xl z-30 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        sidebar ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {sideMapData?.properties ? (
        <>
          <div>
            <div>
              <div className="h-[220px] w-full bg-gray-100">
                {currentProvider === "NAVER" && (
                  <NaverMapSidebar sideMapData={sideMapData} />
                )}
                {currentProvider === "KAKAO" && (
                  <KakaoMapSidebar sideMapData={sideMapData} />
                )}
                {currentProvider === "VWORLD" && (
                  <VWorldMapSidebar sideMapData={sideMapData} />
                )}
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 block">
                        <span>
                          {sideMapData.properties.areaName ? sideMapData.properties.areaName : sideMapData.properties.area_name}{" "}
                          {sideMapData.properties.jibunNum ? sideMapData.properties.jibunNum : sideMapData.properties.jibun_num}
                        </span>
                      </div>
                    </div>
                  </div>
                  {dealInfo ? (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 bg-green-50 border border-green-200">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          거래 완료일 : {dealInfo.dealYear}년{" "}
                          {dealInfo.dealMonth}월{dealInfo.dealDay}일
                        </span>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">지목</span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.landType ? sideMapData.properties.landType : sideMapData.properties.land_type || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">용도</span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.useLandName1
                          ? sideMapData.properties.useLandName1
                          : sideMapData.properties.useland_name?.useland_name1 || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">면적</span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {unit === "pyeong" ? sideMapData.properties.landArea ? Math.round(sideMapData.properties.landArea / 3.3058) +
                          "평" || "-" : Math.round(sideMapData.properties.land_area / 3.3058) + "평" : sideMapData.properties.landArea ? Math.round(sideMapData.properties.landArea) +
                          "㎡" || "-" : Math.round(sideMapData.properties.land_area) + "㎡" || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {unit === "pyeong" ? "공시지가 평당 가격" : "공시지가 ㎡당 가격"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {unit === "pyeong" ? sideMapData.properties.landPrice
                        ? Math.round(sideMapData.properties.landPrice * 3.3058).toLocaleString() + "원/평"
                        : sideMapData.properties.government?.gvm_price
                          ? Math.round(sideMapData.properties.government.gvm_price * 3.3058).toLocaleString() + "원/평"
                          : "-" : sideMapData.properties.landPrice
                          ? Math.round(sideMapData.properties.landPrice).toLocaleString() + "원/㎡"
                          : sideMapData.properties.government?.gvm_price
                            ? Math.round(sideMapData.properties.government.gvm_price).toLocaleString() + "원/㎡"
                            : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        {unit === "pyeong" ? "실거래가 평당 가격" : "실거래가 ㎡당 가격"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {unit === "pyeong" ? dealInfo
                          ? Math.round(
                              (Number(dealInfo.dealAmount) *
                                10000) /
                                (sideMapData.properties.landArea ? sideMapData.properties.landArea : sideMapData.properties.land_area / 3.3058)
                            ).toLocaleString() +
                            "원" +
                            "/평"
                          : "-" : dealInfo
                          ? Math.round(
                              (Number(dealInfo.dealAmount) *
                                10000) /
                                (sideMapData.properties.landArea ? sideMapData.properties.landArea : sideMapData.properties.land_area)
                            ).toLocaleString() +
                            "원" +
                            "/㎡"
                          : "-"}
                      </span>
                      {dealInfo && calculatePercentageDiff() !== null && (
                        <span
                          className="text-xs text-gray-500 block"
                          style={{
                            color:
                              calculatePercentageDiff() > 0 ? "red" : "blue",
                            fontWeight: "bold",
                          }}
                        >
                          공시지가 대비 {calculatePercentageDiff().toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    {dealInfo ? (
                      <div>
                        <span className="text-xs text-gray-500 block">
                          최근 실거래가
                        </span>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {Math.round(
                            Number(dealInfo.dealAmount) *
                              10000
                          ).toLocaleString() + "원"}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs text-gray-500 block">
                          최근 공시지가
                        </span>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {Math.round(
                            sideMapData.properties.landArea *
                              (sideMapData.properties.landPrice / 3.3058)
                          ).toLocaleString() + "원"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        지번 번호
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.jibunNum ? sideMapData.properties.jibunNum : sideMapData.properties.jibun_num || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        토지대장 구분
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.landBookName ? sideMapData.properties.landBookName : sideMapData.properties.land_book_name || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        추가 용도지역
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                      {sideMapData.properties.useLandName2
                          ? sideMapData.properties.useLandName2
                          : sideMapData.properties.useland_name?.useland_name2 || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        토지 이용 상태
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.useLandState ? sideMapData.properties.useLandState : sideMapData.properties.useland_state || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        지형 특성
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.landHeight ? sideMapData.properties.landHeight : sideMapData.properties.land_height || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        토지 형태
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.landShape ? sideMapData.properties.landShape : sideMapData.properties.land_shape || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        소유 형태
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.shareState ? sideMapData.properties.shareState : sideMapData.properties.share_state || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        소유자 수
                      </span>
                      <span className="text-sm font-semibold text-gray-900 block">
                        {sideMapData.properties.sharePeople ? sideMapData.properties.sharePeople + "명" : sideMapData.properties.share_people + "명" || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-sm font-semibold text-gray-900 block">년도별 토지가</span>
                    <div className="mt-2 h-[200px]">
                      <PriceHistoryChart sideMapData={sideMapData} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <button
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={closeSidebarHandler}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </>
      ) : (
        <SkeletonUI />
      )}
    </div>
  );
}

// React.memo로 감싸서 props가 변경되지 않으면 리렌더링 방지
export default React.memo(DetailSidebar, (prevProps, nextProps) => {
  // sidebar 상태가 변경되지 않았으면 리렌더링 방지
  return prevProps.sidebar === nextProps.sidebar;
});

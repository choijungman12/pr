import React, { useState } from "react";
import { calculateZoneStats } from "../../data/parcelData";

export default function ZoneDrawingPanel({ parcels, onClose, onReset }) {
  const [selectedParcel, setSelectedParcel] = useState(null);
  const stats = calculateZoneStats(parcels);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  const formatPrice = (price) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억원`;
    }
    if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}만원`;
    }
    return `${formatNumber(price)}원`;
  };

  return (
    <div className="absolute left-20 top-4 bottom-4 w-96 bg-white rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="ri-map-pin-range-line text-xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold">구역계 설정 결과</h2>
            <p className="text-xs text-purple-100">번지별 부동산 정보</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">총 면적</div>
            <div className="text-lg font-bold text-purple-600">
              {formatNumber(stats.totalArea)}㎡
            </div>
            <div className="text-xs text-gray-400">
              {formatNumber(Math.round(stats.totalArea * 0.3025))}평
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">총 필지 수</div>
            <div className="text-lg font-bold text-purple-600">
              {stats.totalParcels}필지
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">평균 공시지가</div>
            <div className="text-sm font-bold text-gray-800">
              {formatNumber(stats.avgOfficialPrice)}원/㎡
            </div>
            <div className="text-xs text-gray-400">
              {formatNumber(Math.round(stats.avgOfficialPrice * 3.3))}원/평
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">총 공시지가</div>
            <div className="text-sm font-bold text-gray-800">
              {formatPrice(stats.totalOfficialValue)}
            </div>
          </div>
        </div>

        <div className="mt-3 bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">노후건축물 비율</span>
            <span className="text-sm font-bold text-orange-600">
              {stats.oldBuildingRatio}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(stats.oldBuildingRatio, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            평균 준공년도: {stats.avgBuildYear}년
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-3 bg-white hover:bg-gray-50 text-purple-600 font-medium py-2.5 rounded-xl border-2 border-purple-200 transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line"></i>
          구역계 초기화
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <i className="ri-file-list-3-line text-purple-600"></i>
          번지별 상세 정보 ({parcels.length}건)
        </div>

        {parcels.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="ri-map-pin-line text-4xl mb-3 block"></i>
            <p className="text-sm">지도에서 구역계를 그려주세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parcels.map((parcel) => (
              <div
                key={parcel.id}
                onClick={() =>
                  setSelectedParcel(
                    selectedParcel?.id === parcel.id ? null : parcel
                  )
                }
                className="bg-white border-2 border-gray-200 hover:border-purple-300 rounded-xl p-3 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-800 mb-1">
                      {parcel.address}
                    </div>
                    <div className="text-xs text-gray-500">
                      소유자: {parcel.owner}
                    </div>
                  </div>
                  <i
                    className={`ri-arrow-${
                      selectedParcel?.id === parcel.id ? "up" : "down"
                    }-s-line text-gray-400`}
                  ></i>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-purple-50 rounded-lg px-2 py-1.5">
                    <div className="text-gray-500">면적</div>
                    <div className="font-bold text-purple-600">
                      {formatNumber(parcel.area)}㎡
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg px-2 py-1.5">
                    <div className="text-gray-500">공시지가</div>
                    <div className="font-bold text-blue-600">
                      {formatNumber(parcel.officialPrice)}원/㎡
                    </div>
                  </div>
                </div>

                {selectedParcel?.id === parcel.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-500 mb-1">용도지역</div>
                      <div className="text-xs font-medium text-gray-800">
                        {parcel.zoneType}
                      </div>
                    </div>

                    {parcel.buildingInfo && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-2">
                          건축물 정보
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">용도</span>
                            <span className="font-medium text-gray-800">
                              {parcel.buildingInfo.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">구조</span>
                            <span className="font-medium text-gray-800">
                              {parcel.buildingInfo.structure}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">층수</span>
                            <span className="font-medium text-gray-800">
                              {parcel.buildingInfo.floors}층
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">준공년도</span>
                            <span className="font-medium text-gray-800">
                              {parcel.buildingInfo.buildYear}년
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">건축면적</span>
                            <span className="font-medium text-gray-800">
                              {formatNumber(parcel.buildingInfo.area)}㎡
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {parcel.recentTransaction && (
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-2">
                          최근 실거래
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">거래일</span>
                            <span className="font-medium text-gray-800">
                              {parcel.recentTransaction.date}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">거래가</span>
                            <span className="font-bold text-green-600">
                              {formatNumber(parcel.recentTransaction.price)}만원
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">평당가</span>
                            <span className="font-medium text-gray-800">
                              {formatNumber(
                                parcel.recentTransaction.pricePerPyeong
                              )}
                              만원
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

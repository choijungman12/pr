// 번지별 부동산 정보 mock 데이터
export const parcelDataSample = [
  {
    id: "p1",
    address: "서울특별시 용산구 한남동 123-45",
    owner: "김철수",
    area: 245.5,
    officialPrice: 8500000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "단독주택",
      structure: "철근콘크리트조",
      floors: 2,
      buildYear: 1985,
      area: 180.2,
    },
    recentTransaction: {
      date: "2023.08",
      price: 125000,
      pricePerPyeong: 15000,
    },
    position: { lat: 37.534, lng: 126.997 },
  },
  {
    id: "p2",
    address: "서울특별시 용산구 한남동 123-46",
    owner: "이영희",
    area: 198.3,
    officialPrice: 8200000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "다가구주택",
      structure: "철근콘크리트조",
      floors: 3,
      buildYear: 1992,
      area: 220.5,
    },
    recentTransaction: {
      date: "2024.01",
      price: 98000,
      pricePerPyeong: 14500,
    },
    position: { lat: 37.5342, lng: 126.9972 },
  },
  {
    id: "p3",
    address: "서울특별시 용산구 한남동 123-47",
    owner: "박민수",
    area: 312.8,
    officialPrice: 8800000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "단독주택",
      structure: "벽돌조",
      floors: 2,
      buildYear: 1978,
      area: 165.3,
    },
    position: { lat: 37.5338, lng: 126.9968 },
  },
  {
    id: "p4",
    address: "서울특별시 용산구 한남동 123-48",
    owner: "최지은",
    area: 276.4,
    officialPrice: 8600000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "다세대주택",
      structure: "철근콘크리트조",
      floors: 4,
      buildYear: 1995,
      area: 380.7,
    },
    recentTransaction: {
      date: "2023.11",
      price: 142000,
      pricePerPyeong: 15200,
    },
    position: { lat: 37.5344, lng: 126.9974 },
  },
  {
    id: "p5",
    address: "서울특별시 용산구 한남동 123-49",
    owner: "정수현",
    area: 189.2,
    officialPrice: 8300000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "단독주택",
      structure: "철근콘크리트조",
      floors: 2,
      buildYear: 1988,
      area: 145.8,
    },
    position: { lat: 37.5336, lng: 126.9966 },
  },
  {
    id: "p6",
    address: "서울특별시 용산구 한남동 123-50",
    owner: "강민지",
    area: 234.6,
    officialPrice: 8700000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "다가구주택",
      structure: "철근콘크리트조",
      floors: 3,
      buildYear: 1990,
      area: 285.4,
    },
    recentTransaction: {
      date: "2024.02",
      price: 118000,
      pricePerPyeong: 14800,
    },
    position: { lat: 37.5346, lng: 126.9976 },
  },
  {
    id: "p7",
    address: "서울특별시 용산구 한남동 123-51",
    owner: "윤태호",
    area: 298.5,
    officialPrice: 8900000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "단독주택",
      structure: "철근콘크리트조",
      floors: 2,
      buildYear: 1982,
      area: 195.6,
    },
    position: { lat: 37.5334, lng: 126.9964 },
  },
  {
    id: "p8",
    address: "서울특별시 용산구 한남동 123-52",
    owner: "임서연",
    area: 215.7,
    officialPrice: 8400000,
    zoneType: "제2종일반주거지역",
    buildingInfo: {
      type: "다세대주택",
      structure: "철근콘크리트조",
      floors: 4,
      buildYear: 1998,
      area: 425.3,
    },
    recentTransaction: {
      date: "2023.09",
      price: 135000,
      pricePerPyeong: 15500,
    },
    position: { lat: 37.5348, lng: 126.9978 },
  },
];

// 구역계 내부 번지 자동 추출 함수 (폴리곤 내부 점 판정)
export function getParcelsByPolygon(polygon) {
  if (polygon.length < 3) return [];

  return parcelDataSample.filter((parcel) => {
    return isPointInPolygon(parcel.position, polygon);
  });
}

// 점이 폴리곤 내부에 있는지 판정 (Ray Casting Algorithm)
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const isYCross = (yi > point.lat) !== (yj > point.lat);
    const intersect =
      isYCross &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// 구역 통계 계산
export function calculateZoneStats(parcels) {
  if (parcels.length === 0) {
    return {
      totalArea: 0,
      totalParcels: 0,
      avgOfficialPrice: 0,
      totalOfficialValue: 0,
      oldBuildingRatio: 0,
      avgBuildYear: 0,
    };
  }

  const totalArea = parcels.reduce((sum, p) => sum + p.area, 0);
  const totalOfficialValue = parcels.reduce(
    (sum, p) => sum + p.area * p.officialPrice,
    0
  );
  const avgOfficialPrice = totalOfficialValue / totalArea;

  const buildingsWithYear = parcels.filter((p) => p.buildingInfo?.buildYear);
  const oldBuildings = buildingsWithYear.filter((p) => {
    const age = new Date().getFullYear() - (p.buildingInfo?.buildYear || 0);
    return age >= 30;
  });
  const oldBuildingRatio =
    buildingsWithYear.length > 0
      ? (oldBuildings.length / buildingsWithYear.length) * 100
      : 0;

  const avgBuildYear =
    buildingsWithYear.length > 0
      ? buildingsWithYear.reduce(
          (sum, p) => sum + (p.buildingInfo?.buildYear || 0),
          0
        ) / buildingsWithYear.length
      : 0;

  return {
    totalArea: Math.round(totalArea * 10) / 10,
    totalParcels: parcels.length,
    avgOfficialPrice: Math.round(avgOfficialPrice),
    totalOfficialValue: Math.round(totalOfficialValue),
    oldBuildingRatio: Math.round(oldBuildingRatio * 10) / 10,
    avgBuildYear: Math.round(avgBuildYear),
  };
}

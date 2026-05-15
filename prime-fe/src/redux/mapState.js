import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const DEFAULT_LOCATION = {
  lat: 37.50451178465107,
  lng: 127.04897357855684,
};

const ADDRESS_SEARCH_NOT_FOUND_MESSAGE =
  "입력하신 지번 주소를 확인하지 못했습니다. 동·리와 번지수를 다시 확인한 뒤 다시 검색해 주세요.";

const initialState = {
  currentProvider: "NAVER",
  mapTypes: {
    NAVER: "NORMAL",
    KAKAO: "ROADMAP",
    VWORLD: "GRAPHIC",
  },
  isLayerVisible: false,
  isPublicHouseVisible: true,
  selectedFeature: null,
  selectedLocation: null,
  currentMapFlag: 2,
  currentLocation: DEFAULT_LOCATION,
  moveToCenter: false,
  zoomLevel: 17,
  mapCenter: DEFAULT_LOCATION,
  currentBounds: null,
  polygonsRequestId: null,
  polygonsZoomLevel: null,
  pendingMapMove: null,       // { lat, lng, zoom } - 패널에서 지도 이동 요청
  polygons: [],
  publicHouse: [],
  sideMapData: {},
  searchStatus: 'idle',
  searchFeedbackMessage: "",
  unit: "pyeong",
  isAreaCalculationMode: false,
  areaCalculationPoints: [],
  // 카테고리 네비게이션 (prime 마이그레이션)
  activeCategory: 'land',        // 기본값: 토지
  activeDevSub: 'all',           // 개발 서브카테고리
  panelOpen: false,              // 카테고리 패널 열림 상태
  panelType: null,               // 현재 패널 타입
  // 통화 선택 (KRW / USD / USDT)
  currency: 'KRW',
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function expandBounds(bounds, ratio = 0.15) {
  const { neLat, neLng, swLat, swLng } = bounds;
  const latSpan = Math.abs(neLat - swLat);
  const lngSpan = Math.abs(neLng - swLng);
  const latPad = latSpan * ratio;
  const lngPad = lngSpan * ratio;

  return {
    neLat: clamp(neLat + latPad, -90, 90),
    neLng: clamp(neLng + lngPad, -180, 180),
    swLat: clamp(swLat - latPad, -90, 90),
    swLng: clamp(swLng - lngPad, -180, 180),
  };
}

function extractCoordinatePairs(input, acc = []) {
  if (!Array.isArray(input)) return acc;

  // [lng, lat] 형태
  if (
    input.length >= 2 &&
    typeof input[0] === "number" &&
    typeof input[1] === "number"
  ) {
    acc.push([input[0], input[1]]);
    return acc;
  }

  input.forEach((item) => extractCoordinatePairs(item, acc));
  return acc;
}

function buildBasePolygon(feature, zoom) {
  const rawCoords = zoom >= 17 ? feature.geo : feature.coordinates; // 원본
  const coords = extractCoordinatePairs(rawCoords);

  if (coords.length === 0) {
    return {
      bounds: { neLat: 0, neLng: 0, swLat: 0, swLng: 0 },
      paths: [],
    };
  }

  const lngs = coords.map((coord) => coord[0]);
  const lats = coords.map((coord) => coord[1]);

  const bounds = {
    neLat: Math.max(...lats),
    neLng: Math.max(...lngs),
    swLat: Math.min(...lats),
    swLng: Math.min(...lngs),
  };

  const paths = coords.map((coord) => ({
    lat: coord[1],
    lng: coord[0],
  }));

  return { bounds, paths };
}

/**
 * 줌 레벨별 속성(properties)와 options 결정
 */
function buildPolygonProperties(feature, zoom) {
  if (zoom >= 17) {
    return {
      properties: {
        pnu: feature.pnu,
        point: feature.point,
        areaName: feature.areaName,
        landBookName: feature.landBookName,
        landBookNum: feature.landBookNum,
        jibunName: feature.jibunName,
        jibunNum: feature.jibunNum,
        landArea: feature.landArea,
        landPrice: feature.landPrice,
        useLandName1: feature.useLandName1,
        useLandName2: feature.useLandName2,
        useLandState: feature.useLandState,
        landHeight: feature.landHeight,
        landShape: feature.landShape,
        loadShape: feature.loadShape,
        asisPrices: feature.asisPrices,
        shareState: feature.shareState,
        sharePeople: feature.sharePeople,
        ageRange: feature.ageRange,
        liveState: feature.liveState,
        nationState: feature.nationState,
        diffShareState: feature.diffShareState,
        diffShareDay: feature.diffShareDay,
        landType: feature.landType,
        realEstatePrices: feature.realEstatePrices,
      },
      options: {
        strokeColor: "#9B7EBD",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: "#D4BEE4",
        fillOpacity: 0.3,
      },
    };
  } else if (zoom >= 14 && zoom <= 16) {
    return {
      properties: {
        empcd: feature.empcd,
        coladmse: feature.coladmse,
        coordinates: feature.coordinates,
        emdnm: feature.emdnm,
        dealCount: feature.dealCount,
        avgDealAmount_all: feature.avgDealAmount_all,
        avgDealAmount_m: feature.avgDealAmount_m,
        avgDealAmount_p: feature.avgDealAmount_p,
        point: feature.point,
      },
      options: {
        strokeColor: "#ea8c01",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: "#ea8c01",
        fillOpacity: 0.3,
      },
    };
  } else if (zoom >= 11 && zoom <= 13) {
    return {
      properties: {
        admSectCode: feature.admSectCode,
        sggNm: feature.sggNm,
        coordinates: feature.coordinates,
        dealCount: feature.dealCount,
        avgDealAmount_all: feature.avgDealAmount_all,
        avgDealAmount_m: feature.avgDealAmount_m,
        avgDealAmount_p: feature.avgDealAmount_p,
        point: feature.point,
      },
      options: {
        strokeColor: "#ea8c01",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: "#ea8c01",
        fillOpacity: 0.3,
      },
    };
  }

  return null;
}

export const fetchPolygons = createAsyncThunk(
  "map/fetchPolygons",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const bounds = state.map.currentBounds;
      const zoom = state.map.zoomLevel;

      // 줌 < 11: 그냥 빈 배열
      if (zoom < 11) {
        return { polygons: [], zoom };
      }
      if (!bounds) {
        return { polygons: [], zoom };
      }

      const requestBounds = expandBounds(bounds, 0.2);
      const { neLat, neLng, swLat, swLng } = requestBounds;
      if (!neLat || !neLng || !swLat || !swLng) {
        return { polygons: [], zoom };
      }

      // ============ 1) 줌 레벨별 API URL 결정 ============
      let url = "";
      if (zoom >= 17) {
        url = `${process.env.REACT_APP_BACKEND_URL}/polygon/transactions`;
      } else if (zoom >= 14 && zoom <= 16) {
        url = `${process.env.REACT_APP_BACKEND_URL}/polygon/emd`;
      } else if (zoom >= 11 && zoom <= 13) {
        url = `${process.env.REACT_APP_BACKEND_URL}/polygon/sgg`;
      }

      // 요청 보내기
      const response = await axios.get(url, {
        params: { neLat, neLng, swLat, swLng },
      });
      // if (!response.data || !Array.isArray(response.data)) {
      //   console.log("No polygon data received");
      //   return [];
      // }

      // ============ 2) response.data -> polygon[] ============
      const serializedPolygons = zoom >= 17 ? response.data.data.map((feature) => {
        try {
          const base = buildBasePolygon(feature, zoom);

          return {
            ...base,
            id: feature.id,
            properties: {
              ...(feature.data || {}),
              point: feature.data?.point || feature.point || null,
              isRegistered:
                feature.data?.isRegistered ?? feature.isRegistered ?? false,
            },
            options: {
              strokeColor: "#9B7EBD",
              strokeOpacity: 0.5,
              strokeWeight: 1,
              fillColor: "#D4BEE4",
              fillOpacity: 0.3,
            },
          };
        } catch (serializeError) {
          console.error("Serialization error:", serializeError);
          return null;
        }
      })
      : response.data.data
        .map((feature) => {
          try {
            const base = buildBasePolygon(feature, zoom);
            const extra = buildPolygonProperties(feature, zoom);
            if (!extra) {
              // zoom 범위 외 등
              return null;
            }

            return {
              ...base, // { bounds, paths }
              properties: extra.properties,
              options: extra.options,
            };
          } catch (serializeError) {
            console.error("Serialization error:", serializeError);
            return null;
          }
        })
        .filter((polygon) => polygon !== null);

      return { polygons: serializedPolygons, zoom };
    } catch (error) {
      console.error("Polygon fetch error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 공공주택 API 호출
export const fetchPublicHouse = createAsyncThunk(
  "map/fetchPublicHouse",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const zoom = state.map.zoomLevel;
      const bounds = state.map.currentBounds;
      if (!bounds) {
        return [];
      }
      if (zoom < 13) {
        return [];
      }
      const requestBounds = expandBounds(bounds, 0.2);
      const { neLat, neLng, swLat, swLng } = requestBounds;
      if (!neLat || !neLng || !swLat || !swLng) {
        return [];
      }
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/polygon/publichouse`,
        {
          params: { neLat, neLng, swLat, swLng },
        }
      );
      return response.data;
    } catch (error) {
      console.error("PublicHouse fetch error:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 주소 검색 API 호출을 위한 비동기 액션
export const searchAddress = createAsyncThunk(
  "map/searchAddress",
  async (address, { _, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/geocoding`,
        {
          params: { address },
        }
      );

      const addressData = response.data?.data;
      const isEmptyObject =
        addressData &&
        typeof addressData === "object" &&
        !Array.isArray(addressData) &&
        Object.keys(addressData).length === 0;

      if (!addressData || isEmptyObject) {
        return rejectWithValue(ADDRESS_SEARCH_NOT_FOUND_MESSAGE);
      }

      const lat = parseFloat(addressData.latitude);
      const lng = parseFloat(addressData.longitude);
      const normalizedAddress =
        typeof addressData.address === "string" && addressData.address.trim()
          ? addressData.address.trim()
          : address.trim();

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return rejectWithValue(ADDRESS_SEARCH_NOT_FOUND_MESSAGE);
      }

      return { lat, lng, address: normalizedAddress };
    } catch (error) {
      console.error("Address search error:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          "주소 검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
    }
  }
);

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    toggleAreaCalculationMode: (state) => {
      state.isAreaCalculationMode = !state.isAreaCalculationMode;
      if (!state.isAreaCalculationMode) {
        state.areaCalculationPoints = [];
      }
    },
    addAreaCalculationPoint: (state, action) => {
      state.areaCalculationPoints.push(action.payload);
    },
    clearAreaCalculationPoints: (state) => {
      state.areaCalculationPoints = [];
    },
    setMapProvider: (state, action) => {
      state.currentProvider = action.payload;
    },
    toggleMapType: (state) => {
      const flag = state.currentMapFlag;
      if (flag === 1) {
        state.mapTypes.NAVER = "NORMAL";
        state.mapTypes.KAKAO = "ROADMAP";
        state.mapTypes.VWORLD = "GRAPHIC";
        state.currentMapFlag = 2;
      } else {
        state.mapTypes.NAVER = "HYBRID";
        state.mapTypes.KAKAO = "HYBRID";
        state.mapTypes.VWORLD = "PHOTO_HYBRID";
        state.currentMapFlag = 1;
      }
    },
    toggleLayer: (state) => {
      state.isLayerVisible = !state.isLayerVisible;
    },
    togglePublicHouse: (state) => {
      state.isPublicHouseVisible = !state.isPublicHouseVisible;
    },
    setMapType: (state, action) => {
      const { provider, type } = action.payload;
      state.mapTypes[provider] = type;
    },
    setSelectedFeature: (state, action) => {
      state.selectedFeature = action.payload;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    setCurrentPolygon: (state, action) => {
      state.currentPolygon = action.payload;
    },
    toggleSidebar: (state, action) => {
      state.isSidebarOpen =
        action.payload !== undefined ? action.payload : !state.isSidebarOpen;
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    moveToCenter: (state) => {
      state.moveToCenter = true;
    },
    resetMoveToCenter: (state) => {
      state.moveToCenter = false;
    },
    setLayerVisible: (state, action) => {
      state.isLayerVisible = action.payload;
    },
    setMapFlag: (state, action) => {
      state.currentMapFlag = action.payload;
    },
    setMoveToCenter: (state, action) => {
      state.moveToCenter = action.payload;
    },
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    updateCurrentBounds: (state, action) => {
      state.currentBounds = action.payload;
    },
    // sidebarMapData 중복방지
    sidebarMapData: (state, action) => {
      const newData = action.payload;
      if (JSON.stringify(state.sideMapData) !== JSON.stringify(newData)) {
        state.sideMapData = newData;
      }
    },
    // 주소 검색 중복방지(상태 추가)
    resetSearchStatus: (state) => {
      state.searchStatus = 'idle';
      state.searchFeedbackMessage = "";
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
    // 단위 토글 액션 추가
    toggleUnit: (state) => {
      state.unit = state.unit === "m2" ? "pyeong" : "m2";
    },
    // 카테고리 네비게이션 액션 (prime 마이그레이션)
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
      state.panelOpen = true;
      state.panelType = action.payload;
    },
    setActiveDevSub: (state, action) => {
      state.activeDevSub = action.payload;
    },
    openPanel: (state, action) => {
      state.panelOpen = true;
      state.panelType = action.payload;
    },
    closePanel: (state) => {
      state.panelOpen = false;
      state.panelType = null;
      state.sideMapData = {};
    },
    setPendingMapMove: (state, action) => {
      state.pendingMapMove = action.payload; // { lat, lng, zoom }
    },
    clearPendingMapMove: (state) => {
      state.pendingMapMove = null;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload; // 'KRW' | 'USD' | 'USDT'
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchPolygons.pending, (state, action) => {
      state.polygonsRequestId = action.meta.requestId;
    })
    .addCase(fetchPolygons.fulfilled, (state, action) => {
      if (state.polygonsRequestId !== action.meta.requestId) {
        return;
      }
      state.polygons = action.payload?.polygons || [];
      state.polygonsZoomLevel = action.payload?.zoom ?? null;
      state.polygonsRequestId = null;
    })
    .addCase(fetchPolygons.rejected, (state, action) => {
      if (state.polygonsRequestId !== action.meta.requestId) {
        return;
      }
      state.polygonsRequestId = null;
    })
    .addCase(fetchPublicHouse.fulfilled, (state, action) => {
      state.publicHouse = action.payload;
    })
    .addCase(searchAddress.pending, (state) => {
      state.searchStatus = 'loading';
      state.searchFeedbackMessage = "";
    })
    .addCase(searchAddress.fulfilled, (state, action) => {
      state.searchStatus = 'succeeded';
      state.searchFeedbackMessage = "";
      state.selectedLocation = action.payload;
      state.mapCenter = action.payload;
    })
    .addCase(searchAddress.rejected, (state, action) => {
      state.searchStatus = 'failed';
      state.searchFeedbackMessage =
        typeof action.payload === "string"
          ? action.payload
          : "주소 검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    });
  },
});

export const {
  setMapProvider,
  toggleMapType,
  toggleLayer,
  togglePublicHouse,
  setMapType,
  toggleLayerVisibility,
  togglePublicHouseVisibility,
  toggleMapFlag,
  setCurrentLocation,
  resetMoveToCenter,
  setZoomLevel,
  setMapCenter,
  updateCurrentBounds,
  setSelectedFeature,
  toggleUnit,
  toggleAreaCalculationMode,
  addAreaCalculationPoint,
  clearAreaCalculationPoints,
  sidebarMapData,
  moveToCenter,
  resetSearchStatus,
  clearSelectedLocation,
  setActiveCategory,
  setActiveDevSub,
  openPanel,
  closePanel,
  setLayerVisible,
  setPendingMapMove,
  clearPendingMapMove,
  setCurrency,
} = mapSlice.actions;

export default mapSlice.reducer;

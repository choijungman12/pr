export const ADDRESS_SEARCH_NOT_FOUND_MESSAGE =
  "입력하신 지번 주소를 확인하지 못했습니다. 동·리와 번지수를 다시 확인한 뒤 다시 검색해 주세요.";

// deals 배열의 각 항목은 백엔드 real_estate_prices.deals 원문을
// 폼 편집용 필드 이름으로 바꿔 담는 기본 shape다.
export const EMPTY_DEAL_ITEM = {
  dealAmount: "",
  dealYear: "",
  dealMonth: "",
  dealDay: "",
  transactionDate: "",
  estateAgentSggNm: "",
  shareDealingType: "",
  cDealType: "",
  cDealDay: "",
};

const REGION_PREFIXES = [
  { keywords: ["서울특별시", "서울"], code: "seoul" },
  { keywords: ["부산광역시", "부산"], code: "busan" },
  { keywords: ["대구광역시", "대구"], code: "daegu" },
  { keywords: ["인천광역시", "인천"], code: "incheon" },
  { keywords: ["광주광역시", "광주"], code: "gwangju" },
  { keywords: ["대전광역시", "대전"], code: "daejeon" },
  { keywords: ["울산광역시", "울산"], code: "ulsan" },
  { keywords: ["세종특별자치시", "세종"], code: "sejong" },
  { keywords: ["경기도"], code: "gyeonggi" },
  { keywords: ["강원특별자치도", "강원도", "강원"], code: "gangwon" },
  { keywords: ["충청북도", "충북"], code: "chungcheongbuk" },
  { keywords: ["충청남도", "충남"], code: "chungcheongnam" },
  { keywords: ["전북특별자치도", "전라북도", "전북"], code: "jeollabuk" },
  { keywords: ["전라남도", "전남"], code: "jeollanam" },
  { keywords: ["경상북도", "경북"], code: "gyeongsangbuk" },
  { keywords: ["경상남도", "경남"], code: "gyeongsangnam" },
  { keywords: ["제주특별자치도", "제주"], code: "jeju" },
];

// 서버 응답과 사용자 입력이 number/string/null로 섞여 들어오기 때문에
// payload 조합 전에는 항상 문자열로 한 번 정규화한다.
function stringifyValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toTrimmedString(value) {
  return stringifyValue(value).trim();
}

function toOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) return "";

  const next = Number(
    stringifyValue(value)
      .replace(/,/g, "")
      .trim(),
  );
  return Number.isFinite(next) ? next : "";
}

function normalizePoint(point) {
  if (!Array.isArray(point) || point.length < 2) return [];

  const lng = Number(point[0]);
  const lat = Number(point[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [];

  return [lng, lat];
}

// createEmptyRegisterDraft는 등록 폼이 기대하는 전체 draft shape를 보장한다.
// 응답이 일부 비어 있어도 form 렌더링이 깨지지 않도록 nested field까지 초기화한다.
export function createEmptyRegisterDraft(overrides = {}) {
  return {
    region: "",
    geo: [],
    point: [],
    data: {
      pnu: "",
      land_area: "",
      dealing_gbn: "",
      useland_name: {
        useland_name1: "",
        useland_name2: "",
      },
      area_name: "",
      share_state: "",
      share_people: "",
      age_range: "",
      live_state: "",
      nation_state: "",
      diff_share_state: "",
      diff_share_day: "",
      land_type: "",
      jibun_num: "",
      useland_state: "",
      land_height: "",
      land_shape: "",
      load_shape: "",
      land_book_name: "",
      government: {
        gvm_price: "",
        gvm_price1: "",
        gvm_price2: "",
        gvm_price3: "",
        gvm_price4: "",
      },
      deals: [],
    },
    ...overrides,
  };
}

export function extractLocationLabel(value) {
  if (!value) return "";

  const tokens = stringifyValue(value)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (tokens.length === 0) return "";

  const firstToken = tokens[0];
  const startIndex = /[시도]$/.test(firstToken) ? 1 : 0;
  return tokens.slice(startIndex, startIndex + 2).join(" ");
}

export function buildAddressSearchResult(query, addressData) {
  // geocoding 응답은 latitude/longitude 또는 lat/lng 둘 다 가능해서
  // 여기서 화면 공통 구조로 한 번 맞춘다.
  const lat = parseFloat(addressData?.latitude ?? addressData?.lat);
  const lng = parseFloat(addressData?.longitude ?? addressData?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const address = [
    addressData?.address,
    addressData?.roadAddress,
    addressData?.jibunAddress,
    query,
  ].find((item) => typeof item === "string" && item.trim());

  const location = extractLocationLabel(query) || extractLocationLabel(address);

  return {
    address,
    lat,
    lng,
    location,
    label: location || address,
  };
}

export function resolveRegionFromAddress(address, availableRegions = []) {
  const normalizedAddress = toTrimmedString(address);
  if (!normalizedAddress) return "";

  const matchedRegion = REGION_PREFIXES.find(({ keywords }) =>
    keywords.some((keyword) => normalizedAddress.startsWith(keyword)),
  );

  if (!matchedRegion) return "";
  if (
    availableRegions.length > 0 &&
    !availableRegions.includes(matchedRegion.code)
  ) {
    return "";
  }

  return matchedRegion.code;
}

// polygon geo는 [ [lng, lat], ... ] 또는 [ [ [lng, lat], ... ] ] 두 포맷이 섞여 들어올 수 있다.
// 등록 payload에서는 항상 ring 배열 형태로 맞춘다.
export function normalizePolygonGeo(geo) {
  if (!Array.isArray(geo) || geo.length === 0) return [];

  if (Array.isArray(geo[0]) && typeof geo[0][0] === "number") {
    return [
      geo
        .map((coord) => [Number(coord[0]), Number(coord[1])])
        .filter(
          (coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]),
        ),
    ];
  }

  if (Array.isArray(geo[0]) && Array.isArray(geo[0][0])) {
    return geo.map((ring) =>
      ring
        .map((coord) => [Number(coord[0]), Number(coord[1])])
        .filter(
          (coord) => Number.isFinite(coord[0]) && Number.isFinite(coord[1]),
        ),
    );
  }

  return [];
}

export function mapPolygonToRegisterDraft(polygon, { region, point }) {
  // 실거래가 원문 필드는 snake_case라서,
  // 폼 화면에서는 camelCase 편집 필드로 바꿔 저장한다.
  const deals = Array.isArray(polygon?.real_estate_prices?.deals)
    ? polygon.real_estate_prices.deals.map((deal) => ({
        dealAmount: stringifyValue(deal?.deal_amount),
        dealYear: stringifyValue(deal?.deal_year),
        dealMonth: stringifyValue(deal?.deal_month),
        dealDay: stringifyValue(deal?.deal_day),
        transactionDate: `${stringifyValue(deal?.deal_year)}${stringifyValue(
          deal?.deal_month,
        ).padStart(2, "0")}${stringifyValue(deal?.deal_day).padStart(2, "0")}`,
        estateAgentSggNm: stringifyValue(deal?.estate_agent_sgg_nm),
        shareDealingType: stringifyValue(deal?.share_dealing_type),
        cDealType: stringifyValue(deal?.c_deal_type),
        cDealDay: stringifyValue(deal?.c_deal_day),
      }))
    : [];

  return createEmptyRegisterDraft({
    region: stringifyValue(region),
    geo: normalizePolygonGeo(polygon?.geo),
    point: normalizePoint(point),
    data: {
      pnu: stringifyValue(polygon?.pnu),
      land_area: stringifyValue(polygon?.land_area),
      dealing_gbn: stringifyValue(polygon?.real_estate_prices?.dealing_gbn),
      useland_name: {
        useland_name1: stringifyValue(polygon?.use_land_name1),
        useland_name2: stringifyValue(polygon?.use_land_name2),
      },
      area_name: stringifyValue(polygon?.area_name),
      share_state: stringifyValue(polygon?.share_state),
      share_people: stringifyValue(polygon?.share_people),
      age_range: stringifyValue(polygon?.age_range),
      live_state: stringifyValue(polygon?.live_state),
      nation_state: stringifyValue(polygon?.nation_state),
      diff_share_state: stringifyValue(polygon?.diff_share_state),
      diff_share_day: stringifyValue(polygon?.diff_share_day),
      land_type: stringifyValue(polygon?.land_type),
      jibun_num: stringifyValue(polygon?.jibun_num),
      useland_state: stringifyValue(polygon?.use_land_state),
      land_height: stringifyValue(polygon?.land_height),
      land_shape: stringifyValue(polygon?.land_shape),
      load_shape: stringifyValue(polygon?.load_shape),
      land_book_name: stringifyValue(polygon?.land_book_name),
      government: {
        gvm_price: stringifyValue(polygon?.land_price),
        gvm_price1: stringifyValue(polygon?.asis_prices?.price1),
        gvm_price2: stringifyValue(polygon?.asis_prices?.price2),
        gvm_price3: stringifyValue(polygon?.asis_prices?.price3),
        gvm_price4: stringifyValue(polygon?.asis_prices?.price4),
      },
      deals,
    },
  });
}

export function buildLandRegisterPayload({ basicInfo, draft }) {
  // point와 geo는 draft 값이 비어 있을 수 있어서
  // 마지막에는 basicInfo 좌표를 fallback으로 사용한다.
  const point =
    draft?.point?.length === 2
      ? normalizePoint(draft.point)
      : normalizePoint([basicInfo?.lng, basicInfo?.lat]);

  const geo = normalizePolygonGeo(draft?.geo);

  return {
    region: toTrimmedString(draft?.region || basicInfo?.region),
    geo,
    point,
    // sale_price는 사용자가 1페이지에서 입력한 원문 문자열을 그대로 서버에 보낸다.
    sale_price: toTrimmedString(basicInfo?.price),
    data: {
      pnu: toTrimmedString(draft?.data?.pnu),
      land_area: toOptionalNumber(draft?.data?.land_area),
      dealing_gbn: toTrimmedString(draft?.data?.dealing_gbn),
      useland_name: {
        useland_name1: toTrimmedString(draft?.data?.useland_name?.useland_name1),
        useland_name2: toTrimmedString(draft?.data?.useland_name?.useland_name2),
      },
      area_name: toTrimmedString(draft?.data?.area_name),
      share_state: toTrimmedString(draft?.data?.share_state),
      share_people: toOptionalNumber(draft?.data?.share_people),
      age_range: toTrimmedString(draft?.data?.age_range),
      live_state: toTrimmedString(draft?.data?.live_state),
      nation_state: toTrimmedString(draft?.data?.nation_state),
      diff_share_state: toTrimmedString(draft?.data?.diff_share_state),
      diff_share_day: toTrimmedString(draft?.data?.diff_share_day),
      land_type: toTrimmedString(draft?.data?.land_type),
      jibun_num: toTrimmedString(draft?.data?.jibun_num),
      useland_state: toTrimmedString(draft?.data?.useland_state),
      land_height: toTrimmedString(draft?.data?.land_height),
      land_shape: toTrimmedString(draft?.data?.land_shape),
      load_shape: toTrimmedString(draft?.data?.load_shape),
      land_book_name: toTrimmedString(draft?.data?.land_book_name),
      government: {
        gvm_price: toOptionalNumber(draft?.data?.government?.gvm_price),
        gvm_price1: toOptionalNumber(draft?.data?.government?.gvm_price1),
        gvm_price2: toOptionalNumber(draft?.data?.government?.gvm_price2),
        gvm_price3: toOptionalNumber(draft?.data?.government?.gvm_price3),
        gvm_price4: toOptionalNumber(draft?.data?.government?.gvm_price4),
      },
      deals: Array.isArray(draft?.data?.deals)
        ? draft.data.deals
            .filter((deal) =>
              Object.values(deal || {}).some((value) => toTrimmedString(value)),
            )
            .map((deal) => ({
              dealAmount: toOptionalNumber(deal?.dealAmount),
              dealYear: toOptionalNumber(deal?.dealYear),
              dealMonth: toOptionalNumber(deal?.dealMonth),
              dealDay: toOptionalNumber(deal?.dealDay),
              estateAgentSggNm: toTrimmedString(deal?.estateAgentSggNm),
              shareDealingType: toTrimmedString(deal?.shareDealingType),
              cDealType: toTrimmedString(deal?.cDealType),
              cDealDay: toTrimmedString(deal?.cDealDay),
            }))
        : [],
    },
  };
}

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function hasNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasGeometry(payload) {
  return (
    Array.isArray(payload.geo) &&
    payload.geo.length > 0 &&
    payload.geo.every(
      (ring) =>
        Array.isArray(ring) &&
        ring.length > 0 &&
        ring.every(
          (coord) =>
            Array.isArray(coord) &&
            coord.length >= 2 &&
            Number.isFinite(coord[0]) &&
            Number.isFinite(coord[1]),
        ),
    )
  );
}

export function validateLandRegisterPayload(
  payload,
  { additionalErrors = [] } = {},
) {
  const errors = [];

  if (!hasText(payload?.region)) errors.push("지역 코드");
  if (!hasGeometry(payload)) errors.push("토지 경계 좌표(geo)");
  if (!hasText(payload?.sale_price)) errors.push("매매가(sale_price)");

  const point = payload?.point;
  if (
    !Array.isArray(point) ||
    point.length < 2 ||
    !Number.isFinite(point[0]) ||
    !Number.isFinite(point[1])
  ) {
    errors.push("대표 좌표(point)");
  }

  if (!hasText(payload?.data?.pnu)) errors.push("PNU");
  if (!hasNumber(payload?.data?.land_area)) errors.push("토지 면적");
  if (!hasText(payload?.data?.useland_name?.useland_name1)) {
    errors.push("용도지역명1");
  }
  if (!hasText(payload?.data?.useland_name?.useland_name2)) {
    errors.push("용도지역명2");
  }
  if (!hasText(payload?.data?.area_name)) errors.push("지역명");
  if (!hasText(payload?.data?.share_state)) errors.push("공유 상태");
  if (!hasNumber(payload?.data?.share_people)) errors.push("공유인 수");
  if (!hasText(payload?.data?.age_range)) errors.push("연령대");
  if (!hasText(payload?.data?.live_state)) errors.push("거주 상태");
  if (!hasText(payload?.data?.nation_state)) errors.push("국가소유정보 코드");
  if (!hasText(payload?.data?.diff_share_state)) {
    errors.push("소유정보변경 이유");
  }
  if (!hasText(payload?.data?.diff_share_day)) {
    errors.push("소유정보변경 일자");
  }
  if (!hasText(payload?.data?.land_type)) errors.push("토지 지목");
  if (!hasText(payload?.data?.jibun_num)) errors.push("지번 번호");
  if (!hasText(payload?.data?.useland_state)) errors.push("토지용도");
  if (!hasText(payload?.data?.land_height)) errors.push("토지 높이");
  if (!hasText(payload?.data?.land_shape)) errors.push("토지 모양");
  if (!hasText(payload?.data?.load_shape)) errors.push("도로 모양");
  if (!hasText(payload?.data?.land_book_name)) {
    errors.push("토지 대장 구분");
  }
  if (!hasNumber(payload?.data?.government?.gvm_price)) {
    errors.push("현재년도 공시지가");
  }
  if (!hasNumber(payload?.data?.government?.gvm_price1)) {
    errors.push("전년도 공시지가");
  }
  if (!hasNumber(payload?.data?.government?.gvm_price2)) {
    errors.push("2년전 공시지가");
  }
  if (!hasNumber(payload?.data?.government?.gvm_price3)) {
    errors.push("3년전 공시지가");
  }
  if (!hasNumber(payload?.data?.government?.gvm_price4)) {
    errors.push("4년전 공시지가");
  }

  const uniqueErrors = [...new Set([...errors, ...additionalErrors.filter(Boolean)])];
  return uniqueErrors;
}

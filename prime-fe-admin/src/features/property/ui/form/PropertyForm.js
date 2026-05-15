import { useEffect, useMemo, useState } from "react";
import { mapGeocodingResponse } from "../../api/mappers/mapGeocodingResponse";
import { mapLandRegisterResponse } from "../../api/mappers/mapLandRegisterResponse";
import { mapLandTableResponse } from "../../api/mappers/mapLandTableResponse";
import { mapPolygonResponse } from "../../api/mappers/mapPolygonResponse";
import { requestGeocoding } from "../../api/geocoding";
import { requestLandTable } from "../../api/getLandTable";
import { requestPolygonByPoint } from "../../api/getPolygonByPoint";
import { requestLandRegister } from "../../api/registerLand";
import NaverMiniMap from "../map/NaverMiniMap";
import {
  ADDRESS_SEARCH_NOT_FOUND_MESSAGE,
  EMPTY_DEAL_ITEM,
  buildAddressSearchResult,
  buildLandRegisterPayload,
  createEmptyRegisterDraft,
  extractLocationLabel,
  mapPolygonToRegisterDraft,
  normalizePolygonGeo,
  resolveRegionFromAddress,
  validateLandRegisterPayload,
} from "../../utils/landRegisterUtils";

// PropertyForm은 주소 검색 -> polygon 자동 채움 -> 최종 payload 검증 -> 등록 요청까지
// 토지 매물 등록 플로우 전체를 한 화면에서 처리하는 feature entry 컴포넌트다.
const CATEGORY_OPTIONS = ["토지"];
const DEALING_GBN_OPTIONS = ["", "매매", "중개", "직거래", "기타"];
const ZONING_OPTIONS = [
  "제1종전용주거지역",
  "제2종전용주거지역",
  "제1종일반주거지역",
  "제2종일반주거지역",
  "제3종일반주거지역",
  "준주거지역",
  "중심상업지역",
  "일반상업지역",
  "근린상업지역",
  "유통상업지역",
  "전용공업지역",
  "일반공업지역",
  "준공업지역",
  "보전녹지지역",
  "생산녹지지역",
  "자연녹지지역",
  "보전관리지역",
  "생산관리지역",
  "계획관리지역",
  "농림지역",
  "자연환경보전지역",
];
const STEP_TITLES = ["기본 정보", "토지 세부 정보", "최종 확인"];
const DEFAULT_LAND_IMAGE =
  "https://readdy.ai/api/search-image?query=redevelopment%20land%20plot%20in%20seoul%20simple%20aerial%20view%20clean%20real%20estate%20background&width=400&height=300&seq=landregister&orientation=landscape";

// 개발 모드에서만 payload/PNU/좌표 디버그 UI를 노출하기 위한 스위치다.
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const DETAIL_SECTIONS = [
  {
    title: "핵심 정보",
    fields: [
      {
        path: "data.pnu",
        label: "PNU",
        placeholder: "예: 3023010300100750014",
        developerOnly: true,
      },
      {
        path: "data.area_name",
        label: "지역명",
        placeholder: "예: 대전광역시 대덕구 읍내동",
      },
      {
        path: "data.land_area",
        label: "토지 면적",
        placeholder: "예: 7.0",
      },
      { path: "data.land_type", label: "토지 지목", placeholder: "예: 대" },
      { path: "data.jibun_num", label: "지번 번호", placeholder: "예: 75-14" },
      {
        path: "data.land_book_name",
        label: "토지 대장 구분",
        placeholder: "예: 일반",
      },
      {
        path: "data.dealing_gbn",
        label: "거래 유형",
        type: "select",
        options: DEALING_GBN_OPTIONS,
      },
    ],
  },
  {
    title: "용도 및 형태",
    fields: [
      {
        path: "data.useland_name.useland_name1",
        label: "용도지역명1",
        type: "select",
        options: ZONING_OPTIONS,
      },
      {
        path: "data.useland_name.useland_name2",
        label: "용도지역명2",
        placeholder: "예: 지정되지않음",
      },
      {
        path: "data.useland_state",
        label: "토지용도",
        placeholder: "예: 주거나지",
      },
      {
        path: "data.land_height",
        label: "토지 높이",
        placeholder: "예: 완경사",
      },
      {
        path: "data.land_shape",
        label: "토지 모양",
        placeholder: "예: 부정형",
      },
      { path: "data.load_shape", label: "도로 모양", placeholder: "예: 맹지" },
    ],
  },
  {
    title: "소유 및 권리",
    fields: [
      { path: "data.share_state", label: "공유 상태", placeholder: "예: 법인" },
      { path: "data.share_people", label: "공유인 수", placeholder: "예: 1" },
      { path: "data.age_range", label: "연령대", placeholder: "예: 구분없음" },
      {
        path: "data.live_state",
        label: "거주 상태",
        placeholder: "예: 구분없음",
      },
      {
        path: "data.nation_state",
        label: "국가소유정보 코드",
        placeholder: "예: ZZ",
      },
      {
        path: "data.diff_share_state",
        label: "소유정보변경 이유",
        placeholder: "예: 소유권이전",
      },
      {
        path: "data.diff_share_day",
        label: "소유정보변경 일자",
        placeholder: "예: 20211020",
      },
    ],
  },
];

const GOVERNMENT_FIELDS = [
  {
    path: "data.government.gvm_price",
    label: "현재년도 공시지가 (단위:만)",
    placeholder: "예: 496400",
  },
  {
    path: "data.government.gvm_price1",
    label: "전년도 공시지가 (단위:만)",
    placeholder: "예: 496100",
  },
  {
    path: "data.government.gvm_price2",
    label: "2년전 공시지가 (단위:만)",
    placeholder: "예: 525900",
  },
  {
    path: "data.government.gvm_price3",
    label: "3년전 공시지가 (단위:만)",
    placeholder: "예: 478500",
  },
  {
    path: "data.government.gvm_price4",
    label: "4년전 공시지가 (단위:만)",
    placeholder: "예: 406300",
  },
];

const DEAL_FIELDS = [
  {
    key: "dealAmount",
    label: "실거래 금액",
    placeholder: "예: 1,200",
  },
  {
    key: "transactionDate",
    label: "거래 일자",
    placeholder: "예: 2021.03.18",
  },
  {
    key: "estateAgentSggNm",
    label: "중개인 이름",
    placeholder: "예: 강남부동산",
  },
  {
    key: "shareDealingType",
    label: "공유 거래 유형",
    placeholder: "예: 공동매수",
  },
  {
    key: "cDealType",
    label: "해제 여부",
    placeholder: "예: 해제",
  },
  {
    key: "cDealDay",
    label: "해제 발생일",
    placeholder: "예: 2021.03.20",
  },
];

function cloneDraft(value) {
  return JSON.parse(JSON.stringify(value));
}

function getValueByPath(source, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], source);
}

function setValueByPath(target, path, value) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const container = keys.reduce((acc, key) => {
    if (!acc[key] || typeof acc[key] !== "object") {
      acc[key] = {};
    }
    return acc[key];
  }, target);

  container[lastKey] = value;
}

function formatJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function formatDisplayValue(value) {
  if (Array.isArray(value)) return formatJson(value);
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function normalizeNumericInput(value) {
  return String(value ?? "").replace(/[^\d.]/g, "");
}

function formatNumericDisplay(value) {
  const normalized = normalizeNumericInput(value);
  if (!normalized) return "";

  const [integerPart, decimalPart] = normalized.split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart === undefined) {
    return formattedInteger;
  }

  return `${formattedInteger}.${decimalPart}`;
}

function normalizeCompactDateInput(value) {
  return String(value ?? "")
    .replace(/[^\d]/g, "")
    .slice(0, 8);
}

function formatCompactDateDisplay(value) {
  const normalized = normalizeCompactDateInput(value);
  if (!normalized) return "";
  if (normalized.length <= 4) return normalized;
  if (normalized.length <= 6) {
    return `${normalized.slice(0, 4)}.${normalized.slice(4)}`;
  }
  return `${normalized.slice(0, 4)}.${normalized.slice(4, 6)}.${normalized.slice(6, 8)}`;
}

function buildDealTransactionDateDisplay(deal) {
  const rawDate =
    deal?.transactionDate ||
    `${String(deal?.dealYear ?? "").trim()}${String(deal?.dealMonth ?? "")
      .trim()
      .padStart(String(deal?.dealMonth ?? "").trim() ? 2 : 0, "0")}${String(
      deal?.dealDay ?? "",
    )
      .trim()
      .padStart(String(deal?.dealDay ?? "").trim() ? 2 : 0, "0")}`;

  return formatCompactDateDisplay(rawDate);
}

function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

function parsePointInput(value) {
  if (!Array.isArray(value) || value.length < 2) return [];

  const lng = Number(value[0]);
  const lat = Number(value[1]);

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return [];
  }

  return [lng, lat];
}

function getInitialMapLocation(property) {
  if (
    !property?.address ||
    !isFiniteCoordinate(property?.lat) ||
    !isFiniteCoordinate(property?.lng)
  ) {
    return null;
  }

  const location = property.location || extractLocationLabel(property.address);

  return {
    address: property.address,
    lat: Number(property.lat),
    lng: Number(property.lng),
    location,
    label: location || property.address,
  };
}

function validateBasicInfo(basicInfo) {
  const errors = [];

  if (!basicInfo.name.trim()) errors.push("매물명");
  if (!basicInfo.type.trim()) errors.push("부동산 종류");
  if (!basicInfo.price.trim()) errors.push("매매가");
  if (!basicInfo.address.trim()) errors.push("주소");
  if (!basicInfo.region.trim()) errors.push("지역 코드");
  if (
    !isFiniteCoordinate(basicInfo.lat) ||
    !isFiniteCoordinate(basicInfo.lng)
  ) {
    errors.push("좌표");
  }

  return errors;
}

function buildSavedProperty({ basicInfo, payload, responseData }) {
  return {
    id: `land-${responseData?.real_region_id || Date.now()}`,
    name: basicInfo.name,
    type: "토지",
    dealType: "매매",
    location: basicInfo.location || extractLocationLabel(basicInfo.address),
    address: basicInfo.address,
    area:
      typeof payload.data.land_area === "number"
        ? `${payload.data.land_area}㎡`
        : "-",
    price: payload.sale_price || basicInfo.price,
    zoning: payload.data.useland_name.useland_name1 || "-",
    date: new Date().toLocaleDateString("ko-KR"),
    status: "pending",
    image: DEFAULT_LAND_IMAGE,
    images: [DEFAULT_LAND_IMAGE],
    lat: basicInfo.lat,
    lng: basicInfo.lng,
    ownerArea: "-",
    submittedAt: new Date().toLocaleString("ko-KR"),
    submittedBy: "관리자",
    description: "",
    landInfo: {
      landCategory: payload.data.land_type || "-",
      officialPrice: payload.data.government.gvm_price
        ? `${payload.data.government.gvm_price}원/㎡`
        : "-",
      ownerName: "-",
      ownerType: payload.data.share_state || "-",
      ownerShare: payload.data.share_people || "-",
      registrationDate: "-",
      verified: true,
    },
    extraFields: {
      landCategory: payload.data.land_type,
      zoning: payload.data.useland_name.useland_name1,
      roadContact: payload.data.load_shape,
      shape: payload.data.land_shape,
      slope: payload.data.land_height,
    },
    registerResult: responseData,
    registerPayload: payload,
  };
}

function buildReviewSections({ basicInfo, payload }) {
  return [
    {
      title: "기본 정보",
      items: [
        { label: "매물명", value: basicInfo.name },
        { label: "부동산 종류", value: basicInfo.type },
        { label: "매매가", value: basicInfo.price },
        { label: "주소", value: basicInfo.address },
      ],
    },
    {
      title: "핵심 정보",
      items: [
        { label: "지역명", value: payload.data.area_name },
        { label: "토지 면적", value: payload.data.land_area },
        { label: "토지 지목", value: payload.data.land_type },
        { label: "지번 번호", value: payload.data.jibun_num },
        { label: "토지 대장 구분", value: payload.data.land_book_name },
        { label: "거래 유형", value: payload.data.dealing_gbn },
      ],
    },
    {
      title: "용도 및 형태",
      items: [
        {
          label: "용도지역명1",
          value: payload.data.useland_name.useland_name1,
        },
        {
          label: "용도지역명2",
          value: payload.data.useland_name.useland_name2,
        },
        { label: "토지용도", value: payload.data.useland_state },
        { label: "토지 높이", value: payload.data.land_height },
        { label: "토지 모양", value: payload.data.land_shape },
        { label: "도로 모양", value: payload.data.load_shape },
      ],
    },
    {
      title: "소유 및 권리",
      items: [
        { label: "공유 상태", value: payload.data.share_state },
        { label: "공유인 수", value: payload.data.share_people },
        { label: "연령대", value: payload.data.age_range },
        { label: "거주 상태", value: payload.data.live_state },
        { label: "국가소유정보 코드", value: payload.data.nation_state },
        { label: "소유정보변경 이유", value: payload.data.diff_share_state },
        {
          label: "소유정보변경 일자",
          value: formatCompactDateDisplay(payload.data.diff_share_day),
        },
      ],
    },
    {
      title: "공시지가",
      items: [
        {
          label: "현재년도 공시지가 (단위:만)",
          value: formatNumericDisplay(payload.data.government.gvm_price),
        },
        {
          label: "전년도 공시지가 (단위:만)",
          value: formatNumericDisplay(payload.data.government.gvm_price1),
        },
        {
          label: "2년전 공시지가 (단위:만)",
          value: formatNumericDisplay(payload.data.government.gvm_price2),
        },
        {
          label: "3년전 공시지가 (단위:만)",
          value: formatNumericDisplay(payload.data.government.gvm_price3),
        },
        {
          label: "4년전 공시지가 (단위:만)",
          value: formatNumericDisplay(payload.data.government.gvm_price4),
        },
      ],
    },
  ];
}

function buildDeveloperReviewItems({ basicInfo, payload }) {
  return [
    { label: "region", value: payload.region },
    { label: "대표 좌표", value: formatJson(payload.point) },
    {
      label: "Polygon 좌표 수",
      value: `${payload.geo[0]?.length || 0}개`,
    },
    { label: "PNU", value: payload.data.pnu },
  ];
}

function buildDealReviewItems(deal) {
  return [
    { label: "실거래 금액", value: formatNumericDisplay(deal.dealAmount) },
    { label: "거래 일자", value: buildDealTransactionDateDisplay(deal) },
    { label: "중개인 이름", value: deal.estateAgentSggNm },
    { label: "공유 거래 유형", value: deal.shareDealingType },
    { label: "해제 여부", value: deal.cDealType },
    { label: "해제 발생일", value: formatCompactDateDisplay(deal.cDealDay) },
  ];
}

function ReviewListSection({ title, items }) {
  return (
    <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
      <p className="text-base font-bold text-gray-900">{title}</p>
      <div className="mt-4 divide-y divide-gray-100">
        {items.map(({ label, value }) => (
          <div
            key={`${title}-${label}`}
            className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          >
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="break-words text-sm font-medium text-gray-900 sm:text-right">
              {formatDisplayValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  options,
  disabled = false,
  rows = 4,
}) {
  const sharedClassName =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50";

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-gray-600">
        {label}
      </span>
      {type === "textarea" ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${sharedClassName} resize-none font-mono text-xs leading-6`}
        />
      ) : options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className={`${sharedClassName} cursor-pointer`}
        >
          <option value="">선택</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option || "없음"}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={sharedClassName}
        />
      )}
    </label>
  );
}

function InfoBanner({ tone = "orange", title, description, action }) {
  const toneClassMap = {
    orange: "border-orange-200 bg-orange-50 text-orange-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-green-200 bg-green-50 text-green-700",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${toneClassMap[tone] || toneClassMap.orange}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="mt-1 text-xs leading-5">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

function ModalDialog({
  title,
  description,
  children,
  onClose,
  actions,
  tone = "default",
}) {
  const iconClassName =
    tone === "success"
      ? "bg-green-100 text-green-600"
      : tone === "error"
        ? "bg-red-100 text-red-600"
        : "bg-orange-100 text-orange-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
            >
              <i
                className={`${
                  tone === "success"
                    ? "ri-checkbox-circle-line"
                    : tone === "error"
                      ? "ri-error-warning-line"
                      : "ri-information-line"
                } text-xl`}
              ></i>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-gray-900">{title}</p>
              {description && (
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <div className="mt-5">{children}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyForm({ onClose, onSave }) {
  const initialMapLocation = getInitialMapLocation(null);
  const [step, setStep] = useState(1);
  const [showDeveloperFields, setShowDeveloperFields] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    type: "토지",
    price: "",
    addressQuery: "",
    address: "",
    location: "",
    lat: null,
    lng: null,
    region: "",
  });
  const [mapLocation, setMapLocation] = useState(initialMapLocation);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [registerDraft, setRegisterDraft] = useState(() =>
    createEmptyRegisterDraft(),
  );
  const [geoEditorValue, setGeoEditorValue] = useState("[]");
  const [pointEditorValue, setPointEditorValue] = useState("[]");
  const [geoEditorError, setGeoEditorError] = useState("");
  const [pointEditorError, setPointEditorError] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState("");
  const [polygonLoading, setPolygonLoading] = useState(false);
  const [polygonError, setPolygonError] = useState("");
  const [polygonLoadedKey, setPolygonLoadedKey] = useState("");
  const [detailValidationVisible, setDetailValidationVisible] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [resultState, setResultState] = useState(null);

  // geo/point 편집기는 registerDraft 원문과 별도로 문자열 상태를 둬야
  // 잘못된 JSON 입력 중에도 textarea 값을 그대로 유지할 수 있다.
  const syncGeometryEditors = (draft) => {
    setGeoEditorValue(formatJson(draft.geo));
    setPointEditorValue(formatJson(draft.point));
    setGeoEditorError("");
    setPointEditorError("");
  };

  const resetPolygonState = ({ region = "", lat = null, lng = null } = {}) => {
    const nextDraft = createEmptyRegisterDraft({
      region,
      point:
        isFiniteCoordinate(lat) && isFiniteCoordinate(lng)
          ? [Number(lng), Number(lat)]
          : [],
    });

    setRegisterDraft(nextDraft);
    syncGeometryEditors(nextDraft);
    setPolygonError("");
    setPolygonLoadedKey("");
    setDetailValidationVisible(false);
  };

  const basicInfoErrors = useMemo(
    () => validateBasicInfo(basicInfo),
    [basicInfo],
  );

  const registerPayload = useMemo(
    () => buildLandRegisterPayload({ basicInfo, draft: registerDraft }),
    [basicInfo, registerDraft],
  );

  const payloadValidationErrors = useMemo(
    () =>
      validateLandRegisterPayload(registerPayload, {
        additionalErrors: [geoEditorError, pointEditorError],
      }),
    [geoEditorError, pointEditorError, registerPayload],
  );

  const reviewValidationErrors = useMemo(
    () => [...new Set([...basicInfoErrors, ...payloadValidationErrors])],
    [basicInfoErrors, payloadValidationErrors],
  );
  const reviewSections = useMemo(
    () => buildReviewSections({ basicInfo, payload: registerPayload }),
    [basicInfo, registerPayload],
  );
  const developerReviewItems = useMemo(
    () => buildDeveloperReviewItems({ basicInfo, payload: registerPayload }),
    [basicInfo, registerPayload],
  );

  const currentStepLabel = STEP_TITLES[step - 1];
  const showDeveloperUI = IS_DEVELOPMENT && showDeveloperFields;

  useEffect(() => {
    if (
      step !== 2 ||
      !isFiniteCoordinate(basicInfo.lat) ||
      !isFiniteCoordinate(basicInfo.lng)
    ) {
      return undefined;
    }

    const requestKey = `${basicInfo.lat}:${basicInfo.lng}:${basicInfo.region}`;
    if (polygonLoadedKey === requestKey) {
      return undefined;
    }

    let cancelled = false;

    async function loadPolygon() {
      setPolygonLoading(true);
      setPolygonError("");

      try {
        const response = await requestPolygonByPoint({
          lat: basicInfo.lat,
          lng: basicInfo.lng,
        });

        // response.data.data는 polygon 후보 배열이고,
        // 현재 화면은 첫 번째 후보만 사용하도록 mapper에서 정규화했다.
        const polygon = mapPolygonResponse(response);

        if (!polygon) {
          throw new Error(
            response.data?.message ||
              "해당 좌표에 포함된 토지 Polygon 데이터를 찾지 못했습니다.",
          );
        }

        if (cancelled) return;

        const nextDraft = mapPolygonToRegisterDraft(polygon, {
          region: basicInfo.region,
          point: [basicInfo.lng, basicInfo.lat],
        });

        setRegisterDraft(nextDraft);
        syncGeometryEditors(nextDraft);
        setPolygonLoadedKey(requestKey);
      } catch (error) {
        if (cancelled) return;

        setPolygonError(
          error?.response?.data?.message ||
            error?.message ||
            "Polygon 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      } finally {
        if (!cancelled) {
          setPolygonLoading(false);
        }
      }
    }

    // 2단계에 진입한 뒤 좌표가 준비되면 polygon을 자동 채워
    // 사용자가 세부 필드를 바로 검토할 수 있게 만든다.
    loadPolygon();

    return () => {
      cancelled = true;
    };
  }, [basicInfo.lat, basicInfo.lng, basicInfo.region, polygonLoadedKey, step]);

  const handleBasicFieldChange = (key, value) => {
    setBasicInfo((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddressInputChange = (value) => {
    setAddressSearchError("");
    setBasicInfo((prev) => ({
      ...prev,
      addressQuery: value,
      address: "",
      location: "",
      lat: null,
      lng: null,
      region: "",
    }));
    setMapLocation(null);
    setAvailableRegions([]);
    resetPolygonState();
  };

  const handleAddressSearch = async () => {
    const query = basicInfo.addressQuery.trim();
    if (!query || searchLoading) return;

    setSearchLoading(true);
    setAddressSearchError("");

    try {
      const geocodingResponse = await requestGeocoding(query);

      // geocoding 응답은 백엔드 포맷 차이가 있을 수 있어
      // mapper에서 payload만 꺼낸 뒤 utils에서 화면 공통 shape로 바꾼다.
      const addressData = mapGeocodingResponse(geocodingResponse);
      const isEmptyObject =
        addressData &&
        typeof addressData === "object" &&
        !Array.isArray(addressData) &&
        Object.keys(addressData).length === 0;

      if (!addressData || isEmptyObject) {
        throw new Error(
          geocodingResponse.data?.message || ADDRESS_SEARCH_NOT_FOUND_MESSAGE,
        );
      }

      const addressResult = buildAddressSearchResult(query, addressData);
      if (!addressResult) {
        throw new Error(ADDRESS_SEARCH_NOT_FOUND_MESSAGE);
      }

      const landTableResponse = await requestLandTable();

      // land/table 응답은 저장 가능한 region code 목록이며,
      // 주소 문자열과 대조해서 최종 저장 region을 결정한다.
      const regions = mapLandTableResponse(landTableResponse);
      const region = resolveRegionFromAddress(addressResult.address, regions);

      if (!region) {
        throw new Error(
          "주소로부터 저장 가능한 지역 코드를 확인하지 못했습니다. 주소를 다시 확인해 주세요.",
        );
      }

      setAvailableRegions(regions);
      setBasicInfo((prev) => ({
        ...prev,
        addressQuery: addressResult.address,
        address: addressResult.address,
        location: addressResult.location,
        lat: addressResult.lat,
        lng: addressResult.lng,
        region,
      }));
      setMapLocation(addressResult);
      resetPolygonState({
        region,
        lat: addressResult.lat,
        lng: addressResult.lng,
      });
    } catch (error) {
      setAddressSearchError(
        error?.response?.data?.message ||
          error?.message ||
          "주소 검색 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const updateDraftField = (path, value) => {
    setRegisterDraft((prev) => {
      const next = cloneDraft(prev);
      setValueByPath(next, path, value);
      return next;
    });
  };

  const handleGeometryChange = (field, value) => {
    if (field === "geo") {
      setGeoEditorValue(value);

      try {
        const parsed = JSON.parse(value);
        const normalized = normalizePolygonGeo(parsed);

        if (normalized.length === 0) {
          throw new Error(
            "geo는 [[[lng, lat], ...]] 또는 [[lng, lat], ...] 형식이어야 합니다.",
          );
        }

        setGeoEditorError("");
        setRegisterDraft((prev) => ({
          ...prev,
          geo: normalized,
        }));
      } catch (error) {
        // 입력 중간 상태도 textarea에는 남겨두고,
        // 실제 draft 반영만 막기 위해 별도 에러 상태를 둔다.
        setGeoEditorError(
          error.message || "geo JSON 형식이 올바르지 않습니다.",
        );
      }

      return;
    }

    setPointEditorValue(value);

    try {
      const parsed = JSON.parse(value);
      const normalized = parsePointInput(parsed);

      if (normalized.length === 0) {
        throw new Error("point는 [lng, lat] 형식이어야 합니다.");
      }

      setPointEditorError("");
      setRegisterDraft((prev) => ({
        ...prev,
        point: normalized,
      }));
    } catch (error) {
      setPointEditorError(
        error.message || "point JSON 형식이 올바르지 않습니다.",
      );
    }
  };

  const handleDealChange = (index, key, value) => {
    setRegisterDraft((prev) => {
      const next = cloneDraft(prev);
      next.data.deals[index][key] = value;
      return next;
    });
  };

  const handleDealTransactionDateChange = (index, value) => {
    const normalized = normalizeCompactDateInput(value);

    setRegisterDraft((prev) => {
      const next = cloneDraft(prev);
      next.data.deals[index].transactionDate = normalized;
      next.data.deals[index].dealYear = normalized.slice(0, 4);
      next.data.deals[index].dealMonth = normalized.slice(4, 6);
      next.data.deals[index].dealDay = normalized.slice(6, 8);
      return next;
    });
  };

  const handleAddDeal = () => {
    setRegisterDraft((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        deals: [...prev.data.deals, { ...EMPTY_DEAL_ITEM }],
      },
    }));
  };

  const handleRemoveDeal = (index) => {
    setRegisterDraft((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        deals: prev.data.deals.filter(
          (_, currentIndex) => currentIndex !== index,
        ),
      },
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (basicInfoErrors.length > 0) {
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      setDetailValidationVisible(true);

      // polygon 자동 채움이 아직 끝나지 않았거나 검증 에러가 있으면
      // 최종 확인 단계로 넘어가지 않는다.
      if (
        polygonLoading ||
        polygonError ||
        payloadValidationErrors.length > 0
      ) {
        return;
      }

      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (reviewValidationErrors.length > 0 || submitLoading) {
      return;
    }

    setSubmitLoading(true);
    setConfirmOpen(false);

    try {
      const response = await requestLandRegister(registerPayload);

      // 등록 완료 응답의 실제 payload는 response.data.data 안에 있고,
      // 현재 화면은 table_name / real_region_id를 성공 안내에 사용한다.
      const responseData = mapLandRegisterResponse(response);
      const createdProperty = buildSavedProperty({
        basicInfo,
        payload: registerPayload,
        responseData,
      });

      onSave?.(createdProperty);
      setResultState({
        tone: "success",
        title: "토지 매물 등록이 완료되었습니다.",
        description: "실제 등록 API 응답 기준으로 완료 팝업을 표시합니다.",
        content: (
          <div className="space-y-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">저장 테이블</span>
              <span>{responseData.table_name || "-"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">real_region_id</span>
              <span>{responseData.real_region_id || "-"}</span>
            </div>
          </div>
        ),
        closeMode: "success",
      });
    } catch (error) {
      setResultState({
        tone: "error",
        title: "토지 매물 등록에 실패했습니다.",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "서버 응답을 확인한 뒤 다시 시도해 주세요.",
        content: (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
            등록 API는 마지막 확인 단계에서만 호출되므로, 현재 입력값은 그대로
            유지됩니다. 값을 수정한 뒤 다시 등록할 수 있습니다.
          </div>
        ),
        closeMode: "stay",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const closeResultDialog = () => {
    const shouldCloseForm = resultState?.closeMode === "success";
    setResultState(null);
    if (shouldCloseForm) {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 top-[-25px] z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-white">
              <i className="ri-map-2-line text-xl"></i>
            </div>
            <p className="text-lg font-bold text-white">토지 매물 등록</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="overflow-y-auto">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-bold text-gray-900">
                {currentStepLabel}
              </h3>
              {IS_DEVELOPMENT && (
                <button
                  type="button"
                  onClick={() =>
                    setShowDeveloperFields((previous) => !previous)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    showDeveloperUI
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {showDeveloperUI
                    ? "개발모드 필드 숨기기"
                    : "개발모드 필드 보기"}
                </button>
              )}
            </div>
          </div>

          {step === 1 && (
            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                  <div className="grid gap-5">
                    <FieldInput
                      label="매물명"
                      value={basicInfo.name}
                      onChange={(value) =>
                        handleBasicFieldChange("name", value)
                      }
                      placeholder="예: 강남구 역삼동 토지 지분 매물"
                    />

                    <div>
                      <span className="mb-2 block text-xs font-semibold text-gray-600">
                        부동산 종류
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map((category) => (
                          <button
                            key={category}
                            type="button"
                            className="rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FieldInput
                      label="매매가"
                      value={basicInfo.price}
                      onChange={(value) =>
                        handleBasicFieldChange("price", value)
                      }
                      placeholder="예: 12억 5천만원"
                    />

                    <div>
                      <span className="mb-2 block text-xs font-semibold text-gray-600">
                        주소 검색
                      </span>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="text"
                          value={basicInfo.addressQuery}
                          onChange={(event) =>
                            handleAddressInputChange(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleAddressSearch();
                            }
                          }}
                          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
                            addressSearchError
                              ? "border-red-300 bg-red-50"
                              : "border-gray-200"
                          }`}
                          placeholder="지번 또는 도로명 주소를 입력하세요"
                        />
                        <button
                          type="button"
                          onClick={handleAddressSearch}
                          disabled={searchLoading}
                          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {searchLoading ? "검색 중..." : "주소 검색"}
                        </button>
                      </div>
                      {addressSearchError && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                          {addressSearchError}
                        </p>
                      )}
                    </div>

                    {basicInfo.address && (
                      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                        <p className="text-xs font-semibold text-orange-700">
                          선택된 주소
                        </p>
                        <p className="mt-2 text-sm font-medium text-orange-900">
                          {basicInfo.address}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {basicInfo.location && (
                            <span className="rounded-full bg-white px-3 py-1.5 font-medium text-orange-700">
                              {basicInfo.location}
                            </span>
                          )}
                          {showDeveloperUI && basicInfo.region && (
                            <span className="rounded-full bg-white px-3 py-1.5 font-medium text-orange-700">
                              region: {basicInfo.region}
                            </span>
                          )}
                          {showDeveloperUI &&
                            isFiniteCoordinate(basicInfo.lat) &&
                            isFiniteCoordinate(basicInfo.lng) && (
                              <span className="rounded-full bg-white px-3 py-1.5 font-medium text-orange-700">
                                {Number(basicInfo.lat).toFixed(6)},{" "}
                                {Number(basicInfo.lng).toFixed(6)}
                              </span>
                            )}
                        </div>
                      </div>
                    )}

                    {/* {basicInfoErrors.length > 0 && (
                      <InfoBanner
                        tone="blue"
                        title="다음 단계 이동 조건"
                        description={`필수 항목을 모두 입력해야 합니다: ${basicInfoErrors.join(", ")}`}
                      />
                    )} */}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <i className="ri-map-pin-line text-orange-500"></i>
                    <span className="text-sm font-semibold text-gray-800">
                      주소 검색 결과 지도
                    </span>
                  </div>
                  <div className="h-[420px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    <NaverMiniMap location={mapLocation} />
                  </div>
                </div>

                {showDeveloperUI && availableRegions.length > 0 && (
                  <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-800">
                      등록 가능한 지역 코드
                    </p>
                    <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      {availableRegions.map((region) => (
                        <span
                          key={region}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            basicInfo.region === region
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 px-6 py-6">
              {showDeveloperUI && (
                <InfoBanner
                  title="Polygon API 자동 채움"
                  description="2페이지 진입 시 `GET /polygon/point`를 호출해 `/land/register` payload 초안을 자동 생성합니다. 자동 채움된 값은 모두 수정 가능합니다."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setPolygonLoadedKey("");
                        setDetailValidationVisible(false);
                      }}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
                    >
                      다시 불러오기
                    </button>
                  }
                />
              )}

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  {polygonLoading && (
                    <div className="h-[60vh] rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
                      <div className="flex flex-col items-center justify-center h-full">
                        <i className="ri-loader-4-line animate-spin text-4xl text-orange-500"></i>
                        <p className="mt-3 text-sm font-medium text-gray-700">
                          좌표 기준으로 토지 경계와 세부 정보를 자동 채우는
                          중입니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {polygonError && !polygonLoading && (
                    <InfoBanner
                      tone="red"
                      title="Polygon 조회 실패"
                      description={polygonError}
                    />
                  )}

                  {!polygonLoading && !polygonError && (
                    <>
                      {showDeveloperUI && (
                        <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                          <p className="text-base font-bold text-gray-900">
                            지리 정보
                          </p>
                          <div className="mt-5 grid gap-4">
                            <FieldInput
                              label="지역 코드"
                              value={registerDraft.region}
                              onChange={(value) =>
                                updateDraftField("region", value)
                              }
                              placeholder="예: seoul"
                            />
                            <FieldInput
                              label="geo (JSON)"
                              type="textarea"
                              rows={7}
                              value={geoEditorValue}
                              onChange={(value) =>
                                handleGeometryChange("geo", value)
                              }
                            />
                            {geoEditorError && (
                              <p className="text-xs font-medium text-red-500">
                                {geoEditorError}
                              </p>
                            )}
                            <FieldInput
                              label="point (JSON)"
                              type="textarea"
                              rows={4}
                              value={pointEditorValue}
                              onChange={(value) =>
                                handleGeometryChange("point", value)
                              }
                            />
                            {pointEditorError && (
                              <p className="text-xs font-medium text-red-500">
                                {pointEditorError}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {DETAIL_SECTIONS.map((section) => (
                        <div
                          key={section.title}
                          className="rounded-3xl border border-gray-100 p-5 shadow-sm"
                        >
                          <p className="text-base font-bold text-gray-900">
                            {section.title}
                          </p>
                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {section.fields
                              .filter(
                                (field) =>
                                  !field.developerOnly || showDeveloperUI,
                              )
                              .map((field) => (
                                <FieldInput
                                  key={field.path}
                                  label={field.label}
                                  value={
                                    field.path === "data.diff_share_day"
                                      ? formatCompactDateDisplay(
                                          getValueByPath(
                                            registerDraft,
                                            field.path,
                                          ),
                                        )
                                      : getValueByPath(
                                          registerDraft,
                                          field.path,
                                        )
                                  }
                                  onChange={(value) =>
                                    updateDraftField(
                                      field.path,
                                      field.path === "data.diff_share_day"
                                        ? normalizeCompactDateInput(value)
                                        : value,
                                    )
                                  }
                                  placeholder={field.placeholder}
                                  options={field.options}
                                />
                              ))}
                          </div>
                        </div>
                      ))}

                      <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-base font-bold text-gray-900">
                          공시지가
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          {GOVERNMENT_FIELDS.map((field) => (
                            <FieldInput
                              key={field.path}
                              label={field.label}
                              value={formatNumericDisplay(
                                getValueByPath(registerDraft, field.path),
                              )}
                              onChange={(value) =>
                                updateDraftField(
                                  field.path,
                                  normalizeNumericInput(value),
                                )
                              }
                              placeholder={field.placeholder}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-base font-bold text-gray-900">
                              실거래가
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddDeal}
                            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                          >
                            거래 추가
                          </button>
                        </div>

                        {registerDraft.data.deals.length === 0 ? (
                          <div className="mt-5 rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
                            실거래가 데이터가 없습니다. 필요하면 직접 추가해
                            주세요.
                          </div>
                        ) : (
                          <div className="mt-5 space-y-4">
                            {registerDraft.data.deals.map((deal, index) => (
                              <div
                                key={`deal-${index}`}
                                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                              >
                                <div className="mb-4 flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-gray-800">
                                    거래 #{index + 1}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDeal(index)}
                                    className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                                  >
                                    삭제
                                  </button>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  {DEAL_FIELDS.map((field) => (
                                    <FieldInput
                                      key={`${field.key}-${index}`}
                                      label={field.label}
                                      value={
                                        field.key === "dealAmount"
                                          ? formatNumericDisplay(deal[field.key])
                                          : field.key === "transactionDate"
                                            ? buildDealTransactionDateDisplay(
                                                deal,
                                              )
                                          : field.key === "cDealDay"
                                            ? formatCompactDateDisplay(
                                                deal[field.key],
                                              )
                                            : deal[field.key]
                                      }
                                      onChange={
                                        field.key === "transactionDate"
                                          ? (value) =>
                                              handleDealTransactionDateChange(
                                                index,
                                                value,
                                              )
                                          : (value) =>
                                              handleDealChange(
                                                index,
                                                field.key,
                                                field.key === "dealAmount"
                                                  ? normalizeNumericInput(value)
                                                  : field.key === "cDealDay"
                                                    ? normalizeCompactDateInput(
                                                        value,
                                                      )
                                                    : value,
                                              )
                                      }
                                      placeholder={field.placeholder}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {detailValidationVisible &&
                        payloadValidationErrors.length > 0 && (
                          <InfoBanner
                            tone="red"
                            title="3페이지로 이동하기 전에 확인해 주세요."
                            description={`누락 또는 형식 오류 항목: ${payloadValidationErrors.join(", ")}`}
                          />
                        )}
                    </>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <i className="ri-map-pin-line text-orange-500"></i>
                      <span className="text-sm font-semibold text-gray-800">
                        기준 좌표
                      </span>
                    </div>
                    <div className="h-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      <NaverMiniMap location={mapLocation} />
                    </div>
                    {showDeveloperUI &&
                      isFiniteCoordinate(basicInfo.lat) &&
                      isFiniteCoordinate(basicInfo.lng) && (
                        <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-600">
                          lat: {Number(basicInfo.lat).toFixed(6)}
                          <br />
                          lng: {Number(basicInfo.lng).toFixed(6)}
                        </div>
                      )}
                  </div>

                  {showDeveloperUI && (
                    <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-sm font-semibold text-gray-800">
                        이동 조건 체크
                      </p>
                      <div className="mt-4 space-y-2 text-xs text-gray-500">
                        <p>
                          {polygonLoading ? "조회 중" : "조회 완료"}: Polygon
                          데이터
                        </p>
                        <p>
                          {geoEditorError || pointEditorError
                            ? "오류 있음"
                            : "정상"}
                          : geo / point JSON
                        </p>
                        <p>
                          {payloadValidationErrors.length === 0
                            ? "통과"
                            : `누락 ${payloadValidationErrors.length}건`}
                          : payload validation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 px-6 py-6">
              {showDeveloperUI && (
                <InfoBanner
                  tone={reviewValidationErrors.length === 0 ? "green" : "red"}
                  title={
                    reviewValidationErrors.length === 0
                      ? "등록 전 검증을 통과했습니다."
                      : "등록 전에 수정이 필요한 항목이 있습니다."
                  }
                  description={
                    reviewValidationErrors.length === 0
                      ? "우측 하단 등록 버튼으로 마지막 확인 팝업을 띄운 뒤 실제 등록 API를 호출할 수 있습니다."
                      : `다음 항목을 확인해 주세요: ${reviewValidationErrors.join(", ")}`
                  }
                />
              )}

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  {reviewSections.map((section) => (
                    <ReviewListSection
                      key={section.title}
                      title={section.title}
                      items={section.items}
                    />
                  ))}

                  <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-bold text-gray-900">
                        실거래가
                      </p>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        {registerPayload.data.deals.length}건
                      </span>
                    </div>
                    {registerPayload.data.deals.length === 0 ? (
                      <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400">
                        등록된 거래 정보가 없습니다.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {registerPayload.data.deals.map((deal, index) => (
                          <div
                            key={`review-deal-${index}`}
                            className="rounded-2xl bg-gray-50 px-4 py-3"
                          >
                            <p className="text-sm font-semibold text-gray-800">
                              거래 #{index + 1}
                            </p>
                            <div className="mt-3 divide-y divide-gray-200">
                              {buildDealReviewItems(deal).map(({ label, value }) => (
                                <div
                                  key={`review-deal-${index}-${label}`}
                                  className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
                                >
                                  <p className="text-sm font-medium text-gray-500">
                                    {label}
                                  </p>
                                  <p className="break-words text-sm font-medium text-gray-800 sm:text-right">
                                    {formatDisplayValue(value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {showDeveloperUI && (
                    <ReviewListSection
                      title="개발모드 참고 정보"
                      items={developerReviewItems}
                    />
                  )}

                  {showDeveloperUI && (
                    <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                      <p className="text-base font-bold text-gray-900">
                        최종 등록 payload 미리보기
                      </p>
                      <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl bg-gray-950 p-4 text-xs leading-6 text-gray-100">
                        {formatJson(registerPayload)}
                      </pre>
                    </div>
                  )}

                  {showDeveloperUI && (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                      <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-800">
                          최종 검증 체크리스트
                        </p>
                        <div className="mt-4 space-y-3">
                          {[
                            {
                              label: "기본 정보 입력",
                              passed: basicInfoErrors.length === 0,
                              detail:
                                basicInfoErrors.length === 0
                                  ? "매물명, 매매가, 주소, 지역 코드가 모두 준비되었습니다."
                                  : basicInfoErrors.join(", "),
                            },
                            {
                              label: "Payload validation",
                              passed: payloadValidationErrors.length === 0,
                              detail:
                                payloadValidationErrors.length === 0
                                  ? "geo, point, data, sale_price 필드 구성이 모두 완료되었습니다."
                                  : payloadValidationErrors.join(", "),
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-2xl border px-4 py-3 ${
                                item.passed
                                  ? "border-green-100 bg-green-50"
                                  : "border-red-100 bg-red-50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <i
                                  className={`${
                                    item.passed
                                      ? "ri-checkbox-circle-line text-green-500"
                                      : "ri-error-warning-line text-red-500"
                                  } mt-0.5 text-lg`}
                                ></i>
                                <div>
                                  <p
                                    className={`text-sm font-semibold ${
                                      item.passed
                                        ? "text-green-800"
                                        : "text-red-700"
                                    }`}
                                  >
                                    {item.label}
                                  </p>
                                  <p
                                    className={`mt-1 text-xs leading-5 ${
                                      item.passed
                                        ? "text-green-700"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {item.detail}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-gray-800">
                          등록 원칙
                        </p>
                        <ul className="mt-4 space-y-2 text-xs leading-5 text-gray-500">
                          <li>
                            실제 등록 API는 마지막 확인 이후 1회만 호출됩니다.
                          </li>
                          <li>
                            입력값은 현재 화면에서만 검증되고, 검증 실패 시
                            등록할 수 없습니다.
                          </li>
                          <li>
                            성공 시 응답의 `table_name`, `real_region_id`를 결과
                            팝업에 표시합니다.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl border border-gray-100 p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <i className="ri-map-pin-line text-orange-500"></i>
                      <span className="text-sm font-semibold text-gray-800">
                        등록 위치 지도
                      </span>
                    </div>
                    <div className="h-[320px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      <NaverMiniMap location={mapLocation} />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      최종 등록 전에 위치 정보를 한 번 더 확인할 수 있습니다.
                    </p>
                    {showDeveloperUI &&
                      isFiniteCoordinate(basicInfo.lat) &&
                      isFiniteCoordinate(basicInfo.lng) && (
                        <div className="mt-3 rounded-2xl bg-gray-50 p-4 text-xs leading-6 text-gray-600">
                          lat: {Number(basicInfo.lat).toFixed(6)}
                          <br />
                          lng: {Number(basicInfo.lng).toFixed(6)}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                onClose?.();
                return;
              }

              setStep((prev) => prev - 1);
            }}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            {step === 1 ? "취소" : "이전"}
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold text-gray-500">
              {currentStepLabel}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              {[1, 2, 3].map((indicator) => (
                <div
                  key={indicator}
                  className={`h-2 rounded-full transition-all ${
                    indicator === step
                      ? "w-8 bg-orange-500"
                      : indicator < step
                        ? "w-3 bg-green-400"
                        : "w-3 bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                step === 1
                  ? basicInfoErrors.length > 0
                  : polygonLoading ||
                    !!polygonError ||
                    payloadValidationErrors.length > 0
              }
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={reviewValidationErrors.length > 0 || submitLoading}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitLoading ? "등록 중..." : "등록"}
            </button>
          )}
        </div>
      </div>

      {confirmOpen && (
        <ModalDialog
          title="토지 매물 등록을 진행할까요?"
          onClose={() => setConfirmOpen(false)}
          actions={
            <>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                확인 후 등록
              </button>
            </>
          }
        >
          <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-900">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">매물명</span>
              <span>{basicInfo.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">매매가</span>
              <span>{basicInfo.price}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">주소</span>
              <span className="text-right">{basicInfo.address}</span>
            </div>
            {showDeveloperUI && (
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">region</span>
                <span>{registerPayload.region}</span>
              </div>
            )}
            {showDeveloperUI && (
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">PNU</span>
                <span>{registerPayload.data.pnu}</span>
              </div>
            )}
          </div>
        </ModalDialog>
      )}

      {resultState && (
        <ModalDialog
          title={resultState.title}
          description={resultState.description}
          onClose={closeResultDialog}
          tone={resultState.tone}
          actions={
            <button
              type="button"
              onClick={closeResultDialog}
              className={`rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                resultState.tone === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              확인
            </button>
          }
        >
          {resultState.content}
        </ModalDialog>
      )}
    </div>
  );
}

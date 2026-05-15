import { ResponsiveLine } from "@nivo/line";
import { useTooltip } from "@nivo/tooltip";
import { useEffect, useState } from "react";

const CHART_MARGIN = { bottom: 20, left: 70, right: 50, top: 10 };
const TOOLTIP_THEME = {
  tooltip: {
    container: {
      background: "transparent",
      boxShadow: "none",
      padding: 0,
      whiteSpace: "nowrap",
      wordBreak: "keep-all",
      writingMode: "horizontal-tb",
      textOrientation: "mixed",
      direction: "ltr",
    },
  },
};

function PriceHistoryChart({ sideMapData }) {
  const [data, setData] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const calculateRange = (values) => {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const rangeOffset = (maxValue - minValue) * 0.2;

    let newMin = minValue - rangeOffset;
    let newMax = maxValue + rangeOffset;

    if (newMin < 0) {
      newMin = 0;
    }

    setMin(newMin);
    setMax(newMax);
  };

  const formatCurrency = (value) => {
    const billion = 100000000; // 1억
    const million = 10000; // 1만
    const trillion = billion * 10000; // 1조

    if (value >= trillion) {
      const trillionPart = Math.floor(value / trillion);
      const remainder = value % trillion;
      const billionPart = Math.round(remainder / billion);
      return billionPart
        ? `${trillionPart}조 ${billionPart}억`
        : `${trillionPart}조`;
    } else if (value >= billion) {
      const billionPart = Math.floor(value / billion);
      const remainder = value % billion;
      const millionPart = Math.floor(remainder / million);
      return millionPart
        ? `${billionPart}억 ${millionPart}만`
        : `${billionPart}억`;
    } else {
      return Math.round(value / million) + "만";
    }
  };

  useEffect(() => {
    if (!sideMapData) return;
    const props = sideMapData?.properties;
    if (!props) return;

    const asisPrices = props?.asisPrices ? props.asisPrices : props.government;
    const landArea = props?.landArea ? props.landArea : props.land_area;
    const landPrice = props?.landPrice
      ? props.landPrice
      : props.government?.gvm_price;
    const deals = props?.realEstatePrices?.deals
      ? props.realEstatePrices.deals
      : props.deals || [];
    if (!asisPrices || !landArea || !landPrice) return;

    const publicPriceByYear = {
      2021: asisPrices.price4 ? asisPrices.price4 : asisPrices.gvm_price4,
      2022: asisPrices.price3 ? asisPrices.price3 : asisPrices.gvm_price3,
      2023: asisPrices.price2 ? asisPrices.price2 : asisPrices.gvm_price2,
      2024: asisPrices.price1 ? asisPrices.price1 : asisPrices.gvm_price1,
      2025: landPrice,
    };

    const dealMap = {};
    deals.forEach((deal) => {
      const { dealYear, dealMonth, dealAmount } = deal;
      const ym = `${dealYear}-${String(dealMonth).padStart(2, "0")}`;
      dealMap[ym] = dealAmount;
    });
    const startYear = 2021;
    const endYear = 2025;
    const monthlyTimeline = [];
    for (let y = startYear; y <= endYear; y++) {
      for (let m = 1; m <= 12; m++) {
        const ymStr = `${y}-${String(m).padStart(2, "0")}`;
        monthlyTimeline.push({ year: y, month: m, ymStr });
      }
    }

    let lastDealValue = null;
    const realEstateData = [];
    const publicPriceData = [];

    monthlyTimeline.forEach(({ year, month, ymStr }) => {
      let pubUnitPrice = 0;
      if (publicPriceByYear[year]) {
        pubUnitPrice = publicPriceByYear[year];
      }
      const pubTotal = pubUnitPrice * landArea; // 전체 금액(원)

      let dealValueInWon;
      if (dealMap[ymStr] !== undefined) {
        const dealStr = dealMap[ymStr];
        const dealManWon = parseFloat(dealStr) || 0;
        dealValueInWon = dealManWon * 10000; // 원
        lastDealValue = dealValueInWon;
      } else {
        dealValueInWon = lastDealValue == null ? 0 : lastDealValue;
      }

      realEstateData.push({ x: ymStr, y: Number(dealValueInWon) });
      publicPriceData.push({ x: ymStr, y: pubTotal });
    });

    const finalData = [
      {
        id: "공시지가",
        color: "hsl(217, 70%, 50%)",
        data: publicPriceData,
      },
      deals && {
        id: "실거래가",
        color: "hsl(131, 70%, 50%)",
        data: realEstateData,
      },
    ];
    const values = [
      ...realEstateData.map((p) => p.y),
      ...publicPriceData.map((p) => p.y),
    ];
    calculateRange(values);
    setData(finalData);
  }, [sideMapData]);

  const tickYears = [];
  for (let y = 2021; y <= 2025; y++) {
    tickYears.push(`${y}-01`);
  }

  const getClientPoint = (event) => {
    if (event?.touches?.length) {
      return event.touches[0];
    }
    if (event?.changedTouches?.length) {
      return event.changedTouches[0];
    }
    return event;
  };

  const getTooltipPosition = (event) => {
    const clientPoint = getClientPoint(event);
    if (!clientPoint) return null;

    const { clientX, clientY } = clientPoint;
    if (clientX == null || clientY == null) return null;

    const svgElement = event.currentTarget?.ownerSVGElement;
    const container = svgElement?.parentElement;
    if (!container) return null;

    const bounds = container.getBoundingClientRect();
    const offsetWidth = container.offsetWidth;
    const scaling =
      offsetWidth === bounds.width ? 1 : offsetWidth / bounds.width;
    const x = (clientX - bounds.left) * scaling;
    const y = (clientY - bounds.top) * scaling;
    return { x, y };
  };

  const renderSliceTooltip = (slice) => {
    if (!slice || !slice.points || slice.points.length === 0) {
      return null;
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const [year, month] = dateStr.split("-");
      return `${year}년 ${parseInt(month)}월`;
    };

    const firstPoint = slice.points[0];
    const dateValue = firstPoint?.data?.x || "";

    return (
      <div className="detail_sidebar_chart_tooltip">
        <div className="detail_sidebar_chart_tooltip_title">
          {formatDate(dateValue)}
        </div>
        {slice.points.map((point, index) => {
          const yValue = point.data?.y || 0;
          const color = point.serieColor || point.color || "#000";

          const colorStr = color.toLowerCase();
          const colorLabelMap = {
            f47560: "실거래가",
            e8c1a0: "공시지가",
          };
          const matchedColorKey = Object.keys(colorLabelMap).find((key) =>
            colorStr.includes(key)
          );
          const serieId =
            (matchedColorKey && colorLabelMap[matchedColorKey]) ||
            point.serieId ||
            data.find((d) => d.color === color)?.id ||
            data[index]?.id ||
            `시리즈 ${index + 1}`;

          return (
            <div
              key={point.id || point.serieId || index}
              className="detail_sidebar_chart_tooltip_row"
            >
              <span
                className="detail_sidebar_chart_tooltip_chip"
                style={{
                  backgroundColor: color,
                }}
              />
              <span className="detail_sidebar_chart_tooltip_label">
                {serieId}:
              </span>
              <span>
                {typeof yValue === "number" && yValue > 0
                  ? formatCurrency(yValue)
                  : "-"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const CustomSlicesLayer = ({ slices, setCurrentSlice, innerWidth }) => {
    const { showTooltipAt, hideTooltip } = useTooltip();

    const showTooltipForSlice = (slice, event) => {
      const position = getTooltipPosition(event);
      if (!position) return;

      const sliceCenter = slice.x ?? slice.x0 + slice.width / 2;
      const chartCenter = innerWidth ? innerWidth / 2 : 0;
      const anchor =
        innerWidth && sliceCenter >= chartCenter ? "left" : "right";

      showTooltipAt(
        renderSliceTooltip(slice),
        [position.x, position.y],
        anchor
      );
      setCurrentSlice(slice);
    };

    const hideTooltipForSlice = () => {
      hideTooltip();
      setCurrentSlice(null);
    };

    return (
      <g>
        {slices.map((slice) => (
          <rect
            key={slice.id}
            x={slice.x0}
            y={slice.y0}
            width={slice.width}
            height={slice.height}
            fill="transparent"
            onMouseEnter={(event) => showTooltipForSlice(slice, event)}
            onMouseMove={(event) => showTooltipForSlice(slice, event)}
            onMouseLeave={hideTooltipForSlice}
            onTouchStart={(event) => showTooltipForSlice(slice, event)}
            onTouchMove={(event) => showTooltipForSlice(slice, event)}
            onTouchEnd={hideTooltipForSlice}
          />
        ))}
      </g>
    );
  };

  return (
    <ResponsiveLine
      data={data}
      defs={[
        {
          id: "gradientA",
          type: "linearGradient",
          colors: [
            { offset: 0, color: "inherit" },
            { offset: 100, color: "inherit", opacity: 0 },
          ],
        },
      ]}
      fill={[{ match: "*", id: "gradientA" }]}
      enableSlices="x"
      enableGridX={false}
      enableTouchCrosshair
      enablePoints={false}
      height={200}
      layers={[
        "grid",
        "markers",
        "axes",
        "areas",
        "crosshair",
        "lines",
        "points",
        CustomSlicesLayer,
        "mesh",
        "legends",
      ]}
      margin={CHART_MARGIN}
      theme={TOOLTIP_THEME}
      width={388}
      yScale={{
        type: "linear",
        stacked: false,
        min: min,
        max: max,
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: formatCurrency,
        legendOffset: -65,
      }}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        format: (value) => value.slice(0, 4),
        tickValues: tickYears,
      }}
      yFormat=" >-.2d"
    />
  );
}

export default PriceHistoryChart;

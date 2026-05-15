import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleMapType,
  setLayerVisible,
} from "../../redux/mapState";

const MAP_TYPES = [
  { key: "roadmap", label: "일반지도" },
  { key: "satellite", label: "위성지도" },
  { key: "cadastral", label: "지적도" },
];

function MapTypeControl() {
  const dispatch = useDispatch();
  const { currentMapFlag, isLayerVisible } = useSelector(
    (state) => state.map
  );

  // 현재 활성 타입 결정 (exclusive: 하나만 활성)
  const getActiveType = () => {
    if (isLayerVisible) return "cadastral";
    if (currentMapFlag === 1) return "satellite";
    return "roadmap";
  };

  const activeType = getActiveType();

  const handleMapType = (type) => {
    if (type === activeType) return;

    switch (type) {
      case "roadmap":
        if (currentMapFlag === 1) dispatch(toggleMapType());
        if (isLayerVisible) dispatch(setLayerVisible(false));
        break;
      case "satellite":
        if (currentMapFlag !== 1) dispatch(toggleMapType());
        if (isLayerVisible) dispatch(setLayerVisible(false));
        break;
      case "cadastral":
        if (currentMapFlag === 1) dispatch(toggleMapType());
        dispatch(setLayerVisible(true));
        break;
      default:
        break;
    }
  };

  return (
    <div className="absolute left-2 md:left-4 top-4 md:top-20 bg-white rounded-xl shadow-lg overflow-hidden z-20">
      {MAP_TYPES.map((type, idx) => (
        <div key={type.key}>
          {idx > 0 && <div className="h-px bg-gray-200"></div>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMapType(type.key);
            }}
            className={`w-full px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeType === type.key
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {type.label}
          </button>
        </div>
      ))}
    </div>
  );
}

export default MapTypeControl;

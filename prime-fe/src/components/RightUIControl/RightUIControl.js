import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DEFAULT_LOCATION,
  toggleMapType,
  toggleLayer,
  togglePublicHouse,
  moveToCenter,
} from "../../redux/mapState";
import { getAnalytics, logEvent } from "firebase/analytics";

const RightUIControl = () => {
  const dispatch = useDispatch();
  const { currentMapFlag, isLayerVisible, isPublicHouseVisible, currentLocation } = useSelector(
    (state) => state.map
  );
  const analytics = getAnalytics();

  const handleMapTypeChange = () => {
    logEvent(analytics, "right_ui_control_map_type_change_btn", {
      content_type: "Button",
      content_id: "map_type_change_btn",
    });
    dispatch(toggleMapType());
  };

  const handleLayerToggle = () => {
    logEvent(analytics, "right_ui_control_layer_toggle_btn", {
      content_type: "Button",
      content_id: "layer_toggle_btn",
    });
    dispatch(toggleLayer());
  };

  const handlePublicHouseToggle = () => {
    logEvent(analytics, "right_ui_control_public_house_toggle_btn", {
      content_type: "Button",
      content_id: "public_house_toggle_btn",
    });
    dispatch(togglePublicHouse());
  };

  const handleMoveToCenter = () => {
    if (!currentLocation) return;
    logEvent(analytics, "right_ui_control_location_btn", {
      content_type: "Button",
      content_id: "location_btn",
    });
    dispatch(moveToCenter());
  };

  return (
    <div className="w-fit fixed top-[146px] right-2.5 z-20">
      <div className="flex flex-col gap-2">
        <div className="w-10 h-10 text-sm font-medium border-none rounded-lg flex items-center justify-center text-center text-gray-500 bg-white cursor-pointer shadow-lg relative transition-all hover:bg-gray-50 hover:scale-105" onClick={handleMoveToCenter}>
          {currentLocation && currentLocation !== DEFAULT_LOCATION ? (
            <i className="ri-focus-3-line text-xl text-gray-500"></i>
          ) : currentLocation === DEFAULT_LOCATION ? (
            <i className="ri-wifi-off-line text-xl text-gray-500"></i>
          ) : null}
        </div>
        <div
          className={`w-10 h-10 text-sm font-medium border-none rounded-lg flex items-center justify-center text-center text-gray-500 bg-white cursor-pointer shadow-lg relative transition-all hover:bg-gray-50 hover:scale-105 ${currentMapFlag === 1 ? 'bg-orange-500 text-white' : ''}`}
          onClick={handleMapTypeChange}
        >
          <i className={`ri-compass-3-line text-xl ${currentMapFlag === 1 ? 'text-white' : 'text-gray-500'}`}></i>
        </div>
        <div
          className={`w-10 h-10 text-sm font-medium border-none rounded-lg flex items-center justify-center text-center text-gray-500 bg-white cursor-pointer shadow-lg relative transition-all hover:bg-gray-50 hover:scale-105 ${isLayerVisible ? 'bg-orange-500 text-white' : ''}`}
          onClick={handleLayerToggle}
        >
          <i className={`ri-stack-line text-xl ${isLayerVisible ? 'text-white' : 'text-gray-500'}`}></i>
        </div>
        <div
          className={`w-10 h-10 text-sm font-medium border-none rounded-lg flex items-center justify-center text-center text-gray-500 bg-white cursor-pointer shadow-lg relative transition-all hover:bg-gray-50 hover:scale-105 ${isPublicHouseVisible ? 'bg-orange-500 text-white' : ''}`}
          onClick={handlePublicHouseToggle}
        >
          <i className={`ri-home-4-line text-xl ${isPublicHouseVisible ? 'text-white' : 'text-gray-500'}`}></i>
        </div>
      </div>
    </div>
  );
};

export default RightUIControl;

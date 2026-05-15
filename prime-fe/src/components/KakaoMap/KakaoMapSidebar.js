import React, { useEffect, useRef } from "react";
import { DEFAULT_LOCATION } from "../../redux/mapState";

function KakaoMapSidebar({ sideMapData }) {
  const mapRef = useRef(null);
  const polygonRef = useRef(null);

  const calculatePolygonCenter = (paths) => {
    if (!paths || paths.length === 0) return DEFAULT_LOCATION;

    let totalLat = 0;
    let totalLng = 0;

    paths.forEach((point) => {
      totalLat += point.lat;
      totalLng += point.lng;
    });

    const center = {
      lat: totalLat / paths.length,
      lng: totalLng / paths.length,
    };

    return center;
  };

  useEffect(() => {
    const mapContainer = document.getElementById("kmap_mini");

    if (!sideMapData || !sideMapData.paths) return;

    const polygonCenter = calculatePolygonCenter(sideMapData.paths);

    const mapOptions = {
      center: new window.kakao.maps.LatLng(
        polygonCenter.lat || DEFAULT_LOCATION.lat,
        polygonCenter.lng || DEFAULT_LOCATION.lng
      ),
      level: 2,
      draggable: false,
      scrollwheel: false,
      disableDoubleClick: true,
      disableDoubleClickZoom: true,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOptions);
    mapRef.current = map;

    const polygonPath = sideMapData.paths.map(
      (coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng)
    );

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
    const polygon = new window.kakao.maps.Polygon({
      path: polygonPath,
      strokeWeight: 1,
      strokeColor: "#0000FF",
      strokeOpacity: 0.5,
      fillColor: "#0000FF",
      fillOpacity: 0.3,
      clickable: false,
    });

    polygon.setMap(map);
    polygonRef.current = polygon;

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
    };
  }, [sideMapData]);

  return (
    <div
      id="kmap_mini"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 0,
        cursor: "default",
      }}
    />
  );
}

export default KakaoMapSidebar;

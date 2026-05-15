import React, { useEffect, useRef } from "react";
import { DEFAULT_LOCATION } from "../../redux/mapState";

function NaverMapSidebar({ sideMapData }) {
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
    const mapContainer = document.getElementById("nmap_mini");
    if (!sideMapData || !sideMapData.paths) return;

    const polygonCenter = calculatePolygonCenter(sideMapData.paths);

    const mapOptions = {
      center: new window.naver.maps.LatLng(
        polygonCenter.lat || DEFAULT_LOCATION.lat,
        polygonCenter.lng || DEFAULT_LOCATION.lng
      ),
      zoom: 18,
      minZoom: 18,
      maxZoom: 18,
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
    };

    const map = new window.naver.maps.Map(mapContainer, mapOptions);
    mapRef.current = map;

    const polygonPath = sideMapData.paths.map(
      (coord) => new window.naver.maps.LatLng(coord.lat, coord.lng + 0.00003)
    );

    const polygon = new window.naver.maps.Polygon({
      map: mapRef.current,
      paths: polygonPath,
      strokeWeight: 1,
      strokeColor: "#0000FF",
      strokeOpacity: 0.5,
      fillColor: "#0000FF",
      fillOpacity: 0.3,
      clickable: false,
    });

    polygonRef.current = polygon;
  }, [sideMapData, mapRef]);

  return (
    <div
      id="nmap_mini"
      style={{ width: "100%", height: "100%", cursor: "default" }}
    />
  );
}

export default NaverMapSidebar;

import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useGeolocation from "../../hooks/useGeolocation";
import {
  createKakaoMarker,
  createKakaoPriceMarker,
} from "../common/CurrentLocMarker";
import {
  resetMoveToCenter,
  setMapCenter,
  setZoomLevel,
  fetchPolygons,
  updateCurrentBounds,
  sidebarMapData,
  DEFAULT_LOCATION,
} from "../../redux/mapState";
import { logEvent, getAnalytics } from "firebase/analytics";
import usePolygon from "../../hooks/usePolygon";

function KakaoMapDefault({ setSidebar }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const dataMarkersRef = useRef([]);
  const selectedPolygonRef = useRef(null);
  const dispatch = useDispatch();
  const {
    isLayerVisible,
    currentMapFlag,
    currentLocation,
    moveToCenter,
    zoomLevel,
    mapCenter,
    polygons,
  } = useSelector((state) => state.map);
  const analytics = getAnalytics();
  const { sendPoint } = usePolygon();

  useGeolocation();

  const handleMapStateChange = useCallback(() => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    dispatch(
      setMapCenter({
        lat: center.getLat(),
        lng: center.getLng(),
      })
    );

    const level = mapRef.current.getLevel();
    dispatch(setZoomLevel(20 - level));

    const bounds = mapRef.current.getBounds();
    dispatch(
      updateCurrentBounds({
        neLat: bounds.getNorthEast().getLat(),
        neLng: bounds.getNorthEast().getLng(),
        swLat: bounds.getSouthWest().getLat(),
        swLng: bounds.getSouthWest().getLng(),
      })
    );
    dispatch(fetchPolygons());
  }, [dispatch]);

  const clickEventHandler = useCallback(
    (e, polygonPath, polygonData) => {
      if (e.stopPropagation) e.stopPropagation();

      if (selectedPolygonRef.current) {
        selectedPolygonRef.current.setMap(null);
      }

      selectedPolygonRef.current = new window.kakao.maps.Polygon({
        map: mapRef.current,
        path: polygonPath,
        strokeWeight: 2,
        strokeColor: "#0000FF",
        strokeOpacity: 0.7,
        fillColor: "#0000FF",
        fillOpacity: 0.3,
        clickable: true,
      });
      const boundsObj = new window.kakao.maps.LatLngBounds();
      polygonPath.forEach((latlng) => boundsObj.extend(latlng));
      const ne = boundsObj.getNorthEast();
      const sw = boundsObj.getSouthWest();
      const centerLat = (ne.getLat() + sw.getLat()) / 2;
      const centerLng = (ne.getLng() + sw.getLng()) / 2;
      const center = new window.kakao.maps.LatLng(centerLat, centerLng);

      // 지도 중심을 부드럽게 이동
      mapRef.current.panTo(center);

      dispatch(
        sidebarMapData({
          bounds: {
            neLat: boundsObj.getNorthEast().getLat(),
            neLng: boundsObj.getNorthEast().getLng(),
            swLat: boundsObj.getSouthWest().getLat(),
            swLng: boundsObj.getSouthWest().getLng(),
          },
          properties: polygonData.properties,
          paths: polygonData.paths,
          clickPosition: { lat: e.latLng.getLat(), lng: e.latLng.getLng() },
        })
      );
      setSidebar(true);
    },
    [dispatch, setSidebar]
  );

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || mapRef.current) return;

    const mapContainer = document.getElementById("kmap");
    const mapOptions = {
      center: new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng),
      level: 20 - zoomLevel,
      mapTypeId:
        currentMapFlag === 1
          ? window.kakao.maps.MapTypeId.HYBRID
          : window.kakao.maps.MapTypeId.ROADMAP,
    };

    const map = new window.kakao.maps.Map(mapContainer, mapOptions);
    mapRef.current = map;
    window.kakao.maps.event.addListener(
      mapRef.current,
      "idle",
      handleMapStateChange
    );
    window.kakao.maps.event.addListener(mapRef.current, "dragend", (e) => {
      logEvent(analytics, "kakao_map_drag", {
        content_type: "MapDrag",
        content_id: "map_dragend",
      });
    });
    setSidebar(false);
  }, [
    analytics,
    currentMapFlag,
    handleMapStateChange,
    mapCenter.lat,
    mapCenter.lng,
    setSidebar,
    zoomLevel,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (currentMapFlag === 1) {
      mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
    } else {
      mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
    }
  }, [currentMapFlag]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (isLayerVisible) {
      mapRef.current.addOverlayMapTypeId(
        window.kakao.maps.MapTypeId.USE_DISTRICT
      );
    } else {
      mapRef.current.removeOverlayMapTypeId(
        window.kakao.maps.MapTypeId.USE_DISTRICT
      );
    }
  }, [isLayerVisible]);

  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    if (currentLocation !== DEFAULT_LOCATION) {
      markerRef.current = createKakaoMarker(mapRef.current, currentLocation);
    }
    handleMapStateChange();
  }, [currentLocation, dispatch, handleMapStateChange]);

  useEffect(() => {
    if (!mapRef.current || !moveToCenter || !currentLocation) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng)
    );
    dispatch(setMapCenter(currentLocation));
    dispatch(resetMoveToCenter());
  }, [moveToCenter, currentLocation, dispatch]);

  useEffect(() => {
    if (!mapRef.current || !mapCenter || !currentLocation) return;
    const setCenter = new window.kakao.maps.LatLng(
      mapCenter.lat,
      mapCenter.lng
    );
    mapRef.current.setCenter(setCenter);
  }, [mapCenter, currentLocation]);

  useEffect(() => {
    if (!mapRef.current) return;

    dataMarkersRef.current.forEach((marker) => marker.setMap(null));
    dataMarkersRef.current = [];

    polygons.map((polygonData) => {
      if (!polygonData.properties?.point) return;
      const polygonPath = polygonData.paths.map(
        (coord) => new window.kakao.maps.LatLng(coord.lat, coord.lng)
      );

      const marker = createKakaoPriceMarker(mapRef.current, polygonData);
      if (!marker) return;
      marker.setMap(mapRef.current);

      window.kakao.maps.event.addListener(marker, "click", () => {
        const pos = marker.getPosition();
        clickEventHandler({ latLng: pos }, polygonPath, polygonData);
      });
      dataMarkersRef.current.push(marker);
    });
  }, [clickEventHandler, polygons]);

  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;
    const map = mapRef.current;
    const handleMapClick = async (e) => {
      if (selectedPolygonRef.current) {
        selectedPolygonRef.current.setMap(null);
      }

      const clickedLat = e.latLng.getLat();
      const clickedLng = e.latLng.getLng();

      const response = await sendPoint(clickedLat, clickedLng);
      if (!response || response.length === 0) return;
      const polygonData = response[0];

      const polygonPath = polygonData.coordinates.map(
        (coord) => new window.kakao.maps.LatLng(coord[1], coord[0])
      );
      selectedPolygonRef.current = new window.kakao.maps.Polygon({
        map: map,
        path: polygonPath,
        strokeWeight: 2,
        strokeColor: "#0000FF",
        strokeOpacity: 0.7,
        fillColor: "#0000FF",
        fillOpacity: 0.3,
        clickable: true,
      });

      const boundsObj = new window.kakao.maps.LatLngBounds();
      polygonPath.forEach((latlng) => boundsObj.extend(latlng));
      const ne = boundsObj.getNorthEast();
      const sw = boundsObj.getSouthWest();
      const centerLat = (ne.getLat() + sw.getLat()) / 2;
      const centerLng = (ne.getLng() + sw.getLng()) / 2;
      const center = new window.kakao.maps.LatLng(centerLat, centerLng);
      mapRef.current.panTo(center);

      dispatch(
        sidebarMapData({
          bounds: {
            neLat: boundsObj.getNorthEast().getLat(),
            neLng: boundsObj.getNorthEast().getLng(),
            swLat: boundsObj.getSouthWest().getLat(),
            swLng: boundsObj.getSouthWest().getLng(),
          },
          paths: polygonPath.map((point) => ({
            lat: point.getLat(),
            lng: point.getLng(),
          })),
          properties: polygonData,
          clickPosition: { lat: e.latLng.getLat(), lng: e.latLng.getLng() },
        })
      );
      setSidebar(true);
    };

    window.kakao.maps.event.addListener(map, "click", handleMapClick);
    return () => {
      window.kakao.maps.event.removeListener(map, "click", handleMapClick);
    };
  }, [dispatch, mapCenter, sendPoint, setSidebar]);

  return (
    <div
      id="kmap"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

export default KakaoMapDefault;

import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import useGeolocation from "../../hooks/useGeolocation";
import {
  createVWorldMarker,
  createVWorldPriceMarker,
} from "../common/CurrentLocMarker";
import {
  DEFAULT_LOCATION,
  resetMoveToCenter,
  setZoomLevel,
  setMapCenter,
  fetchPolygons,
  updateCurrentBounds,
  sidebarMapData,
} from "../../redux/mapState";
import { logEvent, getAnalytics } from "firebase/analytics";
import usePolygon from "../../hooks/usePolygon";

function VWorldMapDefault({ setSidebar }) {
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const dataMarkersRef = useRef([]);
  const layersRef = useRef({});
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

    const view = mapRef.current.getView();
    const newCenter = window.ol.proj.transform(
      view.getCenter(),
      "EPSG:3857",
      "EPSG:4326"
    );
    dispatch(
      setMapCenter({
        lat: newCenter[1],
        lng: newCenter[0],
      })
    );
    const newZoomLevel = view.getZoom();
    dispatch(setZoomLevel(newZoomLevel));

    const mapSize = mapRef.current.getSize();
    const extent = view.calculateExtent(mapSize);

    const transformedExtent = window.ol.proj.transformExtent(
      extent,
      "EPSG:3857",
      "EPSG:4326"
    );
    dispatch(
      updateCurrentBounds({
        swLng: transformedExtent[0],
        swLat: transformedExtent[1],
        neLng: transformedExtent[2],
        neLat: transformedExtent[3],
      })
    );
    dispatch(fetchPolygons());
  }, [dispatch]);

  useEffect(() => {
    if (!window.vw || !window.vw.ol3 || mapRef.current) return;

    const mapContainer = document.getElementById("vmap");

    const initCamera = window.vw.ol3.CameraPosition;
    const oriProj = window.vw.ol3.ViewConfig.ORIPROJ;
    const disProj = window.vw.ol3.ViewConfig.DISPROJ;

    const mercatorCoords = window.ol.proj.transform(
      [mapCenter.lng, mapCenter.lat],
      disProj,
      oriProj
    );
    initCamera.center = mercatorCoords;
    initCamera.zoom = zoomLevel;

    const mapOptions = {
      basemapType:
        currentMapFlag === 1
          ? window.vw.ol3.BasemapType.PHOTO_HYBRID
          : window.vw.ol3.BasemapType.GRAPHIC,
      controlDensity: window.vw.ol3.DensityType.EMPTY,
      interactionDensity: window.vw.ol3.DensityType.BASIC,
      controlsAutoArrange: true,
      homePosition: initCamera,
      initPosition: initCamera,
    };

    const vmap = new window.vw.ol3.Map(mapContainer, mapOptions);
    mapRef.current = vmap;

    const cadastralLayer = mapRef.current.addNamedLayer(
      "지적도",
      "lp_pa_cbnd_bubun"
    );

    if (cadastralLayer) {
      layersRef.current = {
        cadastral: cadastralLayer,
      };
      mapRef.current.addLayer(cadastralLayer);
    }

    if (currentLocation !== DEFAULT_LOCATION) {
      markerLayerRef.current = createVWorldMarker(
        mapRef.current,
        currentLocation
      );
    }

    const view = mapRef.current.getView();
    view.setCenter(mercatorCoords);
    view.setZoom(zoomLevel);
    mapRef.current.on("moveend", handleMapStateChange);
    mapRef.current.on("dragend", () => {
      logEvent(analytics, "vworld_map_drag", {
        content_type: "MapDrag",
        content_id: "map_dragend",
      });
    });
  });

  useEffect(() => {
    if (!mapRef.current || !layersRef.current) return;

    const { cadastral } = layersRef.current;
    if (isLayerVisible) {
      cadastral.setVisible(true);
    } else {
      cadastral.setVisible(false);
    }
  }, [isLayerVisible]);

  useEffect(() => {
    if (!mapRef.current) return;

    const basemapType =
      currentMapFlag === 1
        ? window.vw.ol3.BasemapType.PHOTO_HYBRID
        : window.vw.ol3.BasemapType.GRAPHIC;

    mapRef.current.setBasemapType(basemapType);
  }, [currentMapFlag]);

  useEffect(() => {
    if (!mapRef.current || currentLocation === DEFAULT_LOCATION) return;

    if (markerLayerRef.current) {
      mapRef.current.removeLayer(markerLayerRef.current);
      markerLayerRef.current = null;
    }
    markerLayerRef.current = createVWorldMarker(
      mapRef.current,
      currentLocation
    );
  }, [currentLocation]);

  useEffect(() => {
    if (!mapRef.current || !moveToCenter || !currentLocation) return;
    const mercatorCoords = window.ol.proj.transform(
      [currentLocation.lng, currentLocation.lat],
      "EPSG:4326",
      "EPSG:3857"
    );
    const view = mapRef.current.getView();
    view.setCenter(mercatorCoords);
    view.setZoom(zoomLevel);
    dispatch(resetMoveToCenter());
  }, [moveToCenter, currentLocation, dispatch, zoomLevel]);

  useEffect(() => {
    if (!mapRef.current) return;
    const mercatorCoords = window.ol.proj.transform(
      [mapCenter.lng, mapCenter.lat],
      "EPSG:4326",
      "EPSG:3857"
    );
    const view = mapRef.current.getView();
    const pan = window.ol.animation.pan({
      duration: 500,
      source: view.getCenter(),
      easing: window.ol.easing.easeOut,
    });
    mapRef.current.beforeRender(pan);
    view.setCenter(mercatorCoords);
  }, [mapCenter]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedPolygonRef.current) return;
    const selectionLayer = new window.ol.layer.Vector({
      source: new window.ol.source.Vector(),
      zIndex: 10,
    });
    mapRef.current.addLayer(selectionLayer);
    selectedPolygonRef.current = selectionLayer;
  }, [mapRef.current]);

  const clickEventHandler = useCallback(
    (e, polygonPath, polygonData) => {
      console.log(e);
      if (e.stopPropagation) e.stopPropagation();

      if (!selectedPolygonRef.current) {
        const selectionLayer = new window.ol.layer.Vector({
          source: new window.ol.source.Vector(),
          zIndex: 10,
        });
        mapRef.current.addLayer(selectionLayer);
        selectedPolygonRef.current = selectionLayer;
      } else {
        selectedPolygonRef.current.getSource().clear();
      }

      const polygonFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Polygon([polygonPath]),
        properties: polygonData.properties,
      });
      polygonFeature.setStyle(
        new window.ol.style.Style({
          stroke: new window.ol.style.Stroke({
            color: [0, 0, 255, 0.8],
            width: 2,
          }),
          fill: new window.ol.style.Fill({
            color: [0, 0, 255, 0.4],
          }),
        })
      );

      selectedPolygonRef.current.getSource().addFeature(polygonFeature);

      const extent = polygonFeature.getGeometry().getExtent();
      const center = window.ol.extent.getCenter(extent);
      mapRef.current.getView().animate({ center, duration: 500 });

      const extent4326 = window.ol.proj.transformExtent(
        extent,
        "EPSG:3857",
        "EPSG:4326"
      );
      dispatch(
        sidebarMapData({
          bounds: {
            neLng: extent4326[2],
            neLat: extent4326[3],
            swLng: extent4326[0],
            swLat: extent4326[1],
          },
          properties: polygonData.properties,
          paths: polygonData.paths,
          clickPosition: (() => {
            const pos4326 = window.ol.proj.transform(
              e.coordinate,
              "EPSG:3857",
              "EPSG:4326"
            );
            return { lat: pos4326[1], lng: pos4326[0] };
          })(),
        })
      );
      setSidebar(true);
    },
    [dispatch, setSidebar]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    dataMarkersRef.current.forEach((marker) => {
      mapRef.current.removeOverlay(marker);
    });
    dataMarkersRef.current = [];

    polygons.forEach((polygonData) => {
      if (!polygonData.properties?.point) return;
      const markerCoordinate = window.ol.proj.transform(
        [polygonData.properties.point.lng, polygonData.properties.point.lat],
        "EPSG:4326",
        "EPSG:3857"
      );

      const marker = createVWorldPriceMarker(
        mapRef.current,
        polygonData,
        markerCoordinate
      );
      if (!marker) return;
      dataMarkersRef.current.push(marker);

      const features = marker.getSource().getFeatures();
      if (features && features.length > 0) {
        const iconStyle = features[0].getStyle();
        if (iconStyle) {
          const markerEl = iconStyle.getImage && iconStyle.getImage();
          if (markerEl && markerEl.addEventListener) {
            markerEl.addEventListener("click", (e) => {
              e.stopPropagation();
              const polygonPath = polygonData.paths.map((coord) =>
                window.ol.proj.transform(
                  [coord.lng, coord.lat],
                  "EPSG:4326",
                  "EPSG:3857"
                )
              );
              clickEventHandler(e, polygonPath, polygonData);
            });
          }
        }
      }
    });
  }, [clickEventHandler, polygons]);

  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;
    const map = mapRef.current;
    const currentZoom = map.getView().getZoom();
    if (currentZoom < 18) {
      if (selectedPolygonRef.current) {
        map.removeLayer(selectedPolygonRef.current);
        selectedPolygonRef.current = null;
      }
      return;
    }

    const handleMapClick = async (e) => {
      if (selectedPolygonRef.current) {
        map.removeLayer(selectedPolygonRef.current);
      }

      const clickedLngLat = window.ol.proj.transform(
        e.coordinate,
        "EPSG:3857",
        "EPSG:4326"
      );
      const clickedLat = clickedLngLat[1];
      const clickedLng = clickedLngLat[0];

      const response = await sendPoint(clickedLat, clickedLng);
      if (!response || response.length === 0) return;
      const polygonData = response[0];

      const polygonPath = polygonData.coordinates.map((coord) =>
        window.ol.proj.transform(coord, "EPSG:4326", "EPSG:3857")
      );

      const polygonFeature = new window.ol.Feature({
        geometry: new window.ol.geom.Polygon([polygonPath]),
        properties: polygonData,
      });
      polygonFeature.setStyle(
        new window.ol.style.Style({
          stroke: new window.ol.style.Stroke({
            color: [0, 0, 255, 0.8],
            width: 2,
          }),
          fill: new window.ol.style.Fill({
            color: [0, 0, 255, 0.4],
          }),
        })
      );

      const vectorLayer = new window.ol.layer.Vector({
        source: new window.ol.source.Vector({ features: [polygonFeature] }),
        zIndex: 10,
      });
      map.addLayer(vectorLayer);
      selectedPolygonRef.current = vectorLayer;

      const extent = polygonFeature.getGeometry().getExtent();
      const view = mapRef.current.getView();
      const pan = window.ol.animation.pan({
        duration: 500,
        source: view.getCenter(),
        easing: window.ol.easing.easeOut,
      });
      mapRef.current.beforeRender(pan);

      const extent4326 = window.ol.proj.transformExtent(
        extent,
        "EPSG:3857",
        "EPSG:4326"
      );
      dispatch(
        sidebarMapData({
          bounds: {
            neLng: extent4326[2],
            neLat: extent4326[3],
            swLng: extent4326[0],
            swLat: extent4326[1],
          },
          paths: polygonPath.map((point) => {
            const pt4326 = window.ol.proj.transform(
              point,
              "EPSG:3857",
              "EPSG:4326"
            );
            return { lat: pt4326[1], lng: pt4326[0] };
          }),
          properties: polygonData,
          clickPosition: { lat: clickedLat, lng: clickedLng },
        })
      );
      setSidebar(true);
    };

    map.on("click", handleMapClick);
    return () => {
      map.un("click", handleMapClick);
    };
  }, [dispatch, mapCenter, sendPoint, setSidebar]);

  return <div id="vmap" style={{ width: "100%", height: "100%", zIndex: 0 }} />;
}

export default VWorldMapDefault;

import React, { useEffect, useRef } from "react";
import { DEFAULT_LOCATION } from "../../redux/mapState";

function VWorldMapSidebar({ sideMapData }) {
  const mapRef = useRef(null);
  const polygonLayerRef = useRef(null);

  const cleanupMap = () => {
    if (mapRef.current) {
      if (polygonLayerRef.current) {
        mapRef.current.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
      const interactions = mapRef.current.getInteractions().getArray();
      interactions.forEach((interaction) => {
        interaction.setActive(false);
      });
      mapRef.current.setTarget(null);
      mapRef.current = null;
    }
  };

  useEffect(() => {
    if (!window.vw || !window.vw.ol3 || !sideMapData || !sideMapData.paths)
      return;

    const mapContainer = document.getElementById("vmap_mini");
    if (!mapContainer) return;

    cleanupMap();

    const initCamera = window.vw.ol3.CameraPosition;
    const boundsArray = [
      sideMapData.bounds.swLng,
      sideMapData.bounds.swLat,
      sideMapData.bounds.neLng,
      sideMapData.bounds.neLat,
    ];
    const center4326 = window.ol.extent.getCenter(boundsArray);
    const mercatorCoords = window.ol.proj.transform(
      center4326,
      "EPSG:4326",
      "EPSG:3857"
    );

    initCamera.center = mercatorCoords;
    initCamera.zoom = 18;

    const mapOptions = {
      basemapType: window.vw.ol3.BasemapType.GRAPHIC,
      controlDensity: window.vw.ol3.DensityType.EMPTY,
      interactionDensity: window.vw.ol3.DensityType.EMPTY,
      controlsAutoArrange: true,
      homePosition: initCamera,
      initPosition: initCamera,
    };

    try {
      const vmap = new window.vw.ol3.Map(mapContainer, mapOptions);
      mapRef.current = vmap;

      const view = vmap.getView();
      view.setCenter(mercatorCoords);
      view.setZoom(18);

      vmap.getInteractions().forEach((interaction) => {
        interaction.setActive(false);
      });

      const polygonPath4326 = sideMapData.paths.map((coord) => [
        coord.lng,
        coord.lat,
      ]);
      const polygonPath = polygonPath4326.map((coord) =>
        window.ol.proj.transform(coord, "EPSG:4326", "EPSG:3857")
      );

      const polygon = new window.ol.Feature({
        geometry: new window.ol.geom.Polygon([polygonPath]),
        properties: sideMapData.properties,
      });

      polygon.setStyle(
        new window.ol.style.Style({
          stroke: new window.ol.style.Stroke({
            color: [0, 0, 255, 0.5],
            width: 1,
          }),
          fill: new window.ol.style.Fill({
            color: [0, 0, 255, 0.3],
          }),
        })
      );

      const vectorLayer = new window.ol.layer.Vector({
        source: new window.ol.source.Vector({
          features: [polygon],
        }),
        zIndex: 2,
      });

      vmap.addLayer(vectorLayer);
      polygonLayerRef.current = vectorLayer;
    } catch (error) {
      console.error("Error initializing VWorld map:", error);
      cleanupMap();
    }

    return () => {
      cleanupMap();
    };
  }, [sideMapData]);

  return (
    <div
      id="vmap_mini"
      style={{
        width: "100%",
        height: "100%",
        cursor: "default",
      }}
    />
  );
}

export default VWorldMapSidebar;

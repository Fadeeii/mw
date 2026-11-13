import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from '../../types';
import { buildGibsTileUrl } from '../../adapters/gibsAdapter';
import { VERIFIED_SCIENTIFIC_ANALOGS } from '../../adapters/candidateAdapter';
import { getPlanetaryLayerById } from '../../adapters/planetaryAdapter';
import { getBasemapById } from '../../adapters/basemapAdapter';

interface Globe3DProps {
  currentDate: string;
  activeLayers: ActiveLayerState[];
  activePlanetaryLayerId: string | null;
  importedCollection: CandidateFeatureCollection | null;
  activeBasemapId: string;
  showFieldAnalogs: boolean;
  onHoverCoord: (coord: Coordinate) => void;
  onClickedCoord: (coord: Coordinate) => void;
  flyToTarget: { lng: number; lat: number; zoom?: number } | null;
  initialCenter?: [number, number];
  initialZoom?: number;
  onCameraChange?: (center: [number, number], zoom: number) => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  currentDate,
  activeLayers,
  activePlanetaryLayerId,
  importedCollection,
  activeBasemapId,
  showFieldAnalogs,
  onHoverCoord,
  onClickedCoord,
  flyToTarget,
  initialCenter = [0, 20],
  initialZoom = 2.2,
  onCameraChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const baseImageryLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const gibsLayersMapRef = useRef<Map<string, Cesium.ImageryLayer>>(new Map());
  const planetaryLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const clickEntityRef = useRef<Cesium.Entity | null>(null);
  const analogEntitiesRef = useRef<Cesium.Entity[]>([]);
  const candidateDataSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);

  const basemap = getBasemapById(activeBasemapId);

  useEffect(() => {
    if (!containerRef.current) return;

    // Explicitly clear Ion token to prevent unauthorized ion asset calls
    Cesium.Ion.defaultAccessToken = '';

    // Convert initial zoom to camera altitude
    const initialAltitude = Math.max(800000, 36000000 / Math.pow(2, initialZoom - 1));

    // Base imagery provider using verified public basemap (ZERO API KEY REQUIRED)
    const baseProvider = new Cesium.UrlTemplateImageryProvider({
      url: basemap.url,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: basemap.maxZoom,
      credit: basemap.attribution
    });

    const baseLayer = new Cesium.ImageryLayer(baseProvider);
    baseImageryLayerRef.current = baseLayer;

    // Initialize Cesium 3D Globe
    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      scene3DOnly: true,
      baseLayer: baseLayer
    });

    // Clean scientific daylight illumination across the globe
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#f2eee8');
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#f4f1ea');

    // Camera initial position
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(initialCenter[0], initialCenter[1], initialAltitude),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });

    // Screen Space Event Handler for Mouse Navigation and Coordinate Picking
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // Track Cursor Hover Coordinates
    handler.setInputAction((movement: { endPosition: Cesium.Cartesian2 }) => {
      const ray = viewer.camera.getPickRay(movement.endPosition);
      if (ray) {
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          onHoverCoord({
            lng: Number(Cesium.Math.toDegrees(carto.longitude).toFixed(5)),
            lat: Number(Cesium.Math.toDegrees(carto.latitude).toFixed(5))
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Left Click Coordinate Pin
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const ray = viewer.camera.getPickRay(click.position);
      if (ray) {
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          const carto = Cesium.Cartographic.fromCartesian(cartesian);
          const lng = Number(Cesium.Math.toDegrees(carto.longitude).toFixed(5));
          const lat = Number(Cesium.Math.toDegrees(carto.latitude).toFixed(5));
          onClickedCoord({ lng, lat });

          if (!clickEntityRef.current) {
            clickEntityRef.current = viewer.entities.add({
              position: cartesian,
              point: {
                pixelSize: 12,
                color: Cesium.Color.fromCssColorString('#8f5635'),
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
              }
            });
          } else {
            clickEntityRef.current.position = new Cesium.ConstantPositionProperty(cartesian);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Notify parent on camera movement
    viewer.camera.changed.addEventListener(() => {
      if (onCameraChange) {
        const carto = viewer.camera.positionCartographic;
        if (carto) {
          const lng = Cesium.Math.toDegrees(carto.longitude);
          const lat = Cesium.Math.toDegrees(carto.latitude);
          const alt = carto.height;
          const zoom = Math.max(1.5, Math.min(18, Math.log2(36000000 / alt) + 1));
          onCameraChange([lng, lat], zoom);
        }
      }
    });

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Update Basemap if changed
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const imageryLayers = viewer.imageryLayers;

    if (baseImageryLayerRef.current) {
      imageryLayers.remove(baseImageryLayerRef.current);
    }

    const newProvider = new Cesium.UrlTemplateImageryProvider({
      url: basemap.url,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      maximumLevel: basemap.maxZoom,
      credit: basemap.attribution
    });

    const newLayer = imageryLayers.addImageryProvider(newProvider, 0); // Always bottom layer
    baseImageryLayerRef.current = newLayer;
  }, [activeBasemapId]);

  // Camera flyTo
  useEffect(() => {
    if (!viewerRef.current || !flyToTarget) return;
    const altitude = Math.max(60000, 36000000 / Math.pow(2, (flyToTarget.zoom ?? 6) - 1));

    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(flyToTarget.lng, flyToTarget.lat, altitude),
      duration: 2.2
    });
  }, [flyToTarget]);

  // Sync NASA GIBS Imagery Overlays
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const imageryLayers = viewer.imageryLayers;

    activeLayers.forEach(({ layer, visible, opacity }) => {
      const tileUrl = buildGibsTileUrl(layer, currentDate);
      let imgLayer = gibsLayersMapRef.current.get(layer.id);

      if (visible) {
        if (!imgLayer) {
          const provider = new Cesium.UrlTemplateImageryProvider({
            url: tileUrl,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: layer.maxZoom,
            credit: 'NASA EOSDIS GIBS'
          });
          imgLayer = imageryLayers.addImageryProvider(provider);
          gibsLayersMapRef.current.set(layer.id, imgLayer);

          // Apply configurable visual enhancement at the rendering layer only.
          // Cesium ImageryLayer properties do not modify source tile data or scientific values.
          const enh = layer.visualEnhancement;
          if (enh && imgLayer) {
            if (enh.cesiumContrast !== undefined)   imgLayer.contrast   = enh.cesiumContrast;
            if (enh.cesiumSaturation !== undefined) imgLayer.saturation = enh.cesiumSaturation;
            if (enh.cesiumGamma !== undefined)      imgLayer.gamma      = enh.cesiumGamma;
            if (enh.cesiumBrightness !== undefined) imgLayer.brightness = enh.cesiumBrightness;
          }
        }
        imgLayer.show = true;
        imgLayer.alpha = opacity;
      } else {
        if (imgLayer) {
          imgLayer.show = false;
        }
      }
    });
  }, [activeLayers, currentDate]);

  // Sync Planetary Basemap (Mars / Moon)
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;
    const imageryLayers = viewer.imageryLayers;

    if (activePlanetaryLayerId) {
      const planConfig = getPlanetaryLayerById(activePlanetaryLayerId);
      if (planConfig) {
        if (planetaryLayerRef.current) {
          imageryLayers.remove(planetaryLayerRef.current);
          planetaryLayerRef.current = null;
        }

        const provider = new Cesium.UrlTemplateImageryProvider({
          url: planConfig.tileUrl,
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 8,
          credit: planConfig.attribution
        });

        planetaryLayerRef.current = imageryLayers.addImageryProvider(provider);
        planetaryLayerRef.current.alpha = 1.0;
      }
    } else {
      if (planetaryLayerRef.current) {
        imageryLayers.remove(planetaryLayerRef.current);
        planetaryLayerRef.current = null;
      }
    }
  }, [activePlanetaryLayerId]);

  // Sync Scientific Analog Markers (Controlled by showFieldAnalogs)
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    // Remove existing analog entities
    analogEntitiesRef.current.forEach(e => viewer.entities.remove(e));
    analogEntitiesRef.current = [];

    if (showFieldAnalogs) {
      VERIFIED_SCIENTIFIC_ANALOGS.forEach((site) => {
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(site.coordinates[0], site.coordinates[1], 100),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#8f5635'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2
          },
          label: {
            text: site.name,
            font: '500 11px Inter, sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.fromCssColorString('#1c2024'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 3,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -9),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 15000000)
          }
        });
        analogEntitiesRef.current.push(entity);
      });
    }
  }, [showFieldAnalogs]);

  // Sync Role 03 Candidate GeoJSON
  useEffect(() => {
    if (!viewerRef.current) return;
    const viewer = viewerRef.current;

    if (importedCollection && importedCollection.features.length > 0) {
      if (candidateDataSourceRef.current) {
        viewer.dataSources.remove(candidateDataSourceRef.current);
        candidateDataSourceRef.current = null;
      }

      Cesium.GeoJsonDataSource.load(importedCollection as any, {
        stroke: Cesium.Color.fromCssColorString('#8f5635'),
        fill: Cesium.Color.fromCssColorString('#8f5635').withAlpha(0.25),
        strokeWidth: 2,
        markerSize: 24,
        markerColor: Cesium.Color.fromCssColorString('#8f5635')
      }).then((ds) => {
        candidateDataSourceRef.current = ds;
        viewer.dataSources.add(ds);
      });
    } else {
      if (candidateDataSourceRef.current) {
        viewer.dataSources.remove(candidateDataSourceRef.current);
        candidateDataSourceRef.current = null;
      }
    }
  }, [importedCollection]);

  return (
    <div className="relative w-full h-full bg-[#f4f1ea]">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

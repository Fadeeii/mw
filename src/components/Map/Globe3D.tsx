import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from '../../types';
import { buildGibsTileUrl } from '../../adapters/gibsAdapter';
import { VERIFIED_SCIENTIFIC_ANALOGS } from '../../adapters/candidateAdapter';
import { getPlanetaryLayerById } from '../../adapters/planetaryAdapter';

interface Globe3DProps {
  currentDate: string;
  activeLayers: ActiveLayerState[];
  activePlanetaryLayerId: string | null;
  importedCollection: CandidateFeatureCollection | null;
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
  onHoverCoord,
  onClickedCoord,
  flyToTarget,
  initialCenter = [0, 20],
  initialZoom = 2.2,
  onCameraChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const gibsLayersMapRef = useRef<Map<string, Cesium.ImageryLayer>>(new Map());
  const planetaryLayerRef = useRef<Cesium.ImageryLayer | null>(null);
  const clickEntityRef = useRef<Cesium.Entity | null>(null);
  const candidateDataSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Disable default Ion token prompt (we use direct open WMTS / OpenStreetMap / CARTO)
    Cesium.Ion.defaultAccessToken = '';

    // Convert initial zoom to camera altitude
    const initialAltitude = Math.max(800000, 36000000 / Math.pow(2, initialZoom - 1));

    // Initialize Cesium 3D Globe with clean CARTO Positron base imagery
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
      baseLayer: new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          tilingScheme: new Cesium.WebMercatorTilingScheme(),
          maximumLevel: 19,
          credit: '© CARTO, © OpenStreetMap contributors'
        })
      )
    });

    // Clean scientific lighting: daylight visible globally for exploration
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
          // Approximate equivalent 2D zoom level from altitude
          const zoom = Math.max(1.5, Math.min(18, Math.log2(36000000 / alt) + 1));
          onCameraChange([lng, lat], zoom);
        }
      }
    });

    // Add Scientific Analog Site markers
    VERIFIED_SCIENTIFIC_ANALOGS.forEach((site) => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(site.coordinates[0], site.coordinates[1], 100),
        point: {
          pixelSize: 9,
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
    });

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Camera flyTo
  useEffect(() => {
    if (!viewerRef.current || !flyToTarget) return;
    const altitude = Math.max(60000, 36000000 / Math.pow(2, (flyToTarget.zoom ?? 6) - 1));

    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(flyToTarget.lng, flyToTarget.lat, altitude),
      duration: 2.2
    });
  }, [flyToTarget]);

  // Sync NASA GIBS Imagery Layers
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

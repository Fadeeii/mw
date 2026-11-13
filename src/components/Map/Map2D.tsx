import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from '../../types';
import { buildGibsTileUrl } from '../../adapters/gibsAdapter';
import { VERIFIED_SCIENTIFIC_ANALOGS } from '../../adapters/candidateAdapter';
import { getPlanetaryLayerById } from '../../adapters/planetaryAdapter';

interface Map2DProps {
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

export const Map2D: React.FC<Map2DProps> = ({
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Professional clean cartographic basemap: CARTO Positron
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-positron': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© CARTO, © OpenStreetMap contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f2eee8' // Warm soft stone ocean
            }
          },
          {
            id: 'carto-positron-layer',
            type: 'raster',
            source: 'carto-positron',
            paint: {
              'raster-opacity': 0.95
            }
          }
        ]
      },
      center: initialCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
    });

    map.on('moveend', () => {
      if (onCameraChange) {
        const center = map.getCenter();
        onCameraChange([center.lng, center.lat], map.getZoom());
      }
    });

    map.on('mousemove', (e) => {
      onHoverCoord({
        lng: Number(e.lngLat.lng.toFixed(5)),
        lat: Number(e.lngLat.lat.toFixed(5))
      });
    });

    map.on('click', (e) => {
      const coord = {
        lng: Number(e.lngLat.lng.toFixed(5)),
        lat: Number(e.lngLat.lat.toFixed(5))
      };
      onClickedCoord(coord);

      // Editorial paper pin indicator
      if (!clickMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full border-2 border-[#8f5635] bg-[#8f5635]/30 shadow-md ring-4 ring-[#8f5635]/20 animate-pulse';
        clickMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([coord.lng, coord.lat])
          .addTo(map);
      } else {
        clickMarkerRef.current.setLngLat([coord.lng, coord.lat]);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Camera flyTo
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 7,
      essential: true,
      duration: 2200
    });
  }, [flyToTarget]);

  // Sync NASA GIBS Layers & Planetary Basemaps
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // 1. Planetary layer
    const planetarySourceId = 'planetary-basemap-source';
    const planetaryLayerId = 'planetary-basemap-layer';

    if (activePlanetaryLayerId) {
      const planConfig = getPlanetaryLayerById(activePlanetaryLayerId);
      if (planConfig) {
        if (!map.getSource(planetarySourceId)) {
          map.addSource(planetarySourceId, {
            type: 'raster',
            tiles: [planConfig.tileUrl],
            tileSize: 256,
            attribution: planConfig.attribution,
            maxzoom: 8
          });
        }

        if (!map.getLayer(planetaryLayerId)) {
          map.addLayer({
            id: planetaryLayerId,
            type: 'raster',
            source: planetarySourceId,
            paint: { 'raster-opacity': 1.0 }
          });
        } else {
          map.setLayoutProperty(planetaryLayerId, 'visibility', 'visible');
        }
      }
    } else {
      if (map.getLayer(planetaryLayerId)) {
        map.setLayoutProperty(planetaryLayerId, 'visibility', 'none');
      }
    }

    // 2. NASA GIBS Layers
    activeLayers.forEach(({ layer, visible, opacity }) => {
      const sourceId = `gibs-source-${layer.id}`;
      const layerId = `gibs-layer-${layer.id}`;
      const tileUrl = buildGibsTileUrl(layer, currentDate);

      const existingSource = map.getSource(sourceId) as maplibregl.RasterTileSource | undefined;

      if (!existingSource) {
        map.addSource(sourceId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution: 'NASA EOSDIS GIBS',
          maxzoom: layer.maxZoom
        });
      } else {
        // @ts-ignore
        if (existingSource.setTiles) {
          // @ts-ignore
          existingSource.setTiles([tileUrl]);
        }
      }

      const existingLayer = map.getLayer(layerId);
      if (!existingLayer) {
        map.addLayer({
          id: layerId,
          type: 'raster',
          source: sourceId,
          layout: {
            visibility: visible ? 'visible' : 'none'
          },
          paint: {
            'raster-opacity': opacity,
            'raster-fade-duration': 250
          }
        });
      } else {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        map.setPaintProperty(layerId, 'raster-opacity', opacity);
      }
    });
  }, [mapLoaded, activeLayers, currentDate, activePlanetaryLayerId]);

  // Scientific Analog Markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    VERIFIED_SCIENTIFIC_ANALOGS.forEach((site) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-[#fcfbf9] border-2 border-[#8f5635] flex items-center justify-center shadow-md group-hover:scale-110 group-hover:border-[#275273] transition-all">
            <div class="w-2 h-2 rounded-full bg-[#8f5635] group-hover:bg-[#275273] transition-colors"></div>
          </div>
          <span class="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded bg-white/95 border border-[#e4dfd5] text-[10px] font-medium text-[#1c2024] shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${site.name}
          </span>
        </div>
      `;

      const popupHtml = `
        <div class="p-3.5 text-xs text-[#1c2024] font-sans max-w-xs leading-normal">
          <div class="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[#8f5635] font-semibold uppercase tracking-wider">
            <span>Verified Terrestrial Analog</span>
          </div>
          <div class="font-serif text-sm font-semibold text-[#1c2024] mb-1">
            ${site.name}
          </div>
          <div class="text-[10px] font-mono text-[#636c76] mb-2">
            ${site.locationName} (${site.coordinates[1]}°, ${site.coordinates[0]}°)
          </div>
          <div class="text-[11px] text-[#4a5058] mb-2.5 leading-relaxed bg-[#f7f5f0] p-2 rounded border border-[#ede9e0]">
            ${site.abstractExcerpt}
          </div>
          <div class="text-[9px] text-[#636c76] border-t border-[#e4dfd5] pt-2">
            <span class="font-semibold text-[#1c2024]">Citation:</span> ${site.literatureCitation}
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16, closeButton: true }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(site.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapLoaded]);

  // Role 03 Candidate GeoJSON
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    const sourceId = 'role03-candidates-source';
    const pointLayerId = 'role03-candidates-points';
    const polyLayerId = 'role03-candidates-polys';

    if (importedCollection && importedCollection.features.length > 0) {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: importedCollection as any
        });

        map.addLayer({
          id: polyLayerId,
          type: 'fill',
          source: sourceId,
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#8f5635',
            'fill-opacity': 0.2,
            'fill-outline-color': '#8f5635'
          }
        });

        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#8f5635',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      } else {
        const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        src.setData(importedCollection as any);
      }
    } else {
      if (map.getLayer(pointLayerId)) map.removeLayer(pointLayerId);
      if (map.getLayer(polyLayerId)) map.removeLayer(polyLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    }
  }, [mapLoaded, importedCollection]);

  return (
    <div className="relative w-full h-full bg-[#f4f1ea]">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

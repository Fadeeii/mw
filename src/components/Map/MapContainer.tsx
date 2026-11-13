import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from '../../types';
import { buildGibsTileUrl } from '../../adapters/gibsAdapter';
import { VERIFIED_SCIENTIFIC_ANALOGS } from '../../adapters/candidateAdapter';
import { getPlanetaryLayerById } from '../../adapters/planetaryAdapter';

interface MapContainerProps {
  isGlobe: boolean;
  currentDate: string;
  activeLayers: ActiveLayerState[];
  activePlanetaryLayerId: string | null;
  importedCollection: CandidateFeatureCollection | null;
  onHoverCoord: (coord: Coordinate) => void;
  onClickedCoord: (coord: Coordinate) => void;
  flyToTarget: { lng: number; lat: number; zoom?: number } | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  isGlobe,
  currentDate,
  activeLayers,
  activePlanetaryLayerId,
  importedCollection,
  onHoverCoord,
  onClickedCoord,
  flyToTarget,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-base': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#030712'
            }
          },
          {
            id: 'osm-base-layer',
            type: 'raster',
            source: 'osm-base',
            paint: {
              'raster-opacity': 0.35,
              'raster-saturation': -0.7
            }
          }
        ]
      },
      center: [-40, 25],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      // @ts-ignore
      projection: {
        type: isGlobe ? 'globe' : 'mercator'
      }
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Track cursor coordinates
    map.on('mousemove', (e) => {
      onHoverCoord({
        lng: Number(e.lngLat.lng.toFixed(5)),
        lat: Number(e.lngLat.lat.toFixed(5))
      });
    });

    // Pin click coordinate
    map.on('click', (e) => {
      const coord = {
        lng: Number(e.lngLat.lng.toFixed(5)),
        lat: Number(e.lngLat.lat.toFixed(5))
      };
      onClickedCoord(coord);

      // Update click marker
      if (!clickMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-500/40 animate-ping';
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

  // Sync 3D Globe vs 2D Mercator projection
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      // @ts-ignore
      mapRef.current.setProjection({
        type: isGlobe ? 'globe' : 'mercator'
      });
    } catch (err) {
      console.warn('Projection switch error:', err);
    }
  }, [isGlobe, mapLoaded]);

  // Sync FlyTo Target
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    mapRef.current.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 7,
      essential: true,
      duration: 2500
    });
  }, [flyToTarget]);

  // Sync NASA GIBS Raster Layers and Planetary Basemap
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Handle Planetary Basemap if enabled
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
        } else {
          const src = map.getSource(planetarySourceId) as maplibregl.RasterTileSource;
          // @ts-ignore
          if (src.setTiles) src.setTiles([planConfig.tileUrl]);
        }

        if (!map.getLayer(planetaryLayerId)) {
          map.addLayer({
            id: planetaryLayerId,
            type: 'raster',
            source: planetarySourceId,
            paint: {
              'raster-opacity': 1.0
            }
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

    // Sync each GIBS layer
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
            'raster-fade-duration': 300
          }
        });
      } else {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        map.setPaintProperty(layerId, 'raster-opacity', opacity);
      }
    });
  }, [mapLoaded, activeLayers, currentDate, activePlanetaryLayerId]);

  // Render Scientific Analog Markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add verified analog markers
    VERIFIED_SCIENTIFIC_ANALOGS.forEach((site) => {
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';
      el.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-sky-500/30 border-2 border-sky-400 flex items-center justify-center text-sky-200 shadow-lg shadow-sky-950/80 hover:scale-125 transition-transform duration-200">
          <div class="w-2 h-2 rounded-full bg-sky-300"></div>
        </div>
      `;

      const popupHtml = `
        <div class="p-2.5 text-xs text-slate-100 font-sans max-w-xs bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
          <div class="font-bold text-sky-300 mb-1 flex items-center gap-1">
            ${site.name}
          </div>
          <div class="text-[10px] text-slate-400 font-mono mb-1.5">
            ${site.locationName} (${site.coordinates[1]}°, ${site.coordinates[0]}°)
          </div>
          <div class="text-[11px] text-slate-300 mb-2">
            ${site.abstractExcerpt}
          </div>
          <div class="text-[9px] font-mono text-emerald-400 bg-slate-950 p-1.5 rounded border border-slate-800">
            Literature: ${site.literatureCitation}
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(site.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapLoaded]);

  // Render Imported Role 03 GeoJSON
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

        // Add polygon fill
        map.addLayer({
          id: polyLayerId,
          type: 'fill',
          source: sourceId,
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#f59e0b',
            'fill-opacity': 0.25,
            'fill-outline-color': '#fbbf24'
          }
        });

        // Add candidate points
        map.addLayer({
          id: pointLayerId,
          type: 'circle',
          source: sourceId,
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 7,
            'circle-color': '#f59e0b',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Click popup on imported candidate
        map.on('click', pointLayerId, (e) => {
          const props = e.features?.[0]?.properties;
          if (props) {
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2 text-xs bg-slate-900 text-slate-100 rounded font-sans">
                  <strong class="text-amber-400 block">${props.name || 'Candidate Discovery'}</strong>
                  <div class="text-[10px] text-slate-400 font-mono mt-1">Source: ${props.source_role || 'Role 03'}</div>
                  ${props.geological_similarity ? `<div class="text-[11px] mt-1 text-slate-300">${props.geological_similarity}</div>` : ''}
                </div>
              `)
              .addTo(map);
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
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-nasa-dark overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

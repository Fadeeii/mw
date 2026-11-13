export interface BasemapConfig {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  attribution: string;
  maxZoom: number;
  type: 'cartographic' | 'satellite';
}

/**
 * 100% Free, Public, Non-Commercial & Educational Basemaps
 * Strictly verified: ZERO API key required, ZERO watermarks, continuous global coverage.
 */
export const VERIFIED_BASEMAPS: BasemapConfig[] = [
  {
    id: 'esri-world-topo',
    name: 'Cartographic Topo Atlas',
    subtitle: 'Light scientific basemap with terrain relief & political boundaries',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea',
    maxZoom: 19,
    type: 'cartographic'
  },
  {
    id: 'nasa-blue-marble',
    name: 'NASA Blue Marble',
    subtitle: 'Official NASA global true-color mosaic with shaded relief & bathymetry',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
    attribution: 'NASA Earth Observatory / EOSDIS GIBS',
    maxZoom: 8,
    type: 'satellite'
  },
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Standard',
    subtitle: 'Global open geographical reference cartography',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    type: 'cartographic'
  }
];

export function getBasemapById(id: string): BasemapConfig {
  return VERIFIED_BASEMAPS.find(b => b.id === id) || VERIFIED_BASEMAPS[0];
}

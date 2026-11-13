export type LayerCategory = 'imagery' | 'environmental' | 'atmosphere' | 'night';

export interface GibsVisualEnhancement {
  /** MapLibre GL raster-contrast paint property: -1 to 1 (0 = neutral, positive = more contrast) */
  contrast?: number;
  /** MapLibre GL raster-saturation paint property: -1 to 1 (0 = neutral, positive = more saturation) */
  saturation?: number;
  /** MapLibre GL raster-brightness-min: 0 to 1 (lifts shadows, 0 = neutral) */
  brightnessMin?: number;
  /** MapLibre GL raster-brightness-max: 0 to 1 (1 = neutral) */
  brightnessMax?: number;
  /** Cesium ImageryLayer contrast: > 0 (1.0 = neutral, > 1 = more contrast) */
  cesiumContrast?: number;
  /** Cesium ImageryLayer saturation: > 0 (1.0 = neutral, > 1 = more saturation) */
  cesiumSaturation?: number;
  /** Cesium ImageryLayer gamma: > 0 (1.0 = neutral, < 1 = brighten midtones) */
  cesiumGamma?: number;
  /** Cesium ImageryLayer brightness: > 0 (1.0 = neutral, > 1 = brighter) */
  cesiumBrightness?: number;
}

export interface GibsLayerConfig {
  id: string;
  title: string;
  subtitle: string;
  category: LayerCategory;
  tileMatrixSet: string;
  format: 'jpg' | 'png';
  crs: string;
  temporal: boolean;
  defaultOpacity: number;
  resolution: string;
  sensor: string;
  description: string;
  scientificNotes: string;
  dataQualityLimitations: string;
  maxZoom: number;
  /**
   * Optional per-layer visual enhancement config.
   * Affects ONLY the rendering pipeline (MapLibre paint props / Cesium ImageryLayer props).
   * Does NOT modify source tile data or scientific measurements.
   */
  visualEnhancement?: GibsVisualEnhancement;
}

export interface ActiveLayerState {
  layer: GibsLayerConfig;
  visible: boolean;
  opacity: number;
  order: number;
}

export type PlanetaryTarget = 'mars' | 'moon';

export interface PlanetaryLayerConfig {
  id: string;
  target: PlanetaryTarget;
  title: string;
  sensor: string;
  mission: string;
  tileUrl: string;
  resolution: string;
  description: string;
  attribution: string;
  geologicalRelevance: string;
}

export interface Coordinate {
  lng: number;
  lat: number;
}

export interface ElevationResult {
  elevationMeters: number | null;
  source: string;
  status: 'idle' | 'loading' | 'success' | 'unavailable' | 'error';
  errorMessage?: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherTelemetry {
  temperature2m: number | null; // Celsius
  precipitationMm: number | null; // mm/day
  relativeHumidity: number | null; // %
  solarRadiation: number | null; // kW-hr/m^2/day
  source: string;
  status: 'idle' | 'loading' | 'success' | 'unavailable' | 'error';
  errorMessage?: string;
  acquisitionDate?: string;
}

export interface ScientificAnalogSite {
  id: string;
  name: string;
  locationName: string;
  coordinates: [number, number]; // [lng, lat]
  planetaryAnalogs: ('Mars' | 'Moon')[];
  analogType: string;
  geologicalFeatures: string[];
  literatureCitation: string;
  doi: string;
  nasaMissionConnection: string;
  verificationStatus: 'peer-reviewed-literature' | 'nasa-analog-mission';
  abstractExcerpt: string;
}

export interface CandidateGeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: {
    id?: string;
    name?: string;
    target?: 'mars' | 'moon' | 'both';
    geological_similarity?: string;
    morphology_class?: string;
    source_role?: string;
    scientific_doi?: string;
    [key: string]: any;
  };
}

export interface CandidateFeatureCollection {
  type: 'FeatureCollection';
  features: CandidateGeoJSONFeature[];
  metadata?: {
    source?: string;
    generated_at?: string;
    role?: string;
    version?: string;
  };
}

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
  boundingBox?: [number, number, number, number]; // [south, north, west, east]
  type?: string;
}

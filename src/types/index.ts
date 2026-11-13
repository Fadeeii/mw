export type LayerCategory = 'imagery' | 'environmental' | 'atmosphere' | 'night';

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

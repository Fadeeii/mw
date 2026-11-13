import { GibsLayerConfig } from '../types';

/**
 * Verified Real NASA GIBS (Global Imagery Browse Services) Layer Catalog
 * Layer identifiers, TileMatrixSets, and formats verified against NASA GIBS EPSG:3857 WMTS schema:
 * https://nasa-gibs.github.io/gibs-api-docs/
 */
export const VERIFIED_GIBS_LAYERS: GibsLayerConfig[] = [
  {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    title: 'MODIS Terra True Color',
    subtitle: 'Daily global daylight surface reflectance (Bands 1, 4, 3)',
    category: 'imagery',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    format: 'jpg',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 1.0,
    resolution: '250m / pixel',
    sensor: 'MODIS on NASA EOS Terra satellite',
    maxZoom: 9,
    description: 'Natural color daylight image composed of red, green, and blue spectral bands (1, 4, and 3). Useful for inspecting macroscopic surface terrain, desert morphologies, and volcanic deposits.',
    scientificNotes: 'Surface reflectance corrected for atmospheric gases and aerosols. Swath observation covers the entire Earth every 1 to 2 days.',
    dataQualityLimitations: 'Sunlight required; obscured by high-altitude meteorological cloud formations and polar winter darkness.'
  },
  {
    id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    title: 'VIIRS Suomi NPP True Color',
    subtitle: 'High-resolution global daily true color (Bands M3, I2, I1)',
    category: 'imagery',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    format: 'jpg',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 1.0,
    resolution: '375m / pixel',
    sensor: 'VIIRS on NASA/NOAA Suomi National Polar-orbiting Partnership (SNPP)',
    maxZoom: 9,
    description: 'Next-generation polar-orbiting imaging radiometer observing Earth surface features, arid desert basins, salt flats, and coastal dunes.',
    scientificNotes: 'Calibrated radiance product combining imagery and moderate resolution bands for land-atmosphere boundary observation.',
    dataQualityLimitations: 'Sensitive to heavy cloud cover and polar twilight geometry.'
  },
  {
    id: 'MODIS_Aqua_CorrectedReflectance_TrueColor',
    title: 'MODIS Aqua True Color',
    subtitle: 'Afternoon orbital pass daylight surface reflectance',
    category: 'imagery',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    format: 'jpg',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 1.0,
    resolution: '250m / pixel',
    sensor: 'MODIS on NASA EOS Aqua satellite',
    maxZoom: 9,
    description: 'Afternoon pass (1:30 PM local equatorial crossing) complementing Terra morning pass. Enables diurnal change detection across candidate analog landscapes.',
    scientificNotes: 'Atmospherically corrected surface reflectance. Useful for diurnal thermal and illumination angle comparison.',
    dataQualityLimitations: 'Daytime only; affected by cloud obscuration.'
  },
  {
    id: 'VIIRS_SNPP_DayNightBand_ENCC',
    title: 'VIIRS Nighttime Day/Night Band',
    subtitle: 'High-sensitivity panchromatic nighttime radiance',
    category: 'night',
    tileMatrixSet: 'GoogleMapsCompatible_Level8',
    format: 'png',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 0.85,
    resolution: '750m / pixel',
    sensor: 'VIIRS Day/Night Band (DNB) on Suomi NPP',
    maxZoom: 8,
    description: 'Measures low-light emissions at night. Detects anthropogenic light sources, gas flares, and nocturnal surface illumination.',
    scientificNotes: 'Dynamic range allows detection from faint airglow to direct moonlight reflection. Radiance unit: Watts/(cm^2 * sr).',
    dataQualityLimitations: 'Moon phase impacts natural nocturnal surface illumination.'
  },
  {
    id: 'MODIS_Terra_Land_Surface_Temp_Day',
    title: 'MODIS Land Surface Temp (Day)',
    subtitle: 'Thermal infrared skin temperature (Daytime)',
    category: 'environmental',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    format: 'png',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 0.75,
    resolution: '1km / pixel',
    sensor: 'MODIS on Terra (Bands 31 and 32 split-window)',
    maxZoom: 7,
    description: 'Daytime radiometric skin temperature of the land surface in Kelvin. Critical for identifying extreme hyper-arid and thermal analog regimes (e.g., Atacama, Lut Desert, Death Valley).',
    scientificNotes: 'Derived from generalized split-window algorithm using thermal infrared radiances.',
    dataQualityLimitations: 'Cloud masks flag unobserved cloudy pixels as transparent.'
  },
  {
    id: 'MODIS_Terra_Land_Surface_Temp_Night',
    title: 'MODIS Land Surface Temp (Night)',
    subtitle: 'Thermal infrared skin temperature (Nocturnal)',
    category: 'environmental',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    format: 'png',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 0.75,
    resolution: '1km / pixel',
    sensor: 'MODIS on Terra (Thermal Infrared)',
    maxZoom: 7,
    description: 'Nocturnal radiometric skin temperature. Reveals surface thermal inertia, bedrock exposure, and permafrost freeze-thaw cycles in polar analog regions.',
    scientificNotes: 'Measures radiative heat release from regolith and rock units after solar radiation ends.',
    dataQualityLimitations: 'Cloud contaminated pixels are masked.'
  },
  {
    id: 'MODIS_Terra_Aerosol',
    title: 'MODIS Terra Aerosol Optical Depth',
    subtitle: 'Green (550 nm) atmospheric aerosol optical thickness',
    category: 'atmosphere',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    format: 'png',
    crs: 'EPSG:3857',
    temporal: true,
    defaultOpacity: 0.7,
    resolution: '10km / pixel',
    sensor: 'MODIS Dark Target and Deep Blue Algorithms',
    maxZoom: 6,
    description: 'Quantifies atmospheric dust loading and particulate attenuation. Crucial for studying active dust lifting and atmospheric saltation in Martian dust-storm analogs.',
    scientificNotes: 'Dimensionless aerosol optical depth (AOD) at 0.55 microns.',
    dataQualityLimitations: 'Bright snow and desert sand require Deep Blue processing; high clouds mask observations.'
  }
];

/**
 * Constructs the standard NASA GIBS EPSG:3857 WMTS Tile URL
 * Structure: https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{format}
 */
export function buildGibsTileUrl(layer: GibsLayerConfig, dateString: string): string {
  const dateParam = layer.temporal ? dateString : 'default';
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.id}/default/${dateParam}/${layer.tileMatrixSet}/{z}/{y}/{x}.${layer.format}`;
}

/**
 * Returns a robust default observation date for NASA GIBS.
 * Satellite processing takes 6-24 hours to generate full global mosaics,
 * so yesterday's date (UTC) ensures full global tile coverage without missing swaths.
 */
export function getReliableGibsDate(offsetDays: number = 1): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().split('T')[0];
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatToIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

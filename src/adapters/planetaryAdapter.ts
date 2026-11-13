import { PlanetaryLayerConfig } from '../types';

/**
 * Verified NASA JPL Solar System Treks WMTS Datasets
 * Official data service: https://trek.nasa.gov/
 * Planetary Coordinate Reference Systems: Mars Sphere / Lunar Sphere (projected to standard cylindrical/mercator tiles)
 */
export const VERIFIED_PLANETARY_LAYERS: PlanetaryLayerConfig[] = [
  {
    id: 'mars_viking_mdim21',
    target: 'mars',
    title: 'Mars Viking MDIM 2.1 Global Mosaic',
    sensor: 'Viking Orbiter Visual Imaging Subsystem (VIS)',
    mission: 'NASA Viking 1 & 2',
    tileUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    resolution: '232 meters / pixel',
    attribution: 'NASA / JPL-Caltech / USGS Astrogeology Science Center',
    description: 'Mars Digital Image Model (MDIM) 2.1 is a radiometrically calibrated, orthorectified global mosaic derived from thousands of Viking Orbiter clear-filter and color images.',
    geologicalRelevance: 'Provides baseline geomorphological reference for impact craters, volcanic shields (Olympus Mons, Tharsis), outflow channels, and dune fields compared to terrestrial analogs.'
  },
  {
    id: 'mars_mgs_mola_shaded',
    target: 'mars',
    title: 'Mars MGS MOLA Topography & Color Shade',
    sensor: 'Mars Orbiter Laser Altimeter (MOLA)',
    mission: 'NASA Mars Global Surveyor (MGS)',
    tileUrl: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    resolution: '463 meters / pixel',
    attribution: 'NASA / Goddard Space Flight Center / MOLA Science Team / JPL',
    description: 'Global shaded relief elevation model generated from over 600 million laser altimeter measurements. Shows the planetary dichotomy between northern lowlands and southern highlands.',
    geologicalRelevance: 'Allows direct hypsometric and slope comparisons between Martian terrain profiles and terrestrial rift valleys, shield volcanoes, and impact structures.'
  },
  {
    id: 'moon_lro_lroc_wac',
    target: 'moon',
    title: 'Moon LRO LROC WAC Global Mosaic',
    sensor: 'Lunar Reconnaissance Orbiter Camera (LROC) Wide Angle Camera (WAC)',
    mission: 'NASA Lunar Reconnaissance Orbiter (LRO)',
    tileUrl: 'https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303color_100m_Jun2013/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    resolution: '100 meters / pixel',
    attribution: 'NASA / Goddard Space Flight Center / Arizona State University',
    description: 'Global 7-band color mosaic acquired by the LROC WAC under low-sun and high-sun illumination conditions.',
    geologicalRelevance: 'Essential baseline for lunar regolith, pyroclastic volcanic deposits, mare basalts, and impact ejecta blankets compared to basaltic lava flows and impact craters on Earth.'
  }
];

export function getPlanetaryLayerById(id: string): PlanetaryLayerConfig | undefined {
  return VERIFIED_PLANETARY_LAYERS.find(layer => layer.id === id);
}

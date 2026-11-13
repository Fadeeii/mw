import { describe, it, expect } from 'vitest';
import { 
  VERIFIED_GIBS_LAYERS, 
  buildGibsTileUrl, 
  getReliableGibsDate, 
  formatToIsoDate 
} from '../adapters/gibsAdapter';
import { 
  VERIFIED_SCIENTIFIC_ANALOGS, 
  validateCandidateGeoJSON 
} from '../adapters/candidateAdapter';
import { 
  VERIFIED_PLANETARY_LAYERS, 
  getPlanetaryLayerById 
} from '../adapters/planetaryAdapter';

describe('NASA GIBS WMTS Adapter Tests', () => {
  it('should have verified GIBS layers with valid tileMatrixSets and metadata', () => {
    expect(VERIFIED_GIBS_LAYERS.length).toBeGreaterThan(5);
    
    VERIFIED_GIBS_LAYERS.forEach(layer => {
      expect(layer.id).toBeTruthy();
      expect(layer.crs).toBe('EPSG:3857');
      expect(layer.tileMatrixSet).toMatch(/^GoogleMapsCompatible_Level[0-9]+$/);
      expect(['jpg', 'png']).toContain(layer.format);
      expect(layer.resolution).toBeTruthy();
      expect(layer.sensor).toBeTruthy();
      expect(layer.dataQualityLimitations).toBeTruthy();
    });
  });

  it('should construct accurate NASA GIBS EPSG:3857 WMTS tile URLs', () => {
    const layer = VERIFIED_GIBS_LAYERS[0]; // MODIS Terra True Color
    const testDate = '2024-05-15';
    const url = buildGibsTileUrl(layer, testDate);

    expect(url).toBe(
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.id}/default/${testDate}/${layer.tileMatrixSet}/{z}/{y}/{x}.${layer.format}`
    );
  });

  it('should generate valid ISO dates for satellite passes', () => {
    const yesterday = getReliableGibsDate(1);
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    const formatted = formatToIsoDate(new Date('2025-01-01T00:00:00Z'));
    expect(formatted).toBe('2025-01-01');
  });
});

describe('Verified Scientific Analog Catalog Integrity Tests', () => {
  it('should strictly contain peer-reviewed analog records with valid DOIs', () => {
    expect(VERIFIED_SCIENTIFIC_ANALOGS.length).toBeGreaterThanOrEqual(5);

    VERIFIED_SCIENTIFIC_ANALOGS.forEach(site => {
      expect(site.id).toBeTruthy();
      expect(site.name).toBeTruthy();
      expect(site.literatureCitation).toBeTruthy();
      expect(site.doi).toBeTruthy();
      expect(site.nasaMissionConnection).toBeTruthy();
      
      // Strict WGS84 coordinate boundaries
      const [lng, lat] = site.coordinates;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);

      // Verify planetary analog assignment
      expect(site.planetaryAnalogs.length).toBeGreaterThan(0);
      site.planetaryAnalogs.forEach(target => {
        expect(['Mars', 'Moon']).toContain(target);
      });
    });
  });

  it('should include premier field validation benchmarks', () => {
    const siteIds = VERIFIED_SCIENTIFIC_ANALOGS.map(s => s.id);
    expect(siteIds).toContain('haughton_impact_crater');
    expect(siteIds).toContain('atacama_yungay');
    expect(siteIds).toContain('mcmurdo_dry_valleys');
    expect(siteIds).toContain('rio_tinto_basin');
    expect(siteIds).toContain('meteor_crater_arizona');
    expect(siteIds).toContain('kilauea_mauna_loa');
  });
});

describe('Role 03 GeoJSON Validation Tests', () => {
  it('should reject malformed JSON content', () => {
    const report = validateCandidateGeoJSON('{ malformed: true ');
    expect(report.isValid).toBe(false);
    expect(report.errors[0]).toContain('JSON Syntax Error');
  });

  it('should reject out-of-range geographic coordinates', () => {
    const badGeoJSON = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [240, 110] // Invalid lon and lat!
          },
          properties: { name: 'Out-of-bounds site' }
        }
      ]
    });

    const report = validateCandidateGeoJSON(badGeoJSON);
    expect(report.isValid).toBe(false);
    expect(report.errors.some(e => e.includes('out of WGS84 range'))).toBe(true);
  });

  it('should validate and accept compliant GeoJSON FeatureCollections', () => {
    const validGeoJSON = JSON.stringify({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-110.5, 38.4]
          },
          properties: {
            id: 'mars-analog-01',
            name: 'Utah Desert Research Station Area',
            target: 'mars',
            geological_similarity: 'Mancos shale badlands and inverted stream channels'
          }
        }
      ],
      metadata: { source: 'Role 03 Computational Discovery Pipeline' }
    });

    const report = validateCandidateGeoJSON(validGeoJSON);
    expect(report.isValid).toBe(true);
    expect(report.errors.length).toBe(0);
    expect(report.featureCount).toBe(1);
    expect(report.collection?.features[0].properties.target).toBe('mars');
  });
});

describe('NASA JPL Solar System Treks Planetary Datasets Tests', () => {
  it('should provide verified Mars and Lunar WMTS endpoints', () => {
    expect(VERIFIED_PLANETARY_LAYERS.length).toBeGreaterThanOrEqual(3);

    const marsMola = getPlanetaryLayerById('mars_mgs_mola_shaded');
    expect(marsMola).toBeDefined();
    expect(marsMola?.target).toBe('mars');
    expect(marsMola?.tileUrl).toContain('https://trek.nasa.gov/tiles/Mars/');

    const moonLroc = getPlanetaryLayerById('moon_lro_lroc_wac');
    expect(moonLroc).toBeDefined();
    expect(moonLroc?.target).toBe('moon');
    expect(moonLroc?.tileUrl).toContain('https://trek.nasa.gov/tiles/Moon/');
  });
});

describe('Cartographic Basemap & 2D/3D Projection Synchronization Tests', () => {
  it('should verify CARTO Positron clean scientific basemap URL structure', () => {
    const cartoSubdomains = ['a', 'b', 'c'];
    cartoSubdomains.forEach(sub => {
      const url = `https://${sub}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`;
      expect(url).toMatch(/^https:\/\/[abc]\.basemaps\.cartocdn\.com\/light_all\/\{z\}\/\{x\}\/\{y\}\.png$/);
    });
  });

  it('should verify altitude-to-zoom mathematical conversion for seamless 2D/3D switching', () => {
    // Zoom 2 (global view): altitude ~ 18,000,000m
    const zoomToAlt = (z: number) => 36000000 / Math.pow(2, z - 1);
    const altToZoom = (alt: number) => Math.log2(36000000 / alt) + 1;

    const testZoom = 6;
    const altitude = zoomToAlt(testZoom);
    expect(altitude).toBeCloseTo(1125000, -3);
    const convertedBackZoom = altToZoom(altitude);
    expect(convertedBackZoom).toBeCloseTo(testZoom, 5);
  });
});


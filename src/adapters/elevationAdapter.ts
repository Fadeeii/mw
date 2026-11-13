import { ElevationResult } from '../types';

/**
 * Real-time Topographic Elevation Service Adapter
 * Queries official USGS Elevation Point Query Service (EPQS) or Open-Elevation (SRTM 30m)
 * Strictly returns observed elevation in meters or reports unavailable state.
 */
export async function queryRealElevation(lat: number, lng: number): Promise<ElevationResult> {
  // Normalize coordinates to 5 decimal places (~1.1 meter precision)
  const normLat = Number(lat.toFixed(5));
  const normLng = Number(lng.toFixed(5));

  // 1. Attempt USGS Elevation Point Query Service (EPQS)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const usgsUrl = `https://epqs.nationalmap.gov/v1/json?x=${normLng}&y=${normLat}&wkid=4326&units=Meters`;
    const res = await fetch(usgsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rawVal = data?.value;
      if (rawVal !== undefined && rawVal !== null && rawVal !== '-1000000' && rawVal !== '') {
        const parsed = parseFloat(rawVal);
        if (!isNaN(parsed) && parsed > -500 && parsed < 9000) {
          return {
            elevationMeters: Math.round(parsed * 10) / 10,
            source: 'USGS 3DEP / National Map EPQS (WGS84)',
            status: 'success',
            latitude: normLat,
            longitude: normLng
          };
        }
      }
    }
  } catch {
    // Failover to secondary global provider
  }

  // 2. Attempt Open-Elevation Service (Global NASA SRTM 30m dataset)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const openElevUrl = `https://api.open-elevation.com/api/v1/lookup?locations=${normLat},${normLng}`;
    const res = await fetch(openElevUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const firstResult = data?.results?.[0];
      if (firstResult && typeof firstResult.elevation === 'number') {
        return {
          elevationMeters: Math.round(firstResult.elevation),
          source: 'Open-Elevation (NASA SRTM 30m Global DEM)',
          status: 'success',
          latitude: normLat,
          longitude: normLng
        };
      }
    }
  } catch (err: any) {
    return {
      elevationMeters: null,
      source: 'USGS EPQS & Open-Elevation',
      status: 'unavailable',
      errorMessage: 'Elevation telemetry service currently unreachable or coordinate outside coverage zone (e.g. deep ocean bathymetry).',
      latitude: normLat,
      longitude: normLng
    };
  }

  return {
    elevationMeters: null,
    source: 'USGS EPQS & Open-Elevation',
    status: 'unavailable',
    errorMessage: 'No terrestrial elevation record returned for this coordinate.',
    latitude: normLat,
    longitude: normLng
  };
}

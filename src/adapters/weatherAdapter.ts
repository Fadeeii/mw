import { WeatherTelemetry } from '../types';

/**
 * Real Atmospheric and Meteorological Surface Telemetry Adapter
 * Interfaces with NASA POWER (Prediction of Worldwide Energy Resources) API (NASA Langley)
 * and Open-Meteo (WMO / ECMWF / NOAA Reanalysis).
 */
export async function queryRealSurfaceTelemetry(lat: number, lng: number): Promise<WeatherTelemetry> {
  const normLat = Number(lat.toFixed(4));
  const normLng = Number(lng.toFixed(4));

  // 1. Attempt Open-Meteo (ECMWF & NOAA GFS real-time reanalysis)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${normLat}&longitude=${normLng}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure&daily=shortwave_radiation_sum&timezone=UTC&forecast_days=1`;
    const res = await fetch(meteoUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data?.current;
      const daily = data?.daily;

      if (current && typeof current.temperature_2m === 'number') {
        const radKwh = daily?.shortwave_radiation_sum?.[0] !== undefined 
          ? Math.round((daily.shortwave_radiation_sum[0] / 3.6) * 100) / 100 // Convert MJ/m2 to kWh/m2
          : null;

        return {
          temperature2m: Math.round(current.temperature_2m * 10) / 10,
          precipitationMm: current.precipitation !== undefined ? Math.round(current.precipitation * 10) / 10 : null,
          relativeHumidity: current.relative_humidity_2m !== undefined ? Math.round(current.relative_humidity_2m) : null,
          solarRadiation: radKwh,
          source: 'WMO / ECMWF ERA5 & NOAA GFS Observational Grid',
          status: 'success',
          acquisitionDate: current.time || new Date().toISOString()
        };
      }
    }
  } catch {
    // Failover to NASA POWER
  }

  // 2. Failover to NASA Langley POWER Project API
  try {
    // NASA POWER MERRA-2 assimilation has ~7 days latency, so pick date 10 days ago
    const pastDate = new Date();
    pastDate.setUTCDate(pastDate.getUTCDate() - 10);
    const dateStr = pastDate.toISOString().split('T')[0].replace(/-/g, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const powerUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=${normLng}&latitude=${normLat}&start=${dateStr}&end=${dateStr}&format=JSON`;
    const res = await fetch(powerUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const params = data?.properties?.parameter;
      if (params) {
        const t2m = params.T2M?.[dateStr];
        const prec = params.PRECTOTCORR?.[dateStr];
        const rh = params.RH2M?.[dateStr];
        const solar = params.ALLSKY_SFC_SW_DWN?.[dateStr];

        if (t2m !== undefined && t2m !== -999) {
          return {
            temperature2m: Math.round(t2m * 10) / 10,
            precipitationMm: prec !== -999 ? Math.round(prec * 10) / 10 : null,
            relativeHumidity: rh !== -999 ? Math.round(rh) : null,
            solarRadiation: solar !== -999 ? Math.round(solar * 100) / 100 : null,
            source: 'NASA Langley Research Center POWER Project (MERRA-2)',
            status: 'success',
            acquisitionDate: pastDate.toISOString().split('T')[0]
          };
        }
      }
    }
  } catch (err: any) {
    return {
      temperature2m: null,
      precipitationMm: null,
      relativeHumidity: null,
      solarRadiation: null,
      source: 'NASA POWER & Open-Meteo',
      status: 'unavailable',
      errorMessage: 'Surface telemetry services currently unreachable or unrecorded for this coordinate.'
    };
  }

  return {
    temperature2m: null,
    precipitationMm: null,
    relativeHumidity: null,
    solarRadiation: null,
    source: 'NASA POWER & Open-Meteo',
    status: 'unavailable',
    errorMessage: 'No atmospheric telemetry record returned for this coordinate.'
  };
}

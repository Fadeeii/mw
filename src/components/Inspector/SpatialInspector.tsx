import React, { useState } from 'react';
import { 
  Crosshair, 
  Mountain, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Loader2, 
  X, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';
import { Coordinate, ElevationResult, WeatherTelemetry } from '../../types';
import { queryRealElevation } from '../../adapters/elevationAdapter';
import { queryRealSurfaceTelemetry } from '../../adapters/weatherAdapter';

interface SpatialInspectorProps {
  clickedCoord: Coordinate | null;
  hoverCoord: Coordinate | null;
  onClose: () => void;
}

export const SpatialInspector: React.FC<SpatialInspectorProps> = ({
  clickedCoord,
  hoverCoord,
  onClose
}) => {
  const [elevation, setElevation] = useState<ElevationResult | null>(null);
  const [telemetry, setTelemetry] = useState<WeatherTelemetry | null>(null);
  const [loadingElev, setLoadingElev] = useState(false);
  const [loadingTelem, setLoadingTelem] = useState(false);

  const activeCoord = clickedCoord || hoverCoord || { lng: 0, lat: 0 };

  const handleQueryElevation = async () => {
    if (!clickedCoord && !hoverCoord) return;
    setLoadingElev(true);
    try {
      const res = await queryRealElevation(activeCoord.lat, activeCoord.lng);
      setElevation(res);
    } catch (err: any) {
      setElevation({
        elevationMeters: null,
        source: 'USGS EPQS & Open-Elevation',
        status: 'error',
        errorMessage: err?.message || 'Network query failed'
      });
    } finally {
      setLoadingElev(false);
    }
  };

  const handleQueryTelemetry = async () => {
    if (!clickedCoord && !hoverCoord) return;
    setLoadingTelem(true);
    try {
      const res = await queryRealSurfaceTelemetry(activeCoord.lat, activeCoord.lng);
      setTelemetry(res);
    } catch (err: any) {
      setTelemetry({
        temperature2m: null,
        precipitationMm: null,
        relativeHumidity: null,
        solarRadiation: null,
        source: 'NASA POWER & Open-Meteo',
        status: 'error',
        errorMessage: err?.message || 'Network query failed'
      });
    } finally {
      setLoadingTelem(false);
    }
  };

  return (
    <div className="absolute top-20 right-6 z-20 w-84 max-w-[calc(100vw-3rem)] bg-white/95 border border-[#e4dfd5] rounded-xl shadow-paper-lg backdrop-blur-md flex flex-col animate-atlas-appear select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#e4dfd5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-[#265434]" />
            <h2 className="font-serif text-sm font-semibold text-[#1c2024]">
              Surface Data Inspector
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#636c76] mt-0.5">
            Target Coordinates & Real-Time Telemetry
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3.5 text-xs">
        {/* Coordinates Section */}
        <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg shadow-pill">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#636c76] uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#275273]" />
              {clickedCoord ? 'Pinned Target' : 'Current Cursor Point'}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-[#636c76] border border-[#ded8cb]">
              WGS 84
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono font-medium">
            <div className="bg-white p-2 rounded border border-[#ede9e0]">
              <span className="text-[9px] text-[#8a94a0] block font-sans uppercase">Latitude</span>
              <span className="text-[#1c2024] font-semibold">{activeCoord.lat.toFixed(5)}°</span>
            </div>
            <div className="bg-white p-2 rounded border border-[#ede9e0]">
              <span className="text-[9px] text-[#8a94a0] block font-sans uppercase">Longitude</span>
              <span className="text-[#1c2024] font-semibold">{activeCoord.lng.toFixed(5)}°</span>
            </div>
          </div>
          {!clickedCoord && (
            <p className="text-[10px] text-[#8a94a0] italic mt-2 text-center">
              Click anywhere on the atlas to pin coordinate telemetry.
            </p>
          )}
        </div>

        {/* Topographic Elevation Query */}
        <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg space-y-2 shadow-pill">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#1c2024] flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-[#8f5635]" />
              Topographic Elevation
            </span>
            <button
              onClick={handleQueryElevation}
              disabled={loadingElev}
              className="text-[10px] font-medium px-2 py-1 rounded bg-white hover:bg-[#f7f5f0] text-[#1c2024] border border-[#ded8cb] flex items-center gap-1 transition disabled:opacity-50 shadow-pill"
            >
              {loadingElev ? <Loader2 className="w-3 h-3 animate-spin text-[#8f5635]" /> : 'Query Elevation'}
            </button>
          </div>

          {elevation ? (
            <div className="bg-white p-2.5 rounded border border-[#ede9e0] space-y-1">
              {elevation.status === 'success' ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#636c76] text-[11px]">Surface Elevation:</span>
                    <span className="text-sm font-bold font-mono text-[#265434]">
                      {elevation.elevationMeters} m
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-[#8a94a0] truncate">
                    Source: {elevation.source}
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-[#8f5635] flex items-start gap-1.5 bg-[#fbf3ed] p-2 rounded border border-[#f0dacb]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{elevation.errorMessage || 'No terrestrial elevation record available for this coordinate.'}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[#8a94a0] italic">
              Queries real USGS 3DEP / Open-Elevation (NASA SRTM 30m).
            </p>
          )}
        </div>

        {/* Surface Environment & Meteorology */}
        <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg space-y-2 shadow-pill">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#1c2024] flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#275273]" />
              Surface Environment
            </span>
            <button
              onClick={handleQueryTelemetry}
              disabled={loadingTelem}
              className="text-[10px] font-medium px-2 py-1 rounded bg-white hover:bg-[#f7f5f0] text-[#1c2024] border border-[#ded8cb] flex items-center gap-1 transition disabled:opacity-50 shadow-pill"
            >
              {loadingTelem ? <Loader2 className="w-3 h-3 animate-spin text-[#275273]" /> : 'Query Telemetry'}
            </button>
          </div>

          {telemetry ? (
            <div className="bg-white p-2.5 rounded border border-[#ede9e0] space-y-2">
              {telemetry.status === 'success' ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#4a5058]">
                      <Thermometer className="w-3.5 h-3.5 text-[#8f5635]" />
                      <span>Temp (2m):</span>
                      <strong className="text-[#1c2024] font-mono">{telemetry.temperature2m}°C</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#4a5058]">
                      <Droplets className="w-3.5 h-3.5 text-[#275273]" />
                      <span>Humidity:</span>
                      <strong className="text-[#1c2024] font-mono">{telemetry.relativeHumidity}%</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#4a5058]">
                      <CloudRain className="w-3.5 h-3.5 text-[#275273]" />
                      <span>Precip:</span>
                      <strong className="text-[#1c2024] font-mono">{telemetry.precipitationMm ?? 0} mm</strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#4a5058]">
                      <Sun className="w-3.5 h-3.5 text-[#9a7522]" />
                      <span>Solar Rad:</span>
                      <strong className="text-[#1c2024] font-mono">{telemetry.solarRadiation ?? 'N/A'} kWh/m²</strong>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-[#8a94a0] truncate pt-1.5 border-t border-[#ede9e0]">
                    Provenance: {telemetry.source}
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-[#8f5635] flex items-start gap-1.5 bg-[#fbf3ed] p-2 rounded border border-[#f0dacb]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{telemetry.errorMessage || 'Atmospheric telemetry currently unavailable for this coordinate.'}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-[#8a94a0] italic">
              Queries real NASA POWER (MERRA-2) & ECMWF surface assimilation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

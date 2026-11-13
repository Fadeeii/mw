import React, { useState } from 'react';
import { Map2D } from './Map2D';
import { Globe3D } from './Globe3D';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from '../../types';

interface SpatialViewportProps {
  isGlobe: boolean;
  currentDate: string;
  activeLayers: ActiveLayerState[];
  activePlanetaryLayerId: string | null;
  importedCollection: CandidateFeatureCollection | null;
  onHoverCoord: (coord: Coordinate) => void;
  onClickedCoord: (coord: Coordinate) => void;
  flyToTarget: { lng: number; lat: number; zoom?: number } | null;
  hoverCoord: Coordinate | null;
}

export const SpatialViewport: React.FC<SpatialViewportProps> = ({
  isGlobe,
  currentDate,
  activeLayers,
  activePlanetaryLayerId,
  importedCollection,
  onHoverCoord,
  onClickedCoord,
  flyToTarget,
  hoverCoord
}) => {
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([0, 20]);
  const [currentZoom, setCurrentZoom] = useState<number>(2.2);

  const handleCameraChange = (center: [number, number], zoom: number) => {
    setCurrentCenter(center);
    setCurrentZoom(zoom);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f4f1ea]">
      {isGlobe ? (
        <Globe3D
          key="cesium-globe"
          currentDate={currentDate}
          activeLayers={activeLayers}
          activePlanetaryLayerId={activePlanetaryLayerId}
          importedCollection={importedCollection}
          onHoverCoord={onHoverCoord}
          onClickedCoord={onClickedCoord}
          flyToTarget={flyToTarget}
          initialCenter={currentCenter}
          initialZoom={currentZoom}
          onCameraChange={handleCameraChange}
        />
      ) : (
        <Map2D
          key="maplibre-2d"
          currentDate={currentDate}
          activeLayers={activeLayers}
          activePlanetaryLayerId={activePlanetaryLayerId}
          importedCollection={importedCollection}
          onHoverCoord={onHoverCoord}
          onClickedCoord={onClickedCoord}
          flyToTarget={flyToTarget}
          initialCenter={currentCenter}
          initialZoom={currentZoom}
          onCameraChange={handleCameraChange}
        />
      )}

      {/* Subtle Coordinate & Datum Pill (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/95 border border-[#e4dfd5] text-[11px] text-[#4a5058] shadow-sm font-mono backdrop-blur-sm pointer-events-none">
        <span className="font-sans font-medium text-[#1c2024]">WGS 84</span>
        <span className="text-[#dcd7cc]">|</span>
        <span>
          {hoverCoord ? (
            `${Math.abs(hoverCoord.lat).toFixed(4)}° ${hoverCoord.lat >= 0 ? 'N' : 'S'}, ${Math.abs(hoverCoord.lng).toFixed(4)}° ${hoverCoord.lng >= 0 ? 'E' : 'W'}`
          ) : (
            'Hover over map to read coordinates'
          )}
        </span>
      </div>
    </div>
  );
};

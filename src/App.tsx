import { useState } from 'react';
import { Header } from './components/Header/Header';
import { SpatialViewport } from './components/Map/SpatialViewport';
import { TimelineBar } from './components/Timeline/TimelineBar';
import { LayerPanel } from './components/Layers/LayerPanel';
import { CandidateManager } from './components/Candidates/CandidateManager';
import { SpatialInspector } from './components/Inspector/SpatialInspector';
import { PlanetaryComparisonModal } from './components/Planetary/PlanetaryComparisonModal';
import { VERIFIED_GIBS_LAYERS, getReliableGibsDate } from './adapters/gibsAdapter';
import { ActiveLayerState, Coordinate, CandidateFeatureCollection } from './types';

export function App() {
  const [isGlobe, setIsGlobe] = useState<boolean>(false); // 2D Atlas by default for continuous cartography, seamless toggle to 3D Globe
  const [currentDate, setCurrentDate] = useState<string>(() => getReliableGibsDate(1));
  const [activePanel, setActivePanel] = useState<'layers' | 'candidates' | 'inspector' | 'planetary' | null>(null);
  const [activePlanetaryLayerId, setActivePlanetaryLayerId] = useState<string | null>(null);
  // 2D map defaults to ESRI cartographic topo; 3D globe defaults to NASA Blue Marble satellite imagery.
  // These are independent so each view can maintain the most appropriate basemap for its geometry.
  const [activeBasemapId2D, setActiveBasemapId2D] = useState<string>('esri-world-topo');
  const [activeBasemapId3D, setActiveBasemapId3D] = useState<string>('nasa-blue-marble');
  const activeBasemapId = isGlobe ? activeBasemapId3D : activeBasemapId2D;
  const [showFieldAnalogs, setShowFieldAnalogs] = useState<boolean>(false); // Default off: map starts clean and uncluttered

  // NASA GIBS layers are independent overlays, initialized disabled by default so the clean basemap is visible
  const [activeLayers, setActiveLayers] = useState<ActiveLayerState[]>(() =>
    VERIFIED_GIBS_LAYERS.map((layer, index) => ({
      layer,
      visible: false, // Independent overlay: user toggles on demand
      opacity: layer.defaultOpacity,
      order: index
    }))
  );

  const [clickedCoord, setClickedCoord] = useState<Coordinate | null>(null);
  const [hoverCoord, setHoverCoord] = useState<Coordinate | null>(null);
  const [importedCollection, setImportedCollection] = useState<CandidateFeatureCollection | null>(null);
  const [flyToTarget, setFlyToTarget] = useState<{ lng: number; lat: number; zoom?: number } | null>(null);

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers(prev =>
      prev.map(item =>
        item.layer.id === layerId ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const handleChangeOpacity = (layerId: string, opacity: number) => {
    setActiveLayers(prev =>
      prev.map(item =>
        item.layer.id === layerId ? { ...item, opacity } : item
      )
    );
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    setActiveLayers(prev => {
      const idx = prev.findIndex(item => item.layer.id === layerId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleFlyToLocation = (lng: number, lat: number, zoom?: number) => {
    setFlyToTarget({ lng, lat, zoom: zoom ?? 8 });
    setClickedCoord({ lng, lat });
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-[#fcfbf9] text-[#1c2024] overflow-hidden font-sans">
      {/* Top Atlas Header */}
      <Header
        isGlobe={isGlobe}
        onToggleProjection={() => setIsGlobe(prev => !prev)}
        activePanel={activePanel}
        onSelectPanel={setActivePanel}
        onFlyToLocation={handleFlyToLocation}
      />

      {/* Main Geographical Canvas (Continuous Basemap + Independent Overlays) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <SpatialViewport
          isGlobe={isGlobe}
          currentDate={currentDate}
          activeLayers={activeLayers}
          activePlanetaryLayerId={activePlanetaryLayerId}
          importedCollection={importedCollection}
          activeBasemapId={activeBasemapId}
          showFieldAnalogs={showFieldAnalogs}
          onHoverCoord={setHoverCoord}
          onClickedCoord={setClickedCoord}
          flyToTarget={flyToTarget}
          hoverCoord={hoverCoord}
        />

        {/* Floating Layer & Basemap Selection Panel */}
        {activePanel === 'layers' && (
          <LayerPanel
            activeLayers={activeLayers}
            activeBasemapId={activeBasemapId}
            onSelectBasemap={(id) => isGlobe ? setActiveBasemapId3D(id) : setActiveBasemapId2D(id)}
            onToggleLayer={handleToggleLayer}
            onChangeOpacity={handleChangeOpacity}
            onMoveLayer={handleMoveLayer}
            onClose={() => setActivePanel(null)}
          />
        )}

        {/* Floating Field Analogs & Ingest Panel */}
        {activePanel === 'candidates' && (
          <CandidateManager
            onFlyToLocation={handleFlyToLocation}
            onImportCandidateCollection={setImportedCollection}
            importedCollection={importedCollection}
            showFieldAnalogs={showFieldAnalogs}
            onToggleFieldAnalogs={() => setShowFieldAnalogs(prev => !prev)}
            onClose={() => setActivePanel(null)}
          />
        )}

        {/* Floating Planetary Context Panel */}
        {activePanel === 'planetary' && (
          <PlanetaryComparisonModal
            activePlanetaryLayerId={activePlanetaryLayerId}
            onSelectPlanetaryLayer={setActivePlanetaryLayerId}
            onClose={() => setActivePanel(null)}
          />
        )}

        {/* Floating Surface Data Inspector */}
        {activePanel === 'inspector' && (
          <SpatialInspector
            clickedCoord={clickedCoord}
            hoverCoord={hoverCoord}
            onClose={() => setActivePanel(null)}
          />
        )}

        {/* Bottom Archival Timeline Bar */}
        <TimelineBar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      </main>
    </div>
  );
}

export default App;

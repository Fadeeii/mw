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
  const [isGlobe, setIsGlobe] = useState<boolean>(false); // 2D Atlas by default for razor-sharp cartography, with 3D Globe toggle
  const [currentDate, setCurrentDate] = useState<string>(() => getReliableGibsDate(1));
  const [activePanel, setActivePanel] = useState<'layers' | 'candidates' | 'inspector' | 'planetary' | null>(null);
  const [activePlanetaryLayerId, setActivePlanetaryLayerId] = useState<string | null>(null);

  // Initialize NASA GIBS layers with MODIS Terra TrueColor enabled by default
  const [activeLayers, setActiveLayers] = useState<ActiveLayerState[]>(() =>
    VERIFIED_GIBS_LAYERS.map((layer, index) => ({
      layer,
      visible: layer.id === 'MODIS_Terra_CorrectedReflectance_TrueColor',
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

      {/* Main Geographical Canvas (Map / Globe) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <SpatialViewport
          isGlobe={isGlobe}
          currentDate={currentDate}
          activeLayers={activeLayers}
          activePlanetaryLayerId={activePlanetaryLayerId}
          importedCollection={importedCollection}
          onHoverCoord={setHoverCoord}
          onClickedCoord={setClickedCoord}
          flyToTarget={flyToTarget}
          hoverCoord={hoverCoord}
        />

        {/* Floating Layer Selection Panel */}
        {activePanel === 'layers' && (
          <LayerPanel
            activeLayers={activeLayers}
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

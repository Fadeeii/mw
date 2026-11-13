import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  Info, 
  CheckCircle2, 
  Orbit 
} from 'lucide-react';
import { VERIFIED_PLANETARY_LAYERS } from '../../adapters/planetaryAdapter';
import { PlanetaryLayerConfig } from '../../types';
import { LayerMetadataModal } from '../Common/LayerMetadataModal';

interface PlanetaryComparisonModalProps {
  activePlanetaryLayerId: string | null;
  onSelectPlanetaryLayer: (layerId: string | null) => void;
  onClose: () => void;
}

export const PlanetaryComparisonModal: React.FC<PlanetaryComparisonModalProps> = ({
  activePlanetaryLayerId,
  onSelectPlanetaryLayer,
  onClose
}) => {
  const [selectedMetaLayer, setSelectedMetaLayer] = useState<PlanetaryLayerConfig | null>(null);

  return (
    <div className="absolute top-20 left-6 z-20 w-96 max-w-[calc(100vw-3rem)] bg-white/95 border border-[#e4dfd5] rounded-xl shadow-paper-lg backdrop-blur-md flex flex-col max-h-[calc(100vh-8rem)] animate-atlas-appear select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#e4dfd5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Orbit className="w-4 h-4 text-[#8f5635]" />
            <h2 className="font-serif text-sm font-semibold text-[#1c2024]">
              Planetary Surface Context
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#636c76] mt-0.5">
            NASA JPL Solar System Treks (Mars & Moon)
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-3.5 flex-1 text-xs">
        {/* Context Note */}
        <div className="bg-[#fbf3ed] border border-[#f0dacb] p-3 rounded-lg text-[11px] text-[#8f5635] leading-relaxed">
          <strong>Comparative Planetology:</strong> Stream genuine orbiter tile pyramids from NASA JPL Solar System Treks directly onto the atlas or globe to examine structural and morphological similarities with terrestrial analog sites.
        </div>

        {/* Planetary Basemaps List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#636c76] uppercase tracking-wider">
              Available Planetary Datasets
            </span>
            {activePlanetaryLayerId && (
              <button
                onClick={() => onSelectPlanetaryLayer(null)}
                className="text-[10px] text-[#275273] hover:underline font-medium"
              >
                Reset to Earth Basemap
              </button>
            )}
          </div>

          {VERIFIED_PLANETARY_LAYERS.map((layer) => {
            const isActive = activePlanetaryLayerId === layer.id;
            return (
              <div
                key={layer.id}
                className={`p-3 rounded-lg border transition ${
                  isActive
                    ? 'bg-[#fbf3ed] border-[#8f5635] shadow-pill'
                    : 'bg-[#fcfbf9] border-[#ded8cb] hover:border-[#8f5635]/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                        layer.target === 'mars' 
                          ? 'bg-[#fbf3ed] text-[#8f5635] border border-[#f0dacb]' 
                          : 'bg-[#edf4f9] text-[#275273] border border-[#bad8e9]'
                      }`}>
                        {layer.target}
                      </span>
                      <h4 className="text-xs font-semibold text-[#1c2024]">{layer.title}</h4>
                    </div>
                    <p className="text-[10px] text-[#636c76] font-mono mt-0.5">{layer.mission}</p>
                  </div>

                  <button
                    onClick={() => setSelectedMetaLayer(layer)}
                    className="p-1 text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] rounded transition"
                    title="Dataset Documentation"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-[#4a5058] mb-2 leading-relaxed">
                  {layer.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#ede9e0]">
                  <span className="text-[9px] font-mono text-[#636c76]">
                    Resolution: {layer.resolution}
                  </span>

                  <button
                    onClick={() => onSelectPlanetaryLayer(isActive ? null : layer.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#8f5635] text-white shadow-pill'
                        : 'bg-white hover:bg-[#f7f5f0] text-[#1c2024] border border-[#ded8cb] shadow-pill'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Projected on Surface
                      </>
                    ) : (
                      'Project on Surface'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparative Geomorphology Matrix */}
        <div className="bg-[#fcfbf9] border border-[#ded8cb] p-3 rounded-lg space-y-2 text-[11px]">
          <h4 className="font-semibold text-[#1c2024] flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono">
            <Compass className="w-3.5 h-3.5 text-[#275273]" />
            Terrestrial-Planetary Analog Benchmarks
          </h4>
          <ul className="space-y-1.5 text-[#4a5058]">
            <li className="flex items-start gap-1.5">
              <span className="text-[#8f5635] font-bold">•</span>
              <span><strong>Meteor Crater (AZ) ↔ Lunar/Martian Impact Craters:</strong> Shock metamorphic quartz, overturned rim stratigraphy, ballistic breccia decay.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#8f5635] font-bold">•</span>
              <span><strong>Atacama Core ↔ Meridiani Planum:</strong> Extreme desiccation, perchlorate-rich regolith, anhydrous iron oxide preservation.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-[#265434] font-bold">•</span>
              <span><strong>Haughton Crater (High Arctic) ↔ Utopia Planitia:</strong> Permafrost ice-wedge polygon networks and gully slope incision.</span>
            </li>
          </ul>
        </div>
      </div>

      {selectedMetaLayer && (
        <LayerMetadataModal
          layer={selectedMetaLayer}
          onClose={() => setSelectedMetaLayer(null)}
        />
      )}
    </div>
  );
};

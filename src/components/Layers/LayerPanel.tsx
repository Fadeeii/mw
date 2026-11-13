import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Sliders, 
  Info, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Sun, 
  Thermometer, 
  Moon, 
  Wind,
  Map as MapIcon,
  Globe
} from 'lucide-react';
import { GibsLayerConfig, ActiveLayerState } from '../../types';
import { LayerMetadataModal } from '../Common/LayerMetadataModal';
import { VERIFIED_BASEMAPS } from '../../adapters/basemapAdapter';

interface LayerPanelProps {
  activeLayers: ActiveLayerState[];
  activeBasemapId: string;
  onSelectBasemap: (id: string) => void;
  onToggleLayer: (layerId: string) => void;
  onChangeOpacity: (layerId: string, opacity: number) => void;
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void;
  onClose: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  activeLayers,
  activeBasemapId,
  onSelectBasemap,
  onToggleLayer,
  onChangeOpacity,
  onMoveLayer,
  onClose,
}) => {
  const [selectedMetaLayer, setSelectedMetaLayer] = useState<GibsLayerConfig | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'imagery' | 'environmental' | 'night' | 'atmosphere'>('all');

  const filteredLayers = activeLayers.filter(item => {
    if (categoryFilter === 'all') return true;
    return item.layer.category === categoryFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'imagery': return <Sun className="w-3.5 h-3.5 text-[#265434]" />;
      case 'environmental': return <Thermometer className="w-3.5 h-3.5 text-[#8f5635]" />;
      case 'night': return <Moon className="w-3.5 h-3.5 text-[#275273]" />;
      case 'atmosphere': return <Wind className="w-3.5 h-3.5 text-[#636c76]" />;
      default: return <Layers className="w-3.5 h-3.5 text-[#636c76]" />;
    }
  };

  return (
    <div className="absolute top-20 left-6 z-20 w-92 max-w-[calc(100vw-3rem)] bg-white/95 border border-[#e4dfd5] rounded-xl shadow-paper-lg backdrop-blur-md flex flex-col max-h-[calc(100vh-8rem)] animate-atlas-appear select-none">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#e4dfd5] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#275273]" />
            <h2 className="font-serif text-sm font-semibold text-[#1c2024]">
              Geospatial Layers & Basemap
            </h2>
          </div>
          <p className="text-[10px] font-mono text-[#636c76] mt-0.5">
            Continuous Basemap + Independent NASA Overlays
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 overflow-y-auto space-y-4 flex-1">
        {/* Section 1: Continuous Basemaps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#636c76] font-semibold flex items-center gap-1">
              <MapIcon className="w-3 h-3 text-[#275273]" />
              Global Continuous Basemap
            </span>
            <span className="text-[9px] font-mono text-[#265434] bg-[#edf5ef] px-1.5 py-0.5 rounded border border-[#bad8c2]">
              Zero API Key Required
            </span>
          </div>

          <div className="space-y-1.5">
            {VERIFIED_BASEMAPS.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelectBasemap(b.id)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-start justify-between ${
                  activeBasemapId === b.id
                    ? 'bg-[#edf4f9] border-[#275273] shadow-pill text-[#1c2024]'
                    : 'bg-[#fcfbf9] border-[#ded8cb] hover:bg-[#f7f5f0] text-[#4a5058]'
                }`}
              >
                <div>
                  <div className="font-medium flex items-center gap-1.5">
                    {b.type === 'satellite' ? <Globe className="w-3.5 h-3.5 text-[#265434]" /> : <MapIcon className="w-3.5 h-3.5 text-[#275273]" />}
                    <span>{b.name}</span>
                  </div>
                  <p className="text-[10px] text-[#636c76] mt-0.5">{b.subtitle}</p>
                </div>
                {activeBasemapId === b.id && (
                  <span className="text-[10px] font-mono text-[#275273] font-semibold">Active</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: NASA GIBS Data Overlays */}
        <div className="pt-3 border-t border-[#ede9e0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#636c76] font-semibold flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#8f5635]" />
              NASA GIBS Data Overlays
            </span>
            <span className="text-[9px] font-mono text-[#636c76]">
              Optional Layers
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="mb-2.5 p-1 bg-[#f7f5f0] border border-[#ede9e0] rounded-lg flex items-center gap-1 overflow-x-auto text-[10px]">
            {(['all', 'imagery', 'environmental', 'night', 'atmosphere'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded capitalize whitespace-nowrap transition font-medium ${
                  categoryFilter === cat
                    ? 'bg-white text-[#1c2024] shadow-pill font-semibold'
                    : 'text-[#636c76] hover:text-[#1c2024]'
                }`}
              >
                {cat === 'imagery' ? 'Reflectance' : cat === 'environmental' ? 'Thermal' : cat}
              </button>
            ))}
          </div>

          {/* Layers List */}
          <div className="space-y-2">
            {filteredLayers.map((item, idx) => {
              const { layer, visible, opacity } = item;
              return (
                <div
                  key={layer.id}
                  className={`p-2.5 rounded-lg border transition ${
                    visible
                      ? 'bg-[#fcfbf9] border-[#275273]/60 shadow-pill'
                      : 'bg-white border-[#ded8cb] opacity-75'
                  }`}
                >
                  {/* Title & Controls */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => onToggleLayer(layer.id)}
                        className={`mt-0.5 p-1 rounded-md transition ${
                          visible
                            ? 'bg-[#edf4f9] text-[#275273] border border-[#b8d4e8]'
                            : 'bg-[#f7f5f0] text-[#8a94a0] border border-[#e4dfd5]'
                        }`}
                        title={visible ? 'Hide Overlay' : 'Show Overlay on Map'}
                      >
                        {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(layer.category)}
                          <h4 className="text-xs font-semibold text-[#1c2024]">{layer.title}</h4>
                          {layer.visualEnhancement && (
                            <span
                              title="Visual contrast enhancement active (rendering only — source data unchanged)"
                              className="text-[9px] font-mono px-1 py-px rounded bg-[#edf5ef] text-[#265434] border border-[#bad8c2] leading-none"
                            >
                              Enhanced
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#636c76] font-mono mt-0.5">{layer.sensor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedMetaLayer(layer)}
                        className="p-1 text-[#636c76] hover:text-[#1c2024] hover:bg-[#f7f5f0] rounded transition"
                        title="View Scientific Specifications"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex flex-col">
                        <button
                          onClick={() => onMoveLayer(layer.id, 'up')}
                          disabled={idx === 0}
                          className="text-[#8a94a0] hover:text-[#1c2024] disabled:opacity-20 transition"
                          title="Move Layer Higher"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onMoveLayer(layer.id, 'down')}
                          disabled={idx === filteredLayers.length - 1}
                          className="text-[#8a94a0] hover:text-[#1c2024] disabled:opacity-20 transition"
                          title="Move Layer Lower"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  {visible && (
                    <div className="mt-2 pt-2 border-t border-[#ede9e0] flex items-center gap-2">
                      <Sliders className="w-3 h-3 text-[#8a94a0]" />
                      <span className="text-[10px] font-mono text-[#636c76] w-9">
                        {Math.round(opacity * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-[#ede9e0] rounded-lg appearance-none cursor-pointer accent-[#275273]"
                      />
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#f7f5f0] text-[#636c76] border border-[#ded8cb]">
                        {layer.resolution}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Layer Scientific Metadata Modal */}
      {selectedMetaLayer && (
        <LayerMetadataModal
          layer={selectedMetaLayer}
          onClose={() => setSelectedMetaLayer(null)}
        />
      )}
    </div>
  );
};
